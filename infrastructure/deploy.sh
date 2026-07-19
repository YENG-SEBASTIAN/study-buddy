#!/usr/bin/env bash
# Packages and deploys the study-buddy CloudFormation stack.
# Usage: ./deploy.sh <knowledge-base-id> <s3-bucket-for-packaging> [model-arn]
# Knowledge Base ID: X7WMDPOCN5
# Packaging bucket: study-buddy-deploy-766696030279

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <knowledge-base-id> <s3-bucket-for-packaging> [model-arn]"
  exit 1
fi

KNOWLEDGE_BASE_ID="$1"
S3_BUCKET="$2"

REGION="us-east-1"
STACK_NAME="study-buddy"
TEMPLATE_FILE="template.yaml"
PACKAGED_FILE="packaged.yaml"

if [[ $# -ge 3 ]]; then
  MODEL_ARN="$3"
else
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  MODEL_ARN="arn:aws:bedrock:${REGION}:${ACCOUNT_ID}:inference-profile/us.meta.llama4-maverick-17b-instruct-v1:0"
fi

echo "Knowledge Base ID: ${KNOWLEDGE_BASE_ID}"
echo "Model ARN:         ${MODEL_ARN}"
echo "Packaging bucket:  ${S3_BUCKET}"
echo "Stack name:        ${STACK_NAME}"
echo

echo "Packaging..."
aws cloudformation package \
  --template-file "${TEMPLATE_FILE}" \
  --s3-bucket "${S3_BUCKET}" \
  --output-template-file "${PACKAGED_FILE}" \
  --region "${REGION}"

echo "Deploying..."
aws cloudformation deploy \
  --template-file "${PACKAGED_FILE}" \
  --stack-name "${STACK_NAME}" \
  --capabilities CAPABILITY_IAM \
  --region "${REGION}" \
  --parameter-overrides \
    KnowledgeBaseId="${KNOWLEDGE_BASE_ID}" \
    ModelArn="${MODEL_ARN}"

echo
echo "Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs" \
  --output table
