'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var ApiAuthorizerEvent = require('./ApiAuthorizerEvent');
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(authorizerId, restApiId, callback) {
    var params = {
        authorizerId: authorizerId,
        restApiId: restApiId
    };
    awsApiGateway.getAuthorizer(params, function (error, apiAuthorizer) {
        if (error) {
            logger.log('Error ApiAuthorizerService::getForResponse', error, params);
        }
        return callback(error, apiAuthorizer);
    });
};

pub.createAuthorizer = function createAuthorizer(parameters, callback) {
    var params = {
        authorizerUri: parameters.authorizerUri,
        identitySource: parameters.identitySource,
        name: parameters.name,
        restApiId: parameters.restApiId,
        type: parameters.type,
        authorizerResultTtlInSeconds: parameters.authorizerResultTtlInSeconds
    };
    if (parameters.authorizerCredentials) {
        params.authorizerCredentials = parameters.authorizerCredentials;
    }
    if (parameters.identityValidationExpression) {
        params.identityValidationExpression = parameters.identityValidationExpression;
    }

    awsApiGateway.createAuthorizer(params, function (error, apiAuthorizer) {
        if (error) {
            logger.log('Error ApiAuthorizerService::createAuthorizer', error, params);
        }
        callback(error, apiAuthorizer);
    });
};

pub.deleteAuthorizer = function deleteAuthorizer(authorizerId, restApiId, callback) {
    var params = {
        authorizerId: authorizerId,
        restApiId: restApiId
    };
    awsApiGateway.deleteAuthorizer(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiAuthorizerService::deleteAuthorizer', error, params);
            return callback(error);
        }
        return callback();
    });
};

pub.patchAuthorizer = function patchAuthorizer(authorizerId, eventParams, callback) {
    var patchOperations = ApiAuthorizerEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }

    var params = {
        authorizerId: authorizerId,
        restApiId: eventParams.params.restApiId,
        patchOperations: patchOperations
    };
    awsApiGateway.updateAuthorizer(params, function (error, apiAuthorizer) {
        if (error) {
            logger.log('Error ApiAuthorizerService::patchAuthorizer', error, params);
            return callback(error);
        }
        return callback(undefined, apiAuthorizer);
    });
};

module.exports = pub;
