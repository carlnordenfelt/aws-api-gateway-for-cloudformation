'use strict';

var RestApiService = require('../service/rest-api/rest-api-service');
var RestApiEvent = require('../service/rest-api/rest-api-event');
var CorsService = require('../service/Cors/cors-service');

var pub = {};

pub.getParameters = function (event) {
    return RestApiEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    RestApiService.createApi(eventParams.params, function (error, restApi) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, restApi.id, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, _eventParams, callback) {
    RestApiService.deleteApi(event.PhysicalResourceId, function (error) {
        return callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    RestApiService.patchApi(event.PhysicalResourceId, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, event.PhysicalResourceId, function (getError, restApiWithParentId) {
            if (getError) {
                return callback(getError);
            }
            eventParams.params.restApiId = event.PhysicalResourceId;
            CorsService.updateCorsConfiguration(eventParams, restApiWithParentId.parentResourceId, function (corsError) {
                return callback(corsError, restApiWithParentId);
            });
        });
    });
};

module.exports = pub;

function getForResponse(_event, _context, restApiId, callback) {
    RestApiService.getForResponse(restApiId, function (error, restApi) {
        if (error) {
            return callback(error);
        }
        restApi.physicalResourceId = restApi.id;
        return callback(error, restApi);
    });
}
