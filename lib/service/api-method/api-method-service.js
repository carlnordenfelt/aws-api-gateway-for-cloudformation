'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var async = require('async');
var Constants = require('../constants2');
var logger = require('../util/logger');

var pub = {};

/*
    Due to unexpected issues during method creation a slight delay between operations was introduced.
    The issue at hand is that Amazon responds with ConcurrentModificationsException.
    After discussions with the AWS support it was deemed best to add a slight delay to ensure that each call
    was completed on the server side before executing the next request.
 */
pub.PUT_METHOD_STEP_DELAY_MILLIS = 100;

pub.getForResponse = function getForResponse(restApiId, resourceId, httpMethod, callback) {
    var params = {
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod.toUpperCase()
    };
    awsApiGateway.getMethod(params, function (error, apiMethod) {
        if (error) {
            logger.log('Error ApiMethodService::getForResponse', { error: error, params: params });
            return callback(error);
        }
        // Remove irrelevant data from response to reduce the size of the response body (CFN has a 4K limit on the response)
        delete apiMethod.methodResponses;
        delete apiMethod.methodIntegration.integrationResponses;
        delete apiMethod.methodIntegration.requestTemplates;
        delete apiMethod.requestModels;
        return callback(error, apiMethod);
    });
};

/* eslint max-nested-callbacks: 0 */
pub.createMethod = function createMethod(parameters, callback) {
    pub.getCorsOrigin(parameters.params, function (getError, corsOrigin) {
        if (getError) {
            return callback(getError);
        }

        parameters.params.responses = rebuildResponses(parameters.params.responses);
        if (corsOrigin) {
            parameters.params = appendCorsProperties(parameters.params, corsOrigin);
        }

        putMethod(parameters.params, function (putError, apiMethod) {
            if (putError) {
                return callback(putError);
            }
            createIntegration(parameters.params, function (integrationError) {
                if (integrationError) {
                    return callback(integrationError, apiMethod);
                }
                createResponses(parameters.params, function (responseError) {
                    if (responseError) {
                        return callback(responseError, apiMethod);
                    }
                    createIntegrationResponses(parameters.params, function (integrationResponseError) {
                        if (integrationResponseError) {
                            return callback(integrationResponseError, apiMethod);
                        }
                        return callback(undefined, apiMethod);
                    });
                });
            });
        });
    });
};

pub.getMethod = function getMethod(restApiId, resourceId, httpMethod, callback) {
    var params = {
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod
    };
    awsApiGateway.getMethod(params, function (error, method) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiMethodService::getMethod', { error: error, params: params });
            return callback(error);
        }
        callback(undefined, method);
    });
};

pub.getCorsOrigin = function getCorsOrigin(parameters, callback) {
    // If we are creating an OPTIONS method we don't need to get the origin
    if (parameters.method.httpMethod === Constants.CORS_OPTIONS_METHOD) {
        return callback();
    }

    pub.getMethod(parameters.restApiId, parameters.resourceId, Constants.CORS_OPTIONS_METHOD, function (error, method) {
        if (error) {
            return callback(error);
        }

        var origin;
        if (method && method.methodIntegration && method.methodIntegration.integrationResponses) {
            /* eslint max-len: 0 */
            var allowedMethods = method.methodIntegration.integrationResponses[Constants.CORS_STATUS_CODE].responseParameters['method.response.header.' + Constants.AWS_HEADER_PATHS.ALLOW_METHODS];
            if (allowedMethods.indexOf(parameters.method.httpMethod) > -1) {
                /* eslint max-len: 0 */
                origin = method.methodIntegration.integrationResponses[Constants.CORS_STATUS_CODE].responseParameters['method.response.header.' + Constants.AWS_HEADER_PATHS.ALLOW_ORIGIN];
            }
        }
        callback(error, origin);
    });
};

pub.deleteMethod = function deleteMethod(restApiId, resourceId, httpMethod, callback) {
    var params = {
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod
    };
    awsApiGateway.deleteMethod(params, function (error) {
        if (error && error.code !== 'NotFoundException' && error.code !== 'MissingRequiredParameter') {
            logger.log('Error ApiMethodService::deleteMethod', { error: error, params: params });
            return callback(error);
        }
        return callback();
    });
};

module.exports = pub;

function putMethod(parameters, callback) {
    var params = {
        restApiId: parameters.restApiId,
        resourceId: parameters.resourceId,
        httpMethod: parameters.method.httpMethod.toUpperCase(),
        authorizationType: parameters.method.authorizationType,
        apiKeyRequired: parameters.method.apiKeyRequired === 'true',
        requestModels: parameters.method.requestModels
    };

    if (parameters.method.authorizationType === 'CUSTOM') {
        params.authorizerId = parameters.method.authorizerId;
    }

    if (parameters.method.parameters) {
        params.requestParameters = {};
        for (var i = 0; i < parameters.method.parameters.length; i++) {
            params.requestParameters['method.request.' + parameters.method.parameters[i]] = true;
        }
    }
    awsApiGateway.putMethod(params, function (error, apiMethod) {
        if (error) {
            logger.log('Error ApiMethodService::putMethod', { error: error, params: params });
        }
        setTimeout(function () {
            return callback(error, apiMethod);
        }, pub.PUT_METHOD_STEP_DELAY_MILLIS);
    });
}

function createIntegration(parameters, callback) {
    var params = {
        restApiId: parameters.restApiId,
        resourceId: parameters.resourceId,
        httpMethod: parameters.method.httpMethod.toUpperCase(),
        type: parameters.integration.type,
        credentials: parameters.integration.credentials,
        passthroughBehavior: parameters.integration.passthroughBehavior,
        integrationHttpMethod: parameters.integration.httpMethod.toUpperCase(),
        requestParameters: parameters.integration.requestParameters,
        requestTemplates: stringifyIntegrationRequestTemplates(parameters.integration.requestTemplates),
        uri: parameters.integration.uri
    };
    if (parameters.integration.cacheKeyParameters) {
        params.cacheKeyParameters = parameters.integration.cacheKeyParameters;
        params.cacheNamespace = parameters.integration.cacheNamespace;
    }
    awsApiGateway.putIntegration(params, function (error) {
        if (error) {
            logger.log('Error ApiMethodService::createIntegration', { error: error, params: params });
        }
        setTimeout(function () {
            return callback(error);
        }, pub.PUT_METHOD_STEP_DELAY_MILLIS);
    });

    function stringifyIntegrationRequestTemplates(requestTemplates) {
        /* istanbul ignore else */
        if (requestTemplates) {
            for (var integrationContentType in requestTemplates) {
                /* istanbul ignore else */
                if (requestTemplates.hasOwnProperty(integrationContentType)) {
                    if (typeof requestTemplates[integrationContentType] === 'object') {
                        requestTemplates[integrationContentType] = JSON.stringify(requestTemplates[integrationContentType]);
                    }
                }
            }
        }
        return requestTemplates;
    }
}

function createResponses(parameters, callback) {
    var createdResponses = [];
    async.mapSeries(parameters.responses, function (response, asyncCallback) {
        // Response already created, skip
        /* istanbul ignore if */
        if (createdResponses.indexOf(response.statusCode) > -1) {
            return asyncCallback();
        }

        var params = {
            restApiId: parameters.restApiId,
            resourceId: parameters.resourceId,
            httpMethod: parameters.method.httpMethod.toUpperCase(),
            statusCode: response.statusCode,
            responseModels: response.responseModels
        };

        /* istanbul ignore else */
        if (response.headers) {
            var headers = Object.getOwnPropertyNames(response.headers);
            params.responseParameters = {};
            for (var i = 0; i < headers.length; i++) {
                params.responseParameters['method.response.header.' + headers[i]] = true;
            }
        }

        awsApiGateway.putMethodResponse(params, function (error) {
            if (error) {
                logger.log('Error ApiMethodService::createResponses', { error: error, params: params });
            }
            createdResponses.push(response.statusCode);
            asyncCallback(error);
        });
    }, function (error) {
        setTimeout(function () {
            return callback(error);
        }, pub.PUT_METHOD_STEP_DELAY_MILLIS);
    });
}

function createIntegrationResponses(parameters, callback) {
    async.mapSeries(parameters.responses, function (response, asyncCallback) {
        var params = {
            restApiId: parameters.restApiId,
            resourceId: parameters.resourceId,
            httpMethod: parameters.method.httpMethod.toUpperCase(),
            statusCode: response.statusCode,
            selectionPattern: response.selectionPattern,
            responseTemplates: response.responseTemplates
        };

        /* istanbul ignore else */
        if (response.headers) {
            var headers = Object.getOwnPropertyNames(response.headers);
            params.responseParameters = {};
            for (var i = 0; i < headers.length; i++) {
                params.responseParameters['method.response.header.' + headers[i]] = response.headers[headers[i]];
            }
        }
        awsApiGateway.putIntegrationResponse(params, function (error, data) {
            if (error) {
                logger.log('Error ApiMethodService::createIntegrationResponses', { error: error, params: params });
            }
            asyncCallback(error, data);
        });
    }, function (error) {
        setTimeout(function () {
            return callback(error);
        }, pub.PUT_METHOD_STEP_DELAY_MILLIS);
    });
}

function appendCorsProperties(parameters, corsOrigin) {
    for (var i = 0; i < parameters.responses.length; i++) {
        if (!parameters.responses[i].headers) {
            parameters.responses[i].headers = {};
        }
        parameters.responses[i].headers[Constants.AWS_HEADER_PATHS.ALLOW_ORIGIN] = corsOrigin;
    }
    return parameters;
}

/* eslint max-depth: 0 */
function rebuildResponses(responses) {
    var rebuiltResponses = [];
    if (responses) {
        for (var responseKey in responses) {
            /* istanbul ignore else */
            if (responses.hasOwnProperty(responseKey)) {
                var response = responses[responseKey];
                if (responseKey !== 'default') {
                    response.selectionPattern = responseKey;
                }

                if (response.responseTemplates) {
                    for (var responseContentType in response.responseTemplates) {
                        /* istanbul ignore else */
                        if (response.responseTemplates.hasOwnProperty(responseContentType)) {
                            if (typeof response.responseTemplates[responseContentType] === 'object') {
                                response.responseTemplates[responseContentType] = JSON.stringify(response.responseTemplates[responseContentType]);
                            }
                        }
                    }
                }
                rebuiltResponses.push(response);
            }
        }
    }
    return rebuiltResponses;
}
