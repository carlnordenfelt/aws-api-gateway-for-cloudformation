'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var logger = require('../util/logger');
var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var pub = {};

pub.importApi = function importApi(parameters, callback) {
    getApiBody(parameters, function (error, apiBody) {
        if (error) {
            return callback(error);
        }

        var params = {
            body: apiBody,
            parameters: parameters.parameters,
            failOnWarnings: parameters.failOnWarnings.toString() === 'true'
        };
        awsApiGateway.importRestApi(params, function (error, restApi) {
            if (error) {
                logger.log('Error ApiImportService::importApi', { error: error, params: params });
            }
            callback(error, restApi);
        });
    });
};

pub.updateApi = function updateApi(restApiId, parameters, callback) {
    getApiBody(parameters, function (error, apiBody) {
        if (error) {
            return callback(error);
        }

        var params = {
            restApiId: restApiId,
            body: apiBody,
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
    });
};

function getApiBody(parameters, callback) {
    if (parameters.apiDefinition) {
        return callback(null, JSON.stringify(parameters.apiDefinition));
    }

    var s3Params = {
        Bucket: parameters.apiDefinitionS3Location.bucket,
        Key: parameters.apiDefinitionS3Location.key,
        Version: parameters.apiDefinitionS3Location.version
    };

    s3.getObject(s3Params, function (error, s3Object) {
        if (error) {
            return callback(error);
        }

        if (!hasValidEtag(s3Object.ETag, parameters.apiDefinitionS3Location.etag)) {
            return callback(new Error('Invalid ETag for S3 Object'));
        }

        var apiBody = s3Object.Body.toString();
        try {
            apiBody = JSON.stringify(apiBody);
        } catch (_error) {
            // Ignore this error as the body can be defined as YAML
        }
        callback(null, apiBody);
    });

    function hasValidEtag(etag, expectedEtag) {
        return !expectedEtag || etag === expectedEtag;
    }
}
module.exports = pub;
