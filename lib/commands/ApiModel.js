'use strict';

var ApiModelService = require('../service/ApiModel/ApiModelService');
var ApiModelEvent = require('../service/ApiModel/ApiModelEvent');

var pub = {};

pub.getParameters = function (event) {
    return ApiModelEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiModelService.createModel(eventParams.params, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.name, eventParams.params.restApiId, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    ApiModelService.deleteModel(event.PhysicalResourceId, eventParams.params.restApiId, function (error) {
        return callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiModelService.patchModel(event.PhysicalResourceId, eventParams.params.restApiId, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        return getForResponse(event, context, eventParams.params.name, eventParams.params.restApiId, callback);
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(_event, _context, modelName, restApiId, callback) {
    ApiModelService.getForResponse(modelName, restApiId, function (error, apiModel) {
        if (error) {
            return callback(error);
        }
        apiModel.physicalResourceId = apiModel.name;
        return callback(null, apiModel);
    });
}
