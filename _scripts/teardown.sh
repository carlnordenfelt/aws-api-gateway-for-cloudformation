#!/bin/sh

. ./config.sh

echo "Deploying Lambda code"

if [[ ${LAMBDA_ARN} != arn* ]] ; then
    echo "make install not run, nothing to teardown";
    exit 1;
fi

aws cloudformation delete-stack --stack-name"${LAMBDA_ARN}"
if [ $? -ne 0 ]; then
    echo "An error occurred while tearing down environment"
else
    sed -i '' "s,LAMBDA_ARN=\"[-a-zA-Z:0-9]*\",LAMBDA_ARN=\"\"," ./config.sh
    echo "Tearing down environment"
    echo "Run make install to reinstall environment"
fi
