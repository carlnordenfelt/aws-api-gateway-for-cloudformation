'use strict';

var ApiGatewayRetryWrapper = require('./util/api-gateway-retry-wrapper');
var awsApiGateway = new ApiGatewayRetryWrapper({ apiVersion: '2015-07-09' });
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(basePath, domainName, callback) {
    var params = {
        basePath: basePath,
        domainName: domainName
    };
    awsApiGateway.getBasePathMapping(params, function (error, apiBasePathMapping) {
        if (error) {
            logger.log('Error ApiBasePathService::getForResponse', error, params);
        }
        return callback(error, apiBasePathMapping);
    });
};

pub.createBasePathMapping = function createBasePathMapping(parameters, callback) {
    var params = {
        domainName: parameters.domainName,
        restApiId: parameters.restApiId,
        basePath: parameters.basePath,
        stage: parameters.stage
    };
    awsApiGateway.createBasePathMapping(params, function (error) {
        if (error) {
            logger.log('Error ApiBasePathService::createBasePathMapping', error, params);
        }
        callback(error);
    });
};

pub.deleteBasePathMapping = function deleteBasePathMapping(parameters, callback) {
    var params = {
        domainName: parameters.domainName,
        basePath: parameters.basePath
    };
    awsApiGateway.deleteBasePathMapping(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiBasePathService::deleteBasePathMapping', error, params);
            return callback(error);
        }
        callback();
    });
};

pub.patchBasePathMapping = function patchBasePathMapping(_basePath, _domainName, _eventParams, callback) {
    return callback();
    // Patching currently not allowed
    //var patchOperations = ApiBasePathMappingEvent.getPatchOperations(eventParams);
    //if (patchOperations.length === 0) {
    //    return callback();
    //}
    //var params = {
    //    basePath: basePath,
    //    domainName: domainName,
    //    patchOperations: patchOperations
    //};
    //awsApiGateway.updateBasePathMapping(params, function(error, apiBasePathMapping) {
    //    if (error && error.code !== 'NotFoundException') {
    //        logger.log('Error ApiBasePathService::patchBasePathMapping', error, params);
    //        return callback(error);
    //    }
    //    return callback(undefined, apiBasePathMapping);
    //});
};

module.exports = pub;
