#!/bin/sh

BASE_STACK_NAME="ApiGatewayCloudFormation"
LAMBDA_OUTPUT_KEY="LambdaFunction"

echo "Making sure Lambda has not already been setup"
aws cloudformation describe-stacks --stack-name ${BASE_STACK_NAME} > /dev/null 2>&1
if [ $? == 0 ]; then
    echo "CloudFormation stack ${BASE_STACK_NAME} already exists. Continuing with deploy..."
    exit 0;
fi

echo "Creating CloudFormation stack"
templateDirectory=$({ pwd; echo "_scripts/install"; } | tr "\n" "/")
stackId=$(aws cloudformation create-stack \
    --stack-name ${BASE_STACK_NAME} \
    --template-body "file:////${templateDirectory}ApiGatewayCloudFormation.template" \
    --capabilities CAPABILITY_IAM \
    --output text)
if [ $? != 0 ]; then
    echo "CloudFormation stack creation failed, exiting"
    exit 1
fi

STACK_STATUS="N/A"
while [ "${STACK_STATUS}" != "CREATE_COMPLETE" ]; do
    echo "Waiting for CloudFormation to complete. Current status: [${STACK_STATUS}]..."
    sleep 10
    STACK_STATUS=$(aws cloudformation describe-stacks --stack-name ${stackId} --output text |head -n1|cut -f7)
    if [ "${STACK_STATUS}" == "ROLLBACK_IN_PROGRESS" ] || [ "${STACK_STATUS}" == "ROLLBACK_COMPLETE" ]; then
        echo "CloudFormation create stack failed. Stack is being deleted. See the CloudFormation Console detailed information."
        exit 1
    fi
done;

echo "CloudFormation stack creation complete: ${stackId}"

lambdaArn="";
while IFS=' ' read -ra outputs; do
    for output in "${outputs[@]}"; do
        key=$(echo "${output}" |cut -f1);
        if [ "${key}" == "${LAMBDA_OUTPUT_KEY}" ]; then
            lambdaArn=$(echo "${output}" |cut -f2);
        fi;
    done;
done <<< "$(aws cloudformation describe-stacks --stack-name ${stackId} --output text --query Stacks[*].Outputs)";

if [ -z "${lambdaArn}" ]; then
    echo "Unable to find Output ${LAMBDA_OUTPUT_KEY}";
    exit 1;
else
    echo "Updating deploy script"
    echo "${lambdaArn}" > './lambda-arn'
fi