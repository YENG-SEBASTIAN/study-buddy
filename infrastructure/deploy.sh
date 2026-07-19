#!/usr/bin/env bash
#
# Packages and deploys the study-buddy CloudFormation stack.
#
# Usage:
#   ./deploy.sh <knowledge-base-id> <s3-bucket-for-packaging> [model-arn]
#
# Why two required arguments?
#   - knowledge-base-id: the Bedrock Knowledge Base you created in the
#     console. CloudFormation has no way to look this up itself, so it's
#     passed in as a Parameter (see infrastructure/template.yaml).
#   - s3-bucket-for-packaging: `aws cloudformation package` (below) zips up
#     backend/ and uploads it to S3, then rewrites the template to point at
#     that S3 object. It needs *some* bucket to upload to - this isn't
#     created by this script, so use an existing bucket you own or create
#     one first with `aws s3 mb s3://your-bucket-name`.
#
# model-arn is optional because we can build the default ourselves: the
# inference profile ID is fixed (Llama 4 Maverick), only the account ID
# varies per AWS account, and we can fetch that with `aws sts
# get-caller-identity`.

set -euo pipefail # exit immediately on error, on unset variables, or if any
                   # command in a pipeline fails - this stops the script from
                   # ploughing ahead after something goes wrong.

# --- 1. Parse arguments -----------------------------------------------------

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

# --- 2. Work out the model ARN ----------------------------------------------

if [[ $# -ge 3 ]]; then
  MODEL_ARN="$3"
else
  # `aws sts get-caller-identity` asks AWS "who am I?" - it returns the
  # Account, UserId, and Arn of whatever credentials the AWS CLI is
  # currently using. We only need the Account number here, so --query pulls
  # just that field out of the JSON response and --output text strips the
  # surrounding quotes.
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  MODEL_ARN="arn:aws:bedrock:${REGION}:${ACCOUNT_ID}:inference-profile/us.meta.llama4-maverick-17b-instruct-v1:0"
fi

echo "Knowledge Base ID: ${KNOWLEDGE_BASE_ID}"
echo "Model ARN:         ${MODEL_ARN}"
echo "Packaging bucket:  ${S3_BUCKET}"
echo "Stack name:        ${STACK_NAME}"
echo

# --- 3. Package ---------------------------------------------------------
#
# `cloudformation package` finds the local file paths in your template
# (here, `Code: ../backend/` on StudyBuddyFunction), zips them up, uploads
# each zip to the S3 bucket you specify, and writes out a *new* template
# (packaged.yaml) where those local paths have been replaced with
# S3Bucket/S3Key pointers. packaged.yaml is generated output, not something
# you hand-edit - that's why it's in .gitignore.

echo "Packaging..."
aws cloudformation package \
  --template-file "${TEMPLATE_FILE}" \
  --s3-bucket "${S3_BUCKET}" \
  --output-template-file "${PACKAGED_FILE}" \
  --region "${REGION}"

# --- 4. Deploy ---------------------------------------------------------
#
# `cloudformation deploy` takes the packaged template and creates the stack
# if it doesn't exist yet, or submits a "change set" (a diff) and applies it
# if the stack already exists. --capabilities CAPABILITY_IAM is required
# whenever a template creates IAM resources (here, StudyBuddyFunctionRole) -
# it's AWS's way of making you explicitly acknowledge that this deploy will
# create/modify permissions.

echo "Deploying..."
aws cloudformation deploy \
  --template-file "${PACKAGED_FILE}" \
  --stack-name "${STACK_NAME}" \
  --capabilities CAPABILITY_IAM \
  --region "${REGION}" \
  --parameter-overrides \
    KnowledgeBaseId="${KNOWLEDGE_BASE_ID}" \
    ModelArn="${MODEL_ARN}"

# --- 5. Show the outputs -----------------------------------------------
#
# Prints the ApiEndpoint and LambdaFunctionName from the template's Outputs
# section, so you can copy ApiEndpoint straight into frontend/.env.local.

echo
echo "Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs" \
  --output table
