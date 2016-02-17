'use strict';

var ApiMethodService = require('../service/ApiMethod/ApiMethodService');
var ApiMethodEvent = require('../service/ApiMethod/ApiMethodEvent');

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

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    var httpMethod = _getMethodFromPhysicalResourceId(event.PhysicalResourceId, eventParams.params.method.httpMethod);
    ApiMethodService.deleteMethod(eventParams.params.restApiId, eventParams.params.resourceId, httpMethod, function (error) {
        return callback(error);
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
function getForResponse(_event, _context, restApiId, resourceId, httpMethod, callback) {
    ApiMethodService.getForResponse(restApiId, resourceId, httpMethod, function (error, apiMethod) {
        if (error) {
            return callback(error);
        }
        apiMethod.physicalResourceId = resourceId + '/' + httpMethod;
        return callback(error, apiMethod);
    });
}

function _getMethodFromPhysicalResourceId(physicalResourceId, originalMethod) {
    var parts = physicalResourceId.split('/');
    if (parts.length !== 2) {
        return originalMethod;
    }
    return parts[1];
}
