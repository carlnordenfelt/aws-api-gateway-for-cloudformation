'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };

    // Validation
    if (!eventParams.params.domainName) {
        return new Error('Missing parameter {domainName} in input');
    }
    if (!eventParams.params.restApiId) {
        return new Error('Missing parameter {restApiId} in input');
    }

    // Defaults
    if (!eventParams.params.basePath) {
        eventParams.params.basePath = '';
    }
    return eventParams;
};

var allowedModifications = {
    add: [],
    replace: ['basePath', 'restApiId', 'stage'],
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
        domainName: resourceProperties.domainName,
        restApiId: resourceProperties.restApiId,
        basePath: resourceProperties.basePath,
        stage: resourceProperties.stage
    };
}
