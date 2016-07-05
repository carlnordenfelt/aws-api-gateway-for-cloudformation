'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var async = require('async');
var ApiMethodService = require('../api-method/api-method-service');
var Constants = require('../constants2');
var getCorsMethodUpdateOperations = require('./get-cors-method-update-operations');
var HeaderHelper = require('./header-helper');
var logger = require('../util/logger');

var pub = {};

pub.putOptionsMethod = function putOptionsMethod(restApiId, resourceId, corsConfiguration, callback) {
    ApiMethodService.deleteMethod(restApiId, resourceId, Constants.CORS_OPTIONS_METHOD, function (deleteError) {
        if (deleteError) {
            return callback(deleteError);
        }

        var headers = {};
        headers[Constants.AWS_HEADER_PATHS.ALLOW_METHODS] = HeaderHelper.getAllowMethodsValue(corsConfiguration.allowMethods);
        headers[Constants.AWS_HEADER_PATHS.ALLOW_ORIGIN] = HeaderHelper.getAllowOriginValue(corsConfiguration.allowOrigin);
        if (corsConfiguration.allowHeaders) {
            headers[Constants.AWS_HEADER_PATHS.ALLOW_HEADERS] = HeaderHelper.getAllowHeadersValue(corsConfiguration.allowHeaders);
        }
        if (corsConfiguration.exposeHeaders) {
            headers[Constants.AWS_HEADER_PATHS.EXPOSE_HEADERS] = HeaderHelper.getExposeHeadersValue(corsConfiguration.exposeHeaders);
        }
        if (corsConfiguration.maxAge) {
            headers[Constants.AWS_HEADER_PATHS.MAX_AGE] = HeaderHelper.getMaxAgeValue(corsConfiguration.maxAge);
        }
        if (corsConfiguration.allowCredentials) {
            headers[Constants.AWS_HEADER_PATHS.ALLOW_CREDENTIALS] = HeaderHelper.getAllowCredentialsValue(corsConfiguration.allowCredentials);
        }

        var optionsMethodParams = {
            restApiId: restApiId,
            resourceId: resourceId,
            method: {
                authorizationType: 'NONE',
                httpMethod: Constants.CORS_OPTIONS_METHOD
            },
            integration: {
                type: 'MOCK',
                requestTemplates: {
                    'application/json': {
                        statusCode: 200
                    }
                }
            },
            responses: {
                default: {
                    statusCode: Constants.CORS_STATUS_CODE,
                    headers: headers
                }
            }
        };

        ApiMethodService.createMethod({ params: optionsMethodParams }, function (error) {
            if (error) {
                logger.log('Error when creating OPTIONS method', { error: error, params: optionsMethodParams });
            }
            return callback(error);
        });
    });
};

pub.updateCorsConfiguration = function (parameters, resourceId, callback) {
    if (parameters.params.corsConfiguration || parameters.old.corsConfiguration) {
        if (parameters.old.corsConfiguration && !parameters.params.corsConfiguration) {
            return deleteCors(parameters, resourceId, callback);
        }
        return updateCors(parameters, resourceId, callback);
    }
    return callback();
};

module.exports = pub;

function deleteCors(parameters, resourceId, callback) {
    // Cors has been removed, delete the options method
    ApiMethodService.deleteMethod(parameters.params.restApiId, resourceId, Constants.CORS_OPTIONS_METHOD, function (deleteError) {
        if (deleteError) {
            return callback(deleteError);
        }
        updateCorsOriginOnMethods(parameters.params.restApiId, resourceId, undefined, parameters.old.corsConfiguration, function (updateError) {
            if (updateError) {
                return callback(updateError);
            }
            return callback();
        });
    });
}

function updateCors(parameters, resourceId, callback) {
    var corsChanges = HeaderHelper.getCorsChanges(parameters.params.corsConfiguration, parameters.old.corsConfiguration);
    if (corsChanges.hasChanged) {
        // Cors has changed, update the OPTIONS method
        pub.putOptionsMethod(parameters.params.restApiId, resourceId, parameters.params.corsConfiguration, function (putError) {
            if (putError) {
                return callback(putError);
            }
            // If the allowed methods or the origin has changed we have to update the child methods
            if (corsChanges.hasMethodsChanged || corsChanges.hasOriginChanged) {
                updateCorsOriginOnMethods(parameters.params.restApiId, resourceId, parameters.params.corsConfiguration, parameters.old.corsConfiguration, function (updateError) {
                    return callback(updateError);
                });
            } else {
                return callback();
            }
        });
    } else {
        return callback();
    }
}

/* eslint max-params: 0 */
function updateCorsOriginOnMethods(restApiId, resourceId, newCorsConfiguration, oldCorsConfiguration, callback) {
    var oldAllowMethods = oldCorsConfiguration ? oldCorsConfiguration.allowMethods : [];
    var oldAllowOrigin = oldCorsConfiguration ? oldCorsConfiguration.allowOrigin : '';
    var newAllowMethods = newCorsConfiguration ? newCorsConfiguration.allowMethods : [];
    var newAllowOrigin = newCorsConfiguration ? newCorsConfiguration.allowOrigin : '';
    logger.log('Patching cors methods', { oldMethods: oldAllowMethods, newMethods: newAllowMethods, oldOrigin: oldAllowOrigin, newOrigin: newAllowOrigin });
    getCorsMethodUpdateOperations(restApiId, resourceId, newAllowMethods, newAllowOrigin, oldAllowMethods, oldAllowOrigin, function (getError, operations) {
        if (getError) {
            return callback(getError);
        } else if (!operations || operations.length === 0) {
            logger.log('No patch operations found');
            return callback();
        }

        logger.log('Executing patch operations', operations);
        async.map(operations, function (operation, asyncCallback) {
            updateCorsOrigin(newAllowOrigin, operation, function (updateError) {
                asyncCallback(updateError);
            });
        }, function (error) {
            callback(error || undefined);
        });
    });

    function updateCorsOrigin(origin, operation, innerCallback) {
        // Update the method response header
        var responseParams = {
            httpMethod: operation.httpMethod,
            resourceId: resourceId,
            restApiId: restApiId,
            statusCode: operation.statusCode,
            patchOperations: [
                {
                    op: operation.op,
                    path: '/responseParameters/method.response.header.Access-Control-Allow-Origin',
                    value: 'true'
                }
            ]
        };
        awsApiGateway.updateMethodResponse(responseParams, function (methodError) {
            if (methodError && methodError.code !== 'NotFoundException') {
                logger.log('Error CorsService::updateMethodResponse', { error: methodError, params: responseParams });
                return innerCallback(methodError);
            }
            if (operation.op === 'remove') {
                return innerCallback();
            }
            // Update the integration response header
            var integrationParams = {
                httpMethod: operation.httpMethod,
                resourceId: resourceId,
                restApiId: restApiId,
                statusCode: operation.statusCode,
                patchOperations: [
                    {
                        op: operation.op,
                        path: '/responseParameters/method.response.header.Access-Control-Allow-Origin',
                        value: HeaderHelper.getAllowOriginValue(origin)
                    }
                ]
            };
            awsApiGateway.updateIntegrationResponse(integrationParams, function (integrationError) {
                if (integrationError && integrationError.code !== 'NotFoundException') {
                    logger.log('Error CorsService::updateIntegrationResponse', { error: integrationError, params: integrationParams });
                    return innerCallback(integrationError);
                }
                return innerCallback();
            });
        });
    }
}
