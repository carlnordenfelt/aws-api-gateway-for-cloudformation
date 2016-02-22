param([string]$name="ApiGatewayCloudFormation")

lambdaOutputKey="LambdaFunction"
templateName="ApiGatewayCloudFormation-1.0.0.template"

"Making sure AGFCF has not already been installed"
aws cloudformation describe-stacks --stack-name $name --region eu-west-1
if ($?) {
    "Already installed, exiting installation"
    Exit
}

$stackId = &"aws cloudformation create-stack `
    --region eu-west-1 `
    --stack-name $name `
    --template-url https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/$templateName `
    --capabilities CAPABILITY_IAM `
    --output text"

while($true) {
    $status = &aws cloudformation describe-stacks --stack-name $stackId --query Stacks[0].StackStatus --region eu-west-1
    if ($status.IndexOf("CREATE_COMPLETE") > -1) {
        Break;
    } elseif ($status.IndexOf("ROLLBACK") > -1) {
        "Installation failed. See the AWS CloudFormation console for further details"
        Exit
    }
}

$lambdaArn = &aws cloudformation describe-stacks --stack-name $stackId --output text --query "Stacks[0].Outputs[?OutputKey=='$lambdaOutputKey'].{Value:OutputValue}")
"Service Token: $lambdaArn"
