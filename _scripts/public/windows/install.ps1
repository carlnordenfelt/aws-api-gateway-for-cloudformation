param([string]$name="ApiGatewayCloudFormation")

$lambdaOutputKey="LambdaFunction"
$templateName="ApiGatewayCloudFormation-1.0.0.template"

"Making sure AGFCF has not already been installed"
aws cloudformation describe-stacks --stack-name $name 2>&1 | out-null
if ($?) {
    "Already installed, exiting installation"
    Exit
}

$stackId = &"aws" cloudformation create-stack --stack-name $name --template-url https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/$templateName --capabilities CAPABILITY_IAM --output text

"Installing..."
while($true) {
    $status = &"aws" cloudformation describe-stacks --stack-name $stackId --output text --query Stacks[0].StackStatus
    "Status: $status"
    if ($status.Equals("CREATE_COMPLETE")) {
        Break;
    } elseif ($status.IndexOf("ROLLBACK") -gt -1) {
        "Installation failed. See the AWS CloudFormation console for further details"
        Exit
    }
    Start-Sleep -s 10
}
"Installation complete"

$lambdaArn = &"aws" cloudformation describe-stacks --stack-name $stackId --output text --query "Stacks[0].Outputs[?OutputKey=='$lambdaOutputKey'].{Value:OutputValue}"
"Service Token: $lambdaArn"
