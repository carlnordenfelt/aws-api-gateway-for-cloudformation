'use strict';

var aws = require('aws-sdk');
var dynamo = new aws.DynamoDB({ apiVersion: '2012-08-10' });
var logger = require('./util/logger');
var pub = {};

pub.put = function (event, context, resourceIdentifier, callback) {
    var params = {
        TableName: 'cfn_api_gateway_resources',
        Item: {
            StackId: { S: event.StackId },
            CloudFormationIdentifier: { S: getCloudFormationIdentifier(event, context) },
            Type: { S: event.ResourceType },
            resourceIdentifier: { S: resourceIdentifier }
        }
    };
    dynamo.putItem(params, function (error) {
        if (error) {
            logger.log('Error CloudFormationResourceTracker::put', error, params);
            return callback(error);
        }
        return callback();
    });
};

pub.get = function (event, context, callback) {
    var params = {
        TableName: 'cfn_api_gateway_resources',
        Key: {
            StackId: { S: event.StackId },
            CloudFormationIdentifier: { S: getCloudFormationIdentifier(event, context) }
        }
    };
    dynamo.getItem(params, function (error, response) {
        if (error) {
            logger.log('Error CloudFormationResourceTracker::get', error, params);
            return callback(error);
        }
        if (response.Item) {
            var item = {
                stackId: response.Item.StackId.S,
                cloudFormationIdentifier: response.Item.CloudFormationIdentifier.S,
                type: response.Item.Type.S,
                resourceIdentifier: response.Item.resourceIdentifier.S
            };
            return callback(undefined, item);
        }
        return callback();
    });
};

pub.delete = function (event, context, callback) {
    var params = {
        TableName: 'cfn_api_gateway_resources',
        Key: {
            StackId: { S: event.StackId },
            CloudFormationIdentifier: { S: getCloudFormationIdentifier(event, context) }
        }
    };
    dynamo.deleteItem(params, function (error) {
        if (error) {
            logger.log('Error CloudFormationResourceTracker::delete', error, params);
            return callback(error);
        }
        return callback();
    });
};

module.exports = pub;

function getCloudFormationIdentifier(event, context) {
    return event.LogicalResourceId + '-' +
        (event.PhysicalResourceId || context.logStreamName);
}
