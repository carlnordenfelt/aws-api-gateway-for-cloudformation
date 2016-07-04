'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var logger = require('../util/logger');

var pub = {};

pub.importApi = function importApi(parameters, callback) {
    var params = {
        body: JSON.stringify(parameters.apiDefinition),
        parameters: parameters.parameters,
        failOnWarnings: parameters.failOnWarnings.toString() === 'true'
    };
    awsApiGateway.importRestApi(params, function (error, restApi) {
        if (error) {
            logger.log('Error ApiImportService::importApi', { error: error, params: params });
        }
        callback(error, restApi);
    });
};

pub.updateApi = function updateApi(restApiId, parameters, callback) {
    var params = {
        restApiId: restApiId,
        body: JSON.stringify(parameters.apiDefinition),
        parameters: parameters.parameters,
        failOnWarnings: parameters.failOnWarnings.toString() === 'true',
        mode: parameters.updateMode
    };
    awsApiGateway.putRestApi(params, function (error, restApi) {
        if (error) {
            logger.log('Error ApiImportService::updateApi', { error: error, params: params });
        }
        callback(error, restApi);
    });
};

module.exports = pub;
