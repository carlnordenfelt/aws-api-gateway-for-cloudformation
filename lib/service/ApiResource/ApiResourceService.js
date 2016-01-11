'use strict';

var getWrappedService = require('./util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var ApiResourceEvent = require('./ApiResourceEvent');
var Constants = require('../Constants');
var CorsService = require('../Cors/CorsService');
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(restApiId, resourceId, callback) {
    var params = {
        restApiId: restApiId,
        resourceId: resourceId
    };
    awsApiGateway.getResource(params, function (error, apiDomainName) {
        if (error) {
            logger.log('Error ApiResourceService::getForResponse', error, params);
        }
        return callback(error, apiDomainName);
    });
};

/* eslint max-params: 0 */
pub.createResource = function createResource(restApiId, parentResourceId, pathPart, corsConfig, callback) {
    var params = {
        restApiId: restApiId,
        parentId: parentResourceId,
        pathPart: pathPart
    };
    awsApiGateway.createResource(params, function (createError, resource) {
        if (createError) {
            logger.log('Error ApiResourceService::createResource', createError, params);
            return callback(createError);
        }
        if (corsConfig) {
            CorsService.putOptionsMethod(restApiId, resource.id, corsConfig, function (error) {
                if (error) {
                    pub.deleteResource(resource.id, restApiId, function (deleteError) {
                        if (deleteError) {
                            return callback(deleteError);
                        }
                        return callback(error);
                    });
                } else {
                    return callback(undefined, resource.id);
                }
            });
        } else {
            return callback(undefined, resource.id);
        }
    });
};

pub.deleteResource = function deleteResource(resourceId, restApiId, callback) {
    var params = {
        resourceId: resourceId,
        restApiId: restApiId
    };
    awsApiGateway.deleteResource(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiResourceService::deleteResource', error, params);
            return callback(error);
        }
        return callback();
    });
};

pub.patchResource = function patchResource(resourceId, restApiId, eventParams, callback) {
    var patchOperations = ApiResourceEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }

    var params = {
        restApiId: restApiId,
        resourceId: resourceId,
        patchOperations: patchOperations
    };
    awsApiGateway.updateResource(params, function (error, apiResource) {
        if (error) {
            logger.log('Error ApiResourceService::patchResource', error, params);
            return callback(error);
        }
        return callback(undefined, apiResource);
    });
};

pub.getApiParentResource = function getApiParentResource(restApiId, callback) {
    var params = {
        restApiId: restApiId,
        parentId: undefined,
        pathPart: '/'
    };
    pub.getResource(params, undefined, callback);
};

pub.getResource = function getResource(parameters, position, callback) {
    var params = {
        restApiId: parameters.restApiId,
        limit: Constants.LIST_RESOURCES_LIMIT,
        position: position || undefined
    };
    awsApiGateway.getResources(params, function (getResourcesError, response) {
        if (getResourcesError && getResourcesError.code !== 'NotFoundException') {
            logger.log('Error ApiResourceService::getResource', getResourcesError, params);
            return callback(getResourcesError);
        }

        if (response && response.items) {
            var resource;
            var numberOfItems = response.items.length;
            for (var i = 0; i < numberOfItems; i++) {
                if (isMatchingResource(response.items[i])) {
                    resource = response.items[i];
                    break;
                }
            }

            if (resource) {
                return callback(undefined, resource);
            } else if (response.position) {
                return pub.getResource(parameters, response.position, callback);
            }
        }
        return callback();
    });

    function isMatchingResource(resource) {
        var pathPart = resource.pathPart || resource.path;
        return (parameters.parentId === undefined || resource.parentId === parameters.parentId)
            && pathPart === parameters.pathPart;
    }
};

module.exports = pub;
