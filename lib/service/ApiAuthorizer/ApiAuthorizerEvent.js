'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };

    // Validation
    if (event.RequestType !== 'Delete') {
        if (!eventParams.params.restApiId) {
            return new Error('Missing parameter {restApiId} in input');
        }
        if (!eventParams.params.authorizerUri) {
            return new Error('Missing parameter {authorizerUri} in input');
        }
        if (!eventParams.params.identitySource) {
            return new Error('Missing parameter {identitySource} in input');
        }
        if (!eventParams.params.name) {
            return new Error('Missing parameter {name} in input');
        }
    }
    // identityValidationExpression
    // authorizerCredentials
    // Set defaults
    if (!eventParams.params.authorizerResultTtlInSeconds) {
        eventParams.params.authorizerResultTtlInSeconds = 300;
    }
    // Currently, TOKEN is the only valid value
    eventParams.params.type = 'TOKEN';

    return eventParams;
};

var allowedModifications = {
    add: [],
    addForReplace: [
        'name',
        'authorizerUri',
        'authorizerCredentials',
        'identitySource',
        'identityValidationExpression',
        'authorizerResultTtlInSeconds'
    ],
    replace: [
        'name',
        'authorizerUri',
        'authorizerCredentials',
        'identitySource',
        'identityValidationExpression',
        'authorizerResultTtlInSeconds'
    ],
    remove: []
};

pub.getPatchOperations = function (eventParams) {
    var modifications = patchOperationsHelper.getAllowedModifications(eventParams.params, eventParams.old, allowedModifications);
    return patchOperationsHelper.getOperations(eventParams.params, modifications);
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        restApiId: resourceProperties.restApiId,
        authorizerUri: resourceProperties.authorizerUri,
        identitySource: resourceProperties.identitySource,
        name: resourceProperties.name,
        authorizerResultTtlInSeconds: resourceProperties.authorizerResultTtlInSeconds,
        identityValidationExpression: resourceProperties.identityValidationExpression,
        authorizerCredentials: resourceProperties.authorizerCredentials
    };
}
