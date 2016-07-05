'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var logger = require('../util/logger');
var ApiBasePathMappingEvent = require('./api-base-path-mapping-event');

var pub = {};

pub.getForResponse = function getForResponse(basePath, domainName, callback) {
    var params = {
        basePath: basePath,
        domainName: domainName
    };
    awsApiGateway.getBasePathMapping(params, function (error, apiBasePathMapping) {
        if (error) {
            logger.log('Error ApiBasePathService::getForResponse', { error: error, params: params });
            return callback(error);
        }
        apiBasePathMapping.physicalResourceId = domainName + '/' + basePath;
        return callback(undefined, apiBasePathMapping);
    });
};

pub.createBasePathMapping = function createBasePathMapping(parameters, callback) {
    createDeployment(parameters, function (createDeploymentError) {
        if (createDeploymentError) {
            return callback(createDeploymentError);
        }
        var params = {
            domainName: parameters.domainName,
            restApiId: parameters.restApiId,
            basePath: parameters.basePath,
            stage: parameters.stage
        };
        awsApiGateway.createBasePathMapping(params, function (error, apiBasePathMapping) {
            if (error) {
                logger.log('Error ApiBasePathService::createBasePathMapping', { error: error, params: params });
                return callback(error);
            }
            callback(undefined, apiBasePathMapping);
        });
    });
};

pub.deleteBasePathMapping = function deleteBasePathMapping(parameters, callback) {
    var params = {
        domainName: parameters.domainName,
        basePath: parameters.basePath
    };
    awsApiGateway.deleteBasePathMapping(params, function (error) {
        // error.message gives a very poor error if the mapping is not found
        if (error && error.message !== 'Unexpected token <') {
            logger.log('Error ApiBasePathService::deleteBasePathMapping', { error: error, params: params });
            return callback(error);
        }
        callback();
    });
};

pub.patchBasePathMapping = function patchBasePathMapping(basePath, domainName, eventParams, callback) {
    var patchOperations = ApiBasePathMappingEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }

    var patchParams = {
        basePath: basePath,
        domainName: domainName,
        patchOperations: patchOperations
    };

    // Check if stage will be updated, if it is we need to create the stage and deploy
    if (eventParams.old.stage !== eventParams.params.stage) {
        createDeployment(eventParams.params, function (createDeploymentError) {
            if (createDeploymentError) {
                return callback(createDeploymentError);
            }
            updateBasePathMapping(patchParams, function (updateError1) {
                return callback(updateError1);
            });
        });
    } else {
        updateBasePathMapping(patchParams, function (updateError2) {
            return callback(updateError2);
        });
    }
};

module.exports = pub;

function updateBasePathMapping(params, callback) {
    awsApiGateway.updateBasePathMapping(params, function (error) {
        if (error) {
            logger.log('Error ApiBasePathService::updateBasePathMapping', { error: error, params: params });
            return callback(error);
        }
        return callback();
    });
}

function createDeployment(parameters, callback) {
    var getStageParams = {
        stageName: parameters.stage,
        restApiId: parameters.restApiId
    };
    awsApiGateway.getStage(getStageParams, function (getStageError, stage) {
        if (getStageError && getStageError.code !== 'NotFoundException') {
            logger.log('Error ApiBasePathService::getStage', { error: getStageError, params: getStageParams });
            return callback(getStageError);
        } else if (stage) {
            return callback();
        }

        var createDeploymentParams = {
            restApiId: parameters.restApiId,
            stageName: parameters.stage,
            description: 'Created by APIGatewayForCloudFormation',
            stageDescription: 'Created by APIGatewayForCloudFormation'
        };
        awsApiGateway.createDeployment(createDeploymentParams, function (createDeploymentError) {
            if (createDeploymentError) {
                logger.log('Error ApiBasePathService::createDeployment', { error: createDeploymentError, params: createDeploymentParams });
            }
            return callback(createDeploymentError);
        });
    });
}
