'use strict';

var aws = require('aws-sdk');
var cloudformation = new aws.CloudFormation({ apiVersion: '2010-05-15' });

module.exports = function _getStack(stackName, callback) {
    cloudformation.describeStacks( { StackName: stackName }, function (error, cfnResponse) {
        if (error && error.message.indexOf('does not exist') === -1) {
            console.log('Error when describing stack', error);
            return callback(error);
        } else if (cfnResponse && cfnResponse.Stacks.length === 1) {
            return callback(null, cfnResponse.Stacks[0]);
        }
        return callback();
    });
};
