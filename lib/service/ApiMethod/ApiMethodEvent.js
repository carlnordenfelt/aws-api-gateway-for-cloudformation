'use strict';

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };


    // Basic validation, further validation is performed later
    if (event.RequestType !== 'Delete') {
        if (!eventParams.params.restApiId) {
            return new Error('Missing parameter {restApiId} in input');
        }
        if (!eventParams.params.resourceId) {
            return new Error('Missing parameter {resourceId} in input');
        }
        if (!eventParams.params.method) {
            return new Error('Missing parameter {method} in input');
        }
        if (!eventParams.params.method.httpMethod) {
            return new Error('Missing parameter {method.httpMethod} in input');
        }
        // lambda event mangles booleans as strings
        eventParams.params.method.apiKeyRequired = eventParams.params.method.apiKeyRequired === 'true';
        if (eventParams.old && eventParams.old.method) {
            eventParams.old.method.apiKeyRequired = eventParams.old.method.apiKeyRequired === 'true';
        }
    }

    return eventParams;
};

/* eslint complexity: 0 */
/* eslint max-statements: 0 */
/* eslint max-depth: 0 */
pub.validateParameters = function validateParameters(parameters) {
    if (!parameters.restApiId) {
        return new Error('Missing parameter {restApiId} in input');
    }
    if (!parameters.resourceId) {
        return new Error('Missing parameter {resourceId} in input');
    }

    // Validate method
    if (!parameters.method) {
        return new Error('Missing parameter {method} in input');
    }
    if (!parameters.method.httpMethod) {
        return new Error('Missing parameter {method.httpMethod} in input');
    }
    parameters.method.httpMethod = parameters.method.httpMethod.toUpperCase();
    if (!parameters.method.authorizationType) {
        parameters.method.authorizationType = 'NONE';
    } else if (parameters.method.authorizationType === 'CUSTOM') {
        if (!parameters.method.authorizerId) {
            return new Error('Missing parameter {method.authorizerId} in input');
        }
    }

    if (!parameters.method.apiKeyRequired) {
        parameters.method.apiKeyRequired = false;
    }

    // Validate integration
    if (parameters.integration) {
        if (!parameters.integration.type) {
            return new Error('Missing parameter {integration.type} in input');
        }
        parameters.integration.type = parameters.integration.type.toUpperCase();

        if (parameters.integration.type !== 'MOCK') {
            if (!parameters.integration.httpMethod) {
                return new Error('Missing parameter {integration.httpMethod} in input');
            }
            if (!parameters.integration.uri) {
                return new Error('Missing parameter {integration.uri} in input');
            }
            parameters.integration.httpMethod = parameters.integration.httpMethod.toUpperCase();
        }

        if (parameters.integration.requestTemplates) {
            for (var integrationContentType in parameters.integration.requestTemplates) {
                /* istanbul ignore else */
                if (parameters.integration.requestTemplates.hasOwnProperty(integrationContentType)) {
                    if (typeof parameters.integration.requestTemplates[integrationContentType] === 'object') {
                        parameters.integration.requestTemplates[integrationContentType] = JSON.stringify(parameters.integration.requestTemplates[integrationContentType]);
                    }
                }
            }
        }
    }

    // Validate responses
    if (parameters.responses) {
        var responses = [];
        for (var responseKey in parameters.responses) {
            /* istanbul ignore else */
            if (parameters.responses.hasOwnProperty(responseKey)) {
                var response = parameters.responses[responseKey];
                if (!response.statusCode) {
                    return new Error('Missing parameter {responses.statusCode} in input');
                }
                response.statusCode = response.statusCode.toString();

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
                } else {
                    response.responseTemplates = {
                        'application/json': ''
                    };
                }
                responses.push(response);
            }
        }
        parameters.responses = responses;
    }
    return parameters;
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        restApiId: resourceProperties.restApiId,
        resourceId: resourceProperties.resourceId,
        method: resourceProperties.method,
        integration: resourceProperties.integration,
        responses: resourceProperties.responses
    };
}
