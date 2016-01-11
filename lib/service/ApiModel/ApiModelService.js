'use strict';

var getWrappedService = require('./util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var ApiModelEvent = require('./ApiModelEvent');
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(modelName, restApiId, callback) {
    var params = {
        modelName: modelName,
        restApiId: restApiId
    };
    awsApiGateway.getModel(params, function (error, apiModel) {
        if (error) {
            logger.log('Error ApiModelService::getForResponse', error, params);
        }
        return callback(error, apiModel);
    });
};

pub.createModel = function createModel(parameters, callback) {
    var schema = parameters.schema;
    if (typeof schema === 'object') {
        schema = JSON.stringify(schema);
    }

    var params = {
        contentType: parameters.contentType,
        name: parameters.name,
        restApiId: parameters.restApiId,
        description: parameters.description,
        schema: schema
    };
    awsApiGateway.createModel(params, function (error, apiModel) {
        if (error) {
            logger.log('Error ApiModelService::createModel', error, params);
        }
        callback(error, apiModel);
    });
};

pub.deleteModel = function deleteModel(modelName, restApiId, callback) {
    var params = {
        modelName: modelName,
        restApiId: restApiId
    };
    awsApiGateway.deleteModel(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiModelService::deleteModel', error, params);
            return callback(error);
        }
        return callback();
    });
};

pub.patchModel = function patchModel(modelName, restApiId, eventParams, callback) {
    var patchOperations = ApiModelEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }

    for (var i = 0; i < patchOperations.length; i++) {
        if (typeof patchOperations[i].value === 'object') {
            patchOperations[i].value = JSON.stringify(patchOperations[i].value);
        }
    }

    var params = {
        modelName: modelName,
        restApiId: restApiId,
        patchOperations: patchOperations
    };
    awsApiGateway.updateModel(params, function (error, apiModel) {
        if (error) {
            logger.log('Error ApiModelService::patchModel', error, params);
            return callback(error);
        }
        return callback(undefined, apiModel);
    });
};

module.exports = pub;
