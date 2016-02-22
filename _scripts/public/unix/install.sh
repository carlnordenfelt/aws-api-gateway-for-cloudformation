#!/bin/sh

stackName="ApiGatewayCloudFormation"
lambdaOutputKey="LambdaFunction"
templateName="ApiGatewayCloudFormation-1.0.0.template"

while getopts ":n:" opt; do
  case ${opt} in
    n)
        stackName="$OPTARG"
    ;;
    \?)
        echo "Invalid argument: -$OPTARG" >&2
        exit 1;
    ;;
  esac
done

echo "Making sure AGFCF has not already been installed"
aws cloudformation describe-stacks --stack-name ${stackName} > /dev/null 2>&1
if [ $? == 0 ]; then
    echo "Installation already complete, exiting"
    exit 0;
fi

stackId=$(aws cloudformation create-stack \
    --stack-name ${stackName} \
    --template-url "https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/${templateName}" \
    --capabilities CAPABILITY_IAM \
    --output text)
if [ $? != 0 ]; then
    echo "Installation failed"
    exit 1
fi

stackStatus="N/A"
printf "Installing..."
while [ "${stackStatus}" != "CREATE_COMPLETE" ]; do
    printf "."
    sleep 5
    stackStatus=$(aws cloudformation describe-stacks --stack-name ${stackId} --output text --query Stacks[0].StackStatus)
    if [ "${stackStatus}" == "ROLLBACK_IN_PROGRESS" ] || [ "${stackStatus}" == "ROLLBACK_COMPLETE" ]; then
        echo "Installation failed. See the AWS CloudFormation Console for detailed information"
        exit 1
    fi
done;
echo "Installation complete"

lambdaArn=$(aws cloudformation describe-stacks --stack-name ${stackId} --output text --query "Stacks[0].Outputs[?OutputKey=='${lambdaOutputKey}'].{Value:OutputValue}")
echo "Service Token: ${lambdaArn}"