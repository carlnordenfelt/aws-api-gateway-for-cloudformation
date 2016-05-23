'use strict';

var ApiMethodService = require('../service/ApiMethod/ApiMethodService');
var ApiMethodEvent = require('../service/ApiMethod/ApiMethodEvent');

var pub = {};

pub.getParameters = function (event) {
    return ApiMethodEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiMethodService.createMethod(eventParams, function (error, apiMethod) {
        if (error) {
            // If apiMethod is returned it means that the method was created but something went wrong after
            // If this is the case we want the subsequent delete request to delete the method.
            // Otherwise, the method should not be touched (it's either not created or it is in fact another method (Conflict error)
            if (apiMethod) {
                if (typeof error === 'string') { // Sanity check
                    error = {
                        message: error
                    };
                }
                error.physicalResourceId = eventParams.params.resourceId + '/' + eventParams.params.method.httpMethod;
            }
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.restApiId, eventParams.params.resourceId, eventParams.params.method.httpMethod, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    var resourceAndMethod = _parsePhysicalResourceId(event.PhysicalResourceId);
    if (resourceAndMethod) {
        ApiMethodService.deleteMethod(eventParams.params.restApiId, resourceAndMethod.resourceId, resourceAndMethod.httpMethod, function (error) {
            return callback(error);
        });
        return;
    }
    callback();
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    var resourceAndMethod = _parsePhysicalResourceId(event.PhysicalResourceId);
    if (resourceAndMethod) {
        pub.deleteResource(event, context, eventParams, function (error) {
            if (error) {
                return callback(error);
            }
            return pub.createResource(event, context, eventParams, callback);
        });
        return;
    }
    callback('Resource not found');
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

function _parsePhysicalResourceId(physicalResourceId) {
    var parts = physicalResourceId.split('/');
    if (parts.length === 2) {
        return {
            resourceId: parts[0],
            httpMethod: parts[1]
        };
    }
}
