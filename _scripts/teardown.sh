#!/bin/sh

LAMBDA_ARN=$(cat "./_scripts/lambda-arn")

echo "Tearing down CloudFormation stack"

if [[ ${LAMBDA_ARN} != arn* ]] ; then
    echo "make install not run, nothing to teardown";
    exit 1;
fi

aws cloudformation delete-stack --stack-name "${LAMBDA_ARN}"
if [ $? -ne 0 ]; then
    echo "An error occurred while tearing down environment"
else
    rm -f lambda-arn
    echo "Tearing down environment"
    echo "Run make install to reinstall environment"
fi
