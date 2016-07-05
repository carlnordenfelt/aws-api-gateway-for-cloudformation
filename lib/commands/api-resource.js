'use strict';

var ApiResourceService = require('../service/api-resource/api-resource-service');
var ApiResourceEvent = require('../service/api-resource/api-resource-event');
var CorsService = require('../service/Cors/cors-service');

var pub = {};
var VALID_RESOURCE_ID_REG_EXP = /^[a-zA-Z0-9]+$/;

pub.getParameters = function (event) {
    return ApiResourceEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    /*eslint max-len: 0 */
    ApiResourceService.createResource(eventParams.params.restApiId, eventParams.params.parentId, eventParams.params.pathPart, eventParams.params.corsConfiguration, function (error, resourceId) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.restApiId, resourceId, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    if (VALID_RESOURCE_ID_REG_EXP.test(event.PhysicalResourceId)) {
        ApiResourceService.deleteResource(event.PhysicalResourceId, eventParams.params.restApiId, function (error) {
            return callback(error);
        });
    } else {
        return callback();
    }
};

/* eslint max-nested-callbacks: 0 */
pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiResourceService.patchResource(event.PhysicalResourceId, eventParams.params.restApiId, eventParams, function (patchError) {
        if (patchError) {
            return callback(patchError);
        }

        ApiResourceService.getForResponse(eventParams.params.restApiId, event.PhysicalResourceId, function (getForResponseError) {
            if (getForResponseError) {
                return callback(getForResponseError);
            }
            CorsService.updateCorsConfiguration(eventParams, event.PhysicalResourceId, function (corsError) {
                if (corsError) {
                    return callback(corsError);
                }
                getForResponse(event, context, eventParams.params.restApiId, event.PhysicalResourceId, callback);
            });
        });
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(_event, _context, restApiId, resourceId, callback) {
    ApiResourceService.getForResponse(restApiId, resourceId, function (error, apiResource) {
        if (error) {
            return callback(error);
        }
        apiResource.physicalResourceId = apiResource.id;
        return callback(error, apiResource);
    });
}
