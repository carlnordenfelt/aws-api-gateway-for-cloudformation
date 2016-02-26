#!/bin/sh

lambdaOutputKey="LambdaFunction"
templateName="ApiGatewayCloudFormation-1.0.0.template"

version="latest"
stackName="ApiGatewayCloudFormation"
while getopts ":n:v:" opt; do
  case ${opt} in
    n)
        stackName="${OPTARG}"
    ;;
    v)
        version="${OPTARG}"
    ;;
    \?)
        echo "Invalid argument: -$OPTARG" >&2
        exit 1;
    ;;
  esac
done

lambdaArn=$(aws cloudformation describe-stacks --stack-name ${stackName} --output text --query "Stacks[0].Outputs[?OutputKey=='${lambdaOutputKey}'].{Value:OutputValue}")
if [ "${lambdaArn}" == "" ]; then
    echo "You have to run make install before deploying";
    exit 1;
fi

rm -f ${version}
curl -O -L http://apigatewaycloudformation.s3-website-eu-west-1.amazonaws.com/builds/${version}
aws lambda update-function-code --function-name "${lambdaArn}" --zip-file fileb://${version} --publish

if [ $? -ne 0 ]; then
    echo "An error occurred when updating Lambda code"
    rm -f ${version}
    exit 1;
else
    echo "ApiGateway for CloudFormation has been updated"
    echo "ServiceToken for CloudFormation: ${lambdaArn}"
    rm -f ${version}
fi