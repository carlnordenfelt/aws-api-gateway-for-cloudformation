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
    var resourceAndMethod = _parsePhysicalResourceId(event.PhysicalResourceId, eventParams.params.resourceId, eventParams.params.method.httpMethod);
    ApiMethodService.deleteMethod(eventParams.params.restApiId, resourceAndMethod.resourceId, resourceAndMethod.httpMethod, function (error) {
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

function _parsePhysicalResourceId(physicalResourceId, eventResourceId, eventHttpMethod) {
    var parts = physicalResourceId.split('/');
    // TODO: Candidate for much harder scrutiny. The HTTP Method can be validated to ensure that it is a proper physicalResourceId
    if (parts.length === 2) {
        return {
            resourceId: parts[0],
            httpMethod: parts[1]
        };
    }
    // Fallback if the PhysicalResourceId appears to be incorrectly formatted.
    // This happens if the create operation fails and CFN makes a subsequent delete call to clean up.
    return {
        resourceId: eventResourceId,
        httpMethod: eventHttpMethod
    };
}
