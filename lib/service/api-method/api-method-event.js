'use strict';

var validator = require('../util/validator');
var schema = require('../json-schemas/api-method-schema');
var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);
    validateAuthorizationType(eventParams.params);
    validateIntegrationHttpMethod(eventParams.params);
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

module.exports = pub;
