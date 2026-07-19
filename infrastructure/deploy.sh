#!/usr/bin/env bash
# Packages and deploys the study-buddy CloudFormation stack.
# Usage: ./deploy.sh <knowledge-base-id> <s3-bucket-for-packaging>
# Knowledge Base ID: X7WMDPOCN5
# Packaging bucket: study-buddy-deploy-766696030279

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <knowledge-base-id> <s3-bucket-for-packaging>"
  exit 1
fi

KNOWLEDGE_BASE_ID="$1"
S3_BUCKET="$2"

REGION="us-east-1"
STACK_NAME="study-buddy"
TEMPLATE_FILE="template.yaml"
PACKAGED_FILE="packaged.yaml"

echo "Knowledge Base ID: ${KNOWLEDGE_BASE_ID}"
echo "Packaging bucket:  ${S3_BUCKET}"
echo "Stack name:        ${STACK_NAME}"
echo

BACKEND_DIR="../backend"
BACKEND_SOURCE_FILES=(lambda_function.py pre_signup.py requirements.txt)

# Runs on exit (success, failure, or Ctrl-C) so backend/ never stays dirty -
# pip installs its deps flat alongside the source files (required for a
# Lambda zip with no layer), then this strips everything back off once
# they're packaged.
clean_backend_deps() {
  for entry in "${BACKEND_DIR}"/*; do
    name="$(basename "$entry")"
    for keep in "${BACKEND_SOURCE_FILES[@]}"; do
      [[ "$name" == "$keep" ]] && continue 2
    done
    rm -rf "$entry"
  done
}
trap clean_backend_deps EXIT

echo "Installing Lambda dependencies..."
pip3 install -r "${BACKEND_DIR}/requirements.txt" -t "${BACKEND_DIR}" --upgrade --quiet

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
    KnowledgeBaseId="${KNOWLEDGE_BASE_ID}"

echo
echo "Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs" \
  --output table
