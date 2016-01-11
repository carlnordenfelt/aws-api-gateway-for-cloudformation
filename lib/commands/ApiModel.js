'use strict';

var ApiModelService = require('../service/ApiModel/ApiModelService');
var ApiModelEvent = require('../service/ApiModel/ApiModelEvent');
var CloudFormationResourceTracker = require('../service/CloudFormationResourceTracker');
var logger = require('../service/util/logger');

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

pub.deleteResource = function deleteResource(event, context, eventParams, callback) {
    CloudFormationResourceTracker.get(event, context, function (getError, apiModelEntry) {
        if (getError) {
            return callback(getError);
        }

        if (apiModelEntry) {
            ApiModelService.deleteModel(event.PhysicalResourceId, eventParams.params.restApiId, function (deleteError) {
                if (deleteError) {
                    return callback(deleteError);
                }
                CloudFormationResourceTracker.delete(event, context, function (error) {
                    return callback(error);
                });
            });
        } else {
            logger.log('ApiModel::deleteResource: API Model not found');
            return callback();
        }
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    CloudFormationResourceTracker.get(event, context, function (getError, apiModelEntry) {
        if (getError) {
            return callback(getError);
        }
        if (apiModelEntry) {
            ApiModelService.patchModel(event.PhysicalResourceId, eventParams.params.restApiId, eventParams, function (patchError) {
                if (patchError) {
                    return callback(patchError);
                }
                return getForResponse(event, context, eventParams.params.name, eventParams.params.restApiId, callback);
            });
        } else {
            return callback('API Model not found');
        }
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(event, context, modelName, restApiId, callback) {
    ApiModelService.getForResponse(modelName, restApiId, function (getError, apiModel) {
        if (getError) {
            return callback(getError);
        }
        apiModel.physicalResourceId = apiModel.id;
        CloudFormationResourceTracker.put(event, context, apiModel.name, function (error) {
            return callback(error, apiModel);
        });
    });
}
