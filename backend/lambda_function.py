import json
import os
import uuid
from datetime import datetime, timezone

import anthropic
import boto3
from boto3.dynamodb.conditions import Key

KB_ID = os.environ["KNOWLEDGE_BASE_ID"]
ANTHROPIC_MODEL = os.environ["ANTHROPIC_MODEL"]
ANTHROPIC_SECRET_NAME = os.environ["ANTHROPIC_SECRET_NAME"]
CHAT_HISTORY_TABLE = os.environ["CHAT_HISTORY_TABLE"]
STUDY_NOTES_BUCKET = os.environ["STUDY_NOTES_BUCKET"]

bedrock_agent = boto3.client("bedrock-agent-runtime")  # retrieval (Retrieve)
history_table = boto3.resource("dynamodb").Table(CHAT_HISTORY_TABLE)
s3 = boto3.client("s3")

# Fetched once per cold start, not per invocation.
_anthropic_api_key = boto3.client("secretsmanager").get_secret_value(
    SecretId=ANTHROPIC_SECRET_NAME
)["SecretString"]
anthropic_client = anthropic.Anthropic(api_key=_anthropic_api_key)

SYSTEM_PROMPT = """\
You are Akosua, an AI study assistant. You are not Madam Akosua herself \
- you are an assistant built in her name by one of her students, to help \
her AWS re/Start cohort study for the AWS Certified Cloud Practitioner exam \
outside of class.

Ground rules:
- Answer only using the CONTEXT block provided with each question. It comes \
from the cohort's own study notes.
- If the answer isn't in the context, say so plainly instead of guessing or \
using outside knowledge - e.g. "I don't see that in the study notes we have."
- Keep answers clear, exam-focused, and encouraging - these are students \
preparing for a real certification.
- You are a study aid, not an official AWS product. If a question hinges on \
something you're unsure of, tell the student to double-check the official \
AWS documentation before the exam.\
"""


def build_user_prompt(context, question):
    return f"Context:\n{context}\n\nQuestion: {question}"


def handler(event, context):
    # One Lambda backs all three routes - dispatch on which one matched.
    route = event.get("routeKey", "")

    try:
        if route == "POST /ask":
            return handle_ask(event)
        if route == "GET /history":
            return handle_history(event)
        if route == "POST /upload":
            return handle_upload(event)
        return respond(404, {"error": "Not found"})

    except Exception as exc:
        print(f"Error: {exc}")
        return respond(500, {"error": "Something went wrong. Check CloudWatch logs."})


def handle_ask(event):
    user_id = get_user_id(event)

    body = json.loads(event.get("body") or "{}")
    question = (body.get("question") or "").strip()

    if not question:
        return respond(400, {"error": "Missing 'question' in request body."})

    # Retrieval stays on Bedrock (the Knowledge Base lives there); generation
    # uses the Claude API instead, since Bedrock model invocation is blocked
    # for this account.
    retrieved = bedrock_agent.retrieve(
        knowledgeBaseId=KB_ID,
        retrievalQuery={"text": question},
    )
    results = retrieved.get("retrievalResults", [])

    context = "\n\n".join(
        r["content"]["text"] for r in results if r.get("content", {}).get("text")
    )
    sources = sorted({
        r["location"]["s3Location"]["uri"]
        for r in results
        if "s3Location" in r.get("location", {})
    })

    generated = anthropic_client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": build_user_prompt(context, question)}],
    )
    answer = next(b.text for b in generated.content if b.type == "text")

    history_table.put_item(Item={
        "userId": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "question": question,
        "answer": answer,
        "sources": sources,
    })

    return respond(200, {"answer": answer, "sources": sources})


def handle_history(event):
    user_id = get_user_id(event)

    resp = history_table.query(
        KeyConditionExpression=Key("userId").eq(user_id),
        ScanIndexForward=False,
        Limit=50,
    )

    return respond(200, {"items": resp.get("Items", [])})


def handle_upload(event):
    get_user_id(event)  # confirms a valid token was presented

    body = json.loads(event.get("body") or "{}")
    filename = (body.get("filename") or "").strip()

    if not filename:
        return respond(400, {"error": "Missing 'filename' in request body."})

    key = f"uploads/{uuid.uuid4()}-{filename}"

    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": STUDY_NOTES_BUCKET, "Key": key},
        ExpiresIn=300,
    )

    return respond(200, {"uploadUrl": url, "key": key})


def get_user_id(event):
    # "sub" is the stable ID the JWT authorizer's verified claims carry.
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


def respond(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
