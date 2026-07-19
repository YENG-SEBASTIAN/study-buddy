import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key

KB_ID = os.environ["KNOWLEDGE_BASE_ID"]
MODEL_ARN = os.environ["MODEL_ARN"]
CHAT_HISTORY_TABLE = os.environ["CHAT_HISTORY_TABLE"]
STUDY_NOTES_BUCKET = os.environ["STUDY_NOTES_BUCKET"]

bedrock = boto3.client("bedrock-agent-runtime")
history_table = boto3.resource("dynamodb").Table(CHAT_HISTORY_TABLE)
s3 = boto3.client("s3")


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

    resp = bedrock.retrieve_and_generate(
        input={"text": question},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KB_ID,
                "modelArn": MODEL_ARN,
            },
        },
    )

    answer = resp["output"]["text"]

    sources = sorted({
        ref["location"]["s3Location"]["uri"]
        for citation in resp.get("citations", [])
        for ref in citation.get("retrievedReferences", [])
        if "s3Location" in ref.get("location", {})
    })

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
