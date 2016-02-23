param([string]$name="ApiGatewayCloudFormation")

"Making sure AGFCF has not already been installed"
aws cloudformation describe-stacks --stack-name $name
if (!$?) {
    "AGFCF has not been installed, exiting"
    Exit
}

$stackId = &"aws cloudformation delete-stack --stack-name $name
if (!$?) {
    "An error occurred when uninstalling, exiting"
    Exit
}

"Un-installing..."
while($true) {
    $status = &aws cloudformation describe-stacks --stack-name $stackId --query Stacks[0].StackStatus
    if ($status == "DELETE_COMPLETE") {
        Break;
    } elseif ($status == "DELETE_FAILED") {
        "Installation failed. See the AWS CloudFormation console for further details"
        Exit
    }
}

"Un-install complete"
