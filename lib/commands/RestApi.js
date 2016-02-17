'use strict';

var RestApiService = require('../service/RestApi/RestApiService');
var RestApiEvent = require('../service/RestApi/RestApiEvent');

var pub = {};

pub.getParameters = function (event) {
    return RestApiEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    RestApiService.createApi(eventParams.params.name, eventParams.params.description, function (error, restApi) {
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
    RestApiService.patchApi(event.PhysicalResourceId, eventParams, function (error, restApi) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, restApi.id, callback);
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
