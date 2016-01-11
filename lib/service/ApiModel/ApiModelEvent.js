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
        if (!eventParams.params.name) {
            return new Error('Missing parameter {name} in input');
        }
    }

    // Set defaults
    if (!eventParams.params.contentType) {
        eventParams.params.contentType = 'application/json';
    }
    if (!eventParams.params.description) {
        eventParams.params.description = '';
    }
    if (!eventParams.params.schema) {
        eventParams.params.schema = {};
    }
    return eventParams;
};

var allowedModifications = {
    add: [],
    replace: ['schema', 'description'],
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
        name: resourceProperties.name,
        contentType: resourceProperties.contentType,
        schema: resourceProperties.schema,
        description: resourceProperties.description
    };
}
