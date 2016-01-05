#!/bin/sh

LAMBDA_ARN=$(cat "./_scripts/lambda-arn")

echo "Deploying Lambda code"

if [[ ${LAMBDA_ARN} != arn* ]] ; then
    echo "You have to run make install before deploying";
    exit 1;
fi

aws lambda update-function-code --function-name "${LAMBDA_ARN}" --zip-file fileb://package.zip

echo "Lambda updated"
echo "ServiceToken for CloudFormation: ${LAMBDA_ARN}"
