param([string]$name="ApiGatewayCloudFormation")

$stackId = &"aws" cloudformation describe-stacks --stack-name $name --query Stacks[0].StackId
if (!$?) {
    "AGFCF has not been installed, exiting"
    Exit
}

aws cloudformation delete-stack --stack-name $name 2>&1 | out-null
if (!$?) {
    "An error occurred when uninstalling, exiting"
    Exit
}

"Un-installing..."
while($true) {
    $status = &"aws" cloudformation describe-stacks --stack-name $stackId --query Stacks[0].StackStatus
    "Status: $status"
    if ($status -eq "DELETE_COMPLETE") {
        Break;
    } elseif ($status -eq "DELETE_FAILED") {
        "Installation failed. See the AWS CloudFormation console for further details"
        Exit
    }
    Start-Sleep -s 5
}

"Un-install complete"
