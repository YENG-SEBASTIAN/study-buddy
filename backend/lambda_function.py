import json
import os
import boto3

# CloudFormation injects these as environment variables (see the Environment
# block on StudyBuddyFunction in infrastructure/template.yaml). We read them
# once, outside the handler, so they're available on every invocation without
# re-reading os.environ each time.
KB_ID = os.environ["KNOWLEDGE_BASE_ID"]
MODEL_ARN = os.environ["MODEL_ARN"]

# bedrock-agent-runtime is the client for *using* a Knowledge Base (asking it
# questions). This is different from the plain "bedrock-runtime" client,
# which is for calling a foundation model directly with no retrieval step.
# Creating the client here (outside handler) lets Lambda reuse it across
# invocations on a warm container instead of reconnecting every time.
client = boto3.client("bedrock-agent-runtime")


def handler(event, context):
    try:
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
        resp = client.retrieve_and_generate(
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

        return respond(200, {"answer": answer, "sources": sources})

    except Exception as exc:
        # Never leak internal exception details (stack traces, resource IDs)
        # back to the client - log them to CloudWatch instead, where you can
        # look them up, and return a generic message over the API.
        print(f"Error: {exc}")
        return respond(500, {"error": "Something went wrong. Check CloudWatch logs."})


def respond(status_code, payload):
    # AWS_PROXY integrations require the Lambda to return this exact shape -
    # API Gateway copies statusCode/headers/body straight onto the real HTTP
    # response it sends to the browser.
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
