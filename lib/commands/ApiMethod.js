'use strict';

var ApiMethodService = require('../service/ApiMethod/ApiMethodService');
var ApiMethodEvent = require('../service/ApiMethod/ApiMethodEvent');
var CloudFormationResourceTracker = require('../service/CloudFormationResourceTracker');

var pub = {};

pub.getParameters = function (event) {
    return ApiMethodEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiMethodService.createMethod(eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.restApiId, eventParams.params.resourceId, eventParams.params.method.httpMethod, callback);
    });
};

pub.deleteResource = function deleteResource(event, context, eventParams, callback) {
    CloudFormationResourceTracker.get(event, context, function (getError, data) {
        if (getError) {
            return callback(getError);
        }
        if (data) {
            ApiMethodService.deleteMethod(eventParams.params.restApiId, eventParams.params.resourceId, event.PhysicalResourceId, function (deleteError) {
                if (deleteError) {
                    return callback(deleteError);
                }
                CloudFormationResourceTracker.delete(event, context, function (error) {
                    return callback(error);
                });
            });
        } else {
            return callback();
        }
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    pub.deleteResource(event, context, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        return pub.createResource(event, context, eventParams, callback);
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(event, context, restApiId, resourceId, httpMethod, callback) {
    ApiMethodService.getForResponse(restApiId, resourceId, httpMethod, function (getError, apiMethod) {
        if (getError) {
            return callback(getError);
        }
        apiMethod.physicalResourceId = resourceId + '/' + httpMethod;
        CloudFormationResourceTracker.put(event, context, httpMethod, function (error) {
            return callback(error, apiMethod);
        });
    });
}
