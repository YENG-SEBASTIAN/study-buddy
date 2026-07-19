import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key

# CloudFormation injects these as environment variables (see the Environment
# block on StudyBuddyFunction in infrastructure/template.yaml). We read them
# once, outside the handler, so they're available on every invocation without
# re-reading os.environ each time.
KB_ID = os.environ["KNOWLEDGE_BASE_ID"]
MODEL_ARN = os.environ["MODEL_ARN"]
CHAT_HISTORY_TABLE = os.environ["CHAT_HISTORY_TABLE"]
STUDY_NOTES_BUCKET = os.environ["STUDY_NOTES_BUCKET"]

# bedrock-agent-runtime is the client for *using* a Knowledge Base (asking it
# questions). This is different from the plain "bedrock-runtime" client,
# which is for calling a foundation model directly with no retrieval step.
# Creating clients here (outside handler) lets Lambda reuse them across
# invocations on a warm container instead of reconnecting every time.
bedrock = boto3.client("bedrock-agent-runtime")
history_table = boto3.resource("dynamodb").Table(CHAT_HISTORY_TABLE)
s3 = boto3.client("s3")


def handler(event, context):
    # This one Lambda backs all three routes (POST /ask, GET /history,
    # POST /upload) - see infrastructure/template.yaml, where all three
    # routes point at the same LambdaIntegration. HTTP API's payload format
    # 2.0 tells us which route matched via event["routeKey"], so we dispatch
    # on that instead of running three separate functions.
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
        # Never leak internal exception details (stack traces, resource IDs)
        # back to the client - log them to CloudWatch instead, where you can
        # look them up, and return a generic message over the API.
        print(f"Error: {exc}")
        return respond(500, {"error": "Something went wrong. Check CloudWatch logs."})


def handle_ask(event):
    user_id = get_user_id(event)

    # API Gateway (HTTP API, AWS_PROXY integration) hands the Lambda the
    # raw HTTP request as `event`. The JSON body the frontend sent is a
    # *string* under event["body"], so it needs to be parsed. The `or
    # "{}"` guards against a missing/empty body instead of crashing.
    body = json.loads(event.get("body") or "{}")
    question = (body.get("question") or "").strip()

    if not question:
        return respond(400, {"error": "Missing 'question' in request body."})

    # This single call does two jobs at once:
    #   1. Retrieve  - search the Knowledge Base's vector store for the
    #      study-note chunks most relevant to `question`.
    #   2. Generate  - hand those chunks to the model (via ModelArn) as
    #      context, and have it write a natural-language answer grounded
    #      in them, instead of relying on the model's own memory.
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

    # Every citation in the response can reference multiple chunks, and
    # the same source document is often cited more than once. We flatten
    # all of them and dedupe with a set, so the frontend gets a clean
    # list of unique S3 file locations to show as "source" chips.
    sources = sorted({
        ref["location"]["s3Location"]["uri"]
        for citation in resp.get("citations", [])
        for ref in citation.get("retrievedReferences", [])
        if "s3Location" in ref.get("location", {})
    })

    # One item per question asked, keyed by (userId, timestamp) to match
    # ChatHistoryTable's schema - see handle_history for how it's read back.
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

    # Key("userId").eq(user_id) restricts the query to one partition - this
    # is a real DynamoDB Query (fast, cheap), not a Scan (which would read
    # every item in the table). ScanIndexForward=False walks the sort key
    # (timestamp) backwards, so the newest conversations come first.
    resp = history_table.query(
        KeyConditionExpression=Key("userId").eq(user_id),
        ScanIndexForward=False,
        Limit=50,
    )

    return respond(200, {"items": resp.get("Items", [])})


def handle_upload(event):
    # We don't use the sub for anything here, but calling get_user_id still
    # matters: it's what confirms a valid token was presented at all (the
    # JWT authorizer already checked the signature - this just reads it).
    get_user_id(event)

    body = json.loads(event.get("body") or "{}")
    filename = (body.get("filename") or "").strip()

    if not filename:
        return respond(400, {"error": "Missing 'filename' in request body."})

    # A UUID prefix stops two students uploading "notes.pdf" from
    # overwriting each other's file in the shared bucket.
    key = f"uploads/{uuid.uuid4()}-{filename}"

    # generate_presigned_url doesn't call AWS at all - it locally signs a
    # URL that *will* be valid for this specific PUT, for the next 5
    # minutes, using the Lambda's own IAM credentials. The browser then
    # uploads directly to S3 with that URL, so the file's bytes never pass
    # through this Lambda or API Gateway.
    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": STUDY_NOTES_BUCKET, "Key": key},
        ExpiresIn=300,
    )

    return respond(200, {"uploadUrl": url, "key": key})


def get_user_id(event):
    # API Gateway's JWT authorizer validates the token *before* the Lambda
    # ever runs, then attaches its decoded claims here. "sub" (subject) is
    # the stable, unique ID Cognito assigns each user - safe to use as a
    # DynamoDB partition key, unlike email, which a user could change.
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


def respond(status_code, payload):
    # AWS_PROXY integrations require the Lambda to return this exact shape -
    # API Gateway copies statusCode/headers/body straight onto the real HTTP
    # response it sends to the browser.
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
