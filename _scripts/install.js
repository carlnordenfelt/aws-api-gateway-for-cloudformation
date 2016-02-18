'use strict';

var TEMPLATE_NAME = 'ApiGatewayCloudFormation-1.0.0.template';
var STACK_NAME = 'ApiGatewayCloudFormation';
if (process.env.NAME) {
    STACK_NAME = process.env.NAME;
}

var aws = require('aws-sdk');
var cloudformation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
var _getStack = require('./helpers/getStack');
var _getLambdaArn = require('./helpers/getLambdaArn');

console.log('Making sure Api Gateway for CloudFormation has not already been setup');
_getStack(STACK_NAME, function (error, stack) {
    if (error) {
        return process.exit(1);
    } else if (stack) {
        console.log('Api Gateway for CloudFormation has already been installed, continuing');
        return process.exit(0);
    }

    console.log('Installing Api Gateway for CloudFormation');
    var params = {
        StackName: STACK_NAME,
        Capabilities: [
            'CAPABILITY_IAM'
        ],
        OnFailure: 'DELETE',
        TemplateURL: 'https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/' + TEMPLATE_NAME
    };
    cloudformation.createStack(params, function (error, cfnResponse) {
        if (error) {
            console.log('Installation failed, exiting', error);
            return process.exit(1);
        }

        process.stdout.write('Waiting from installation to complete...');
        _waitForStackCompletion(cfnResponse.StackId, function (error, stack) {
            if (error) {
                console.log('Error during installation', error);
                return process.exit(1);
            }
            var lambdaArn = _getLambdaArn(stack);
            console.log('Installation complete. CloudFormation ServiceToken: ', lambdaArn);
        });
    });
});

function _waitForStackCompletion(stackId, callback) {
    _getStack(stackId, function (error, stack) {
        if (error) {
            console.log('Error when describing stack', error);
            return callback(error);
        }

        if (!stack || stack.StackStatus !== 'CREATE_COMPLETE') {
            process.stdout.write('.');
            return setTimeout(function () {
                _waitForStackCompletion(stackId, callback);
            }, 5000);
        } else {
            process.stdout.write('\n');
            callback(null, stack);
        }
    });
}