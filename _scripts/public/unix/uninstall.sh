#!/bin/sh

stackName="ApiGatewayCloudFormation"

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

stackId=$(aws cloudformation describe-stacks --stack-name "${stackName}" --output text --query Stacks[0].StackId)
if [ $? -ne 0 ]; then
    echo "AGFCF is not installed under the given name. Exiting"
    exit 0
fi
aws cloudformation delete-stack --stack-name "${stackId}"
if [ $? -ne 0 ]; then
    echo "An error occurred while un-installing"
    exit 1
fi


stackStatus="N/A"
printf "Un-installing..."
while [ "${stackStatus}" != "DELETE_COMPLETE" ]; do
    printf "."
    sleep 5
    stackStatus=$(aws cloudformation describe-stacks --stack-name "${stackId}" --output text --query Stacks[0].StackStatus)
    if [ "${stackStatus}" == "DELETE_FAILED" ]; then
        echo "Un-installation failed. See the AWS CloudFormation Console for detailed information"
        exit 1
    fi
done;

echo "Un-install complete"