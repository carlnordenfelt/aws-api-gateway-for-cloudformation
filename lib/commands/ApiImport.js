'use strict';

var ApiImportService = require('../service/ApiImport/ApiImportService');
var RestApiService = require('../service/RestApi/RestApiService');
var ApiImportEvent = require('../service/ApiImport/ApiImportEvent');

var pub = {};
var VALID_API_ID_REG_EXP = /^[a-zA-Z0-9]+$/;

pub.getParameters = function (event) {
    return ApiImportEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    if (eventParams.params.restApiId) {
        event.PhysicalResourceId = eventParams.restApiId;
        return pub.updateResource(event, context, eventParams, callback);
    }

    ApiImportService.importApi(eventParams.params, function (error, restApi) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, restApi.id, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    if (eventParams.params.restApiId || !VALID_API_ID_REG_EXP.test(event.PhysicalResourceId)) {
        return callback();
    }

    RestApiService.deleteApi(event.PhysicalResourceId, function (error) {
        return callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiImportService.updateApi(event.PhysicalResourceId, eventParams.params, function (error) {
        if (error) {
            return callback(error);
        }
        return getForResponse(event, context, event.PhysicalResourceId, callback);
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
