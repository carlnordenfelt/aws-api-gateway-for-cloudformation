'use strict';

var STACK_NAME = 'ApiGatewayCloudFormation';

var aws = require('aws-sdk');
var cloudformation = new aws.CloudFormation({ apiVersion: '2010-05-15' });

console.log('Uninstalling Api Gateway for CloudFormation');
cloudformation.deleteStack({ StackName: STACK_NAME }, function (error) {
    if (error) {
        console.log('Error when uninstalling', error);
        return process.exit(1);
    }
    console.log('Api Gateway for CloudFormation is being uninstalled, this may take a minute to complete');
});