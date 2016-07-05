'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var ApiDeployEvent = require('./api-deploy-event');
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(stageName, restApiId, callback) {
    var params = {
        stageName: stageName,
        restApiId: restApiId
    };
    awsApiGateway.getStage(params, function (error, apiStage) {
        if (error) {
            logger.log('Error ApiDeployService::getForResponse', { error: error, params: params });
        }
        return callback(error, apiStage);
    });
};

pub.deployApi = function deployApi(eventParams, callback) {
    createDeployment(eventParams.params, function (createError) {
        if (createError) {
            return callback(createError);
        }
        patchStage(eventParams, function (patchError) {
            callback(patchError);
        });
    });
};

module.exports = pub;

function createDeployment(parameters, callback) {
    var params = {
        stageName: parameters.stageName,
        restApiId: parameters.restApiId,
        description: parameters.description
    };
    awsApiGateway.createDeployment(params, function (error, apiDeployment) {
        if (error) {
            logger.log('Error ApiDeployService::createDeployment', { error: error, params: params });
        }
        callback(error, apiDeployment);
    });
}

function patchStage(eventParams, callback) {
    var patchOperations = ApiDeployEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }

    var params = {
        stageName: eventParams.params.stageName,
        restApiId: eventParams.params.restApiId,
        patchOperations: patchOperations
    };
    awsApiGateway.updateStage(params, function (error, apiStage) {
        if (error) {
            logger.log('Error ApiDeployService::patchStage', { error: error, params: JSON.stringify(params) });
        }
        return callback(error, apiStage);
    });
}
