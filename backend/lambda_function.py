import json
import os
import boto3

KB_ID = os.environ["KNOWLEDGE_BASE_ID"]
MODEL_ARN = os.environ["MODEL_ARN"]

client = boto3.client("bedrock-agent-runtime")


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
        question = (body.get("question") or "").strip()

        if not question:
            return respond(400, {"error": "Missing 'question' in request body."})

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
        sources = sorted({
            ref["location"]["s3Location"]["uri"]
            for citation in resp.get("citations", [])
            for ref in citation.get("retrievedReferences", [])
            if "s3Location" in ref.get("location", {})
        })

        return respond(200, {"answer": answer, "sources": sources})

    except Exception as exc:
        print(f"Error: {exc}")
        return respond(500, {"error": "Something went wrong. Check CloudWatch logs."})


def respond(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }