'use strict';

var version = process.env.VERSION;
if (!version) {
    var pkg = require('./package.json');
    version = 'v' + pkg.version;
}

var STACK_NAME = 'ApiGatewayCloudFormation';
if (process.env.NAME) {
    STACK_NAME = process.env.NAME;
}

var aws = require('aws-sdk');
var lambda = new aws.Lambda({ apiVersion: '2015-03-31' });

var path = require('path');
var _getStack = require('./helpers/getStack');
var _getLambdaArn = require('./helpers/getLambdaArn');

console.log('Fetching installation information');
_getStack(STACK_NAME, function (error, stack) {
    if (error) {
        return process.exit(1);
    } else if (!stack) {
        console.log('Api Gateway for CloudFormation has not been installed, please run "npm run installation" before proceeding');
        return process.exit(0);
    }
    var lambdaArn = _getLambdaArn(stack);
    _updateLambdaCode(lambdaArn, function (error) {
        if (error) {
            return process.exit(1);
        }
        console.log('Api Gateway for CloudFormation has been updated to version ' + version);
    });
});

function _updateLambdaCode(lambdaArn, callback) {
    var params = {
        FunctionName: lambdaArn,
        Publish: true,
        S3Bucket: 'apigatewaycloudformation',
        S3Key: 'builds/' + version + '.zip'
    };
    lambda.updateFunctionCode(params, function(error) {
        if  (error) {
            console.log('Error when deploying code', error);
        }
        callback(error);
    });
}