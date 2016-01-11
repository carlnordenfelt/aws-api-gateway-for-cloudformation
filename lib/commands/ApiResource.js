'use strict';

var ApiResourceService = require('../service/ApiResource/ApiResourceService');
var ApiResourceEvent = require('../service/ApiResource/ApiResourceEvent');
var CorsService = require('../service/Cors/CorsService');
var CloudFormationResourceTracker = require('../service/CloudFormationResourceTracker');
var logger = require('../service/util/logger');

var pub = {};

pub.getParameters = function (event) {
    return ApiResourceEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    /*eslint max-len: 0 */
    ApiResourceService.createResource(eventParams.params.restApiId, eventParams.params.parentId, eventParams.params.pathPart, eventParams.params.corsConfig, function (error, resourceId) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.restApiId, resourceId, callback);
    });
};

pub.deleteResource = function deleteResource(event, context, eventParams, callback) {
    CloudFormationResourceTracker.get(event, context, function (getError, apiResourceEntry) {
        if (getError) {
            return callback(getError);
        }
        if (apiResourceEntry) {
            ApiResourceService.deleteResource(event.PhysicalResourceId, eventParams.params.restApiId, function (deleteError) {
                if (deleteError) {
                    return callback(deleteError);
                }
                CloudFormationResourceTracker.delete(event, context, function (error) {
                    return callback(error);
                });
            });
        } else {
            logger.log('API Resource not found, returning');
            return callback();
        }
    });
};

/* eslint max-nested-callbacks: 0 */
pub.updateResource = function updateResource(event, context, eventParams, callback) {
    CloudFormationResourceTracker.get(event, context, function (getError, apiResourceEntry) {
        if (getError) {
            return callback(getError);
        }
        if (apiResourceEntry) {
            ApiResourceService.patchResource(event.PhysicalResourceId, eventParams.params.restApiId, eventParams, function (patchError) {
                if (patchError) {
                    return callback(patchError);
                }

                ApiResourceService.getForResponse(eventParams.params.restApiId, apiResourceEntry.resourceIdentifier, function (getForResponseError) {
                    if (getForResponseError) {
                        return callback(getForResponseError);
                    }
                    CorsService.updateCorsConfiguration(eventParams, apiResourceEntry.resourceIdentifier, function (corsError) {
                        if (corsError) {
                            return callback(corsError);
                        }
                        getForResponse(event, context, eventParams.params.restApiId, apiResourceEntry.resourceIdentifier, callback);
                    });
                });
            });
        } else {
            return callback('API Resource not found');
        }
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(event, context, restApiId, resourceId, callback) {
    ApiResourceService.getForResponse(restApiId, resourceId, function (getError, apiResource) {
        if (getError) {
            return callback(getError);
        }
        apiResource.physicalResourceId = apiResource.id;
        CloudFormationResourceTracker.put(event, context, apiResource.id, function (error) {
            return callback(error, apiResource);
        });
    });
}
