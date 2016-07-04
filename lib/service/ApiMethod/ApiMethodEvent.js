'use strict';

var validator = require('../util/validator');
var schema = require('../json-schemas/api-method-schema');
var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);
    validateAuthorizationType(eventParams.params);
    validateIntegrationHttpMethod(eventParams.params);
    eventParams.params = stringifyRequestTemplates(eventParams.params);
    eventParams.params = rebuildResponses(eventParams.params);
    return eventParams;
};

function validateAuthorizationType(parameters) {
    if (parameters.method.authorizationType === 'CUSTOM' && !parameters.method.authorizerId) {
        validator.throwOnError([ { stack: 'input.method.authorizerId is required' }]);
    }
}
function validateIntegrationHttpMethod(parameters) {
    if (parameters.integration.type !== 'MOCK') {
        if (!parameters.integration.httpMethod) {
            validator.throwOnError([{ stack: 'input.integration.httpMethod is required' }]);
        } else if (!parameters.integration.uri) {
            validator.throwOnError([{ stack: 'input.integration.uri is required' }]);
        }
    }
}
function stringifyRequestTemplates(parameters) {
    if (parameters.integration && parameters.integration.requestTemplates) {
        for (var integrationContentType in parameters.integration.requestTemplates) {
            /* istanbul ignore else */
            if (parameters.integration.requestTemplates.hasOwnProperty(integrationContentType)) {
                if (typeof parameters.integration.requestTemplates[integrationContentType] === 'object') {
                    parameters.integration.requestTemplates[integrationContentType] = JSON.stringify(parameters.integration.requestTemplates[integrationContentType]);
                }
            }
        }
    }
    return parameters;
}
/* eslint max-depth: 0 */
function rebuildResponses(parameters) {
    if (parameters.responses) {
        var responses = [];
        for (var responseKey in parameters.responses) {
            /* istanbul ignore else */
            if (parameters.responses.hasOwnProperty(responseKey)) {
                var response = parameters.responses[responseKey];
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
                responses.push(response);
            }
        }
        parameters.responses = responses;
    }
    return parameters;
}

module.exports = pub;
