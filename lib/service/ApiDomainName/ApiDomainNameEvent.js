'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };

    // Validation
    if (!eventParams.params.certificateBody) {
        return new Error('Missing parameter {certificateBody} in input');
    }
    if (!eventParams.params.certificateChain) {
        return new Error('Missing parameter {certificateChain} in input');
    }
    if (!eventParams.params.certificateName) {
        return new Error('Missing parameter {certificateName} in input');
    }
    if (!eventParams.params.certificatePrivateKey) {
        return new Error('Missing parameter {certificatePrivateKey} in input');
    }
    if (!eventParams.params.domainName) {
        return new Error('Missing parameter {domainName} in input');
    }
    return eventParams;
};

var allowedModifications = {
    add: [],
    replace: [],
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
        certificateBody: resourceProperties.certificateBody,
        certificateChain: resourceProperties.certificateChain,
        certificateName: resourceProperties.certificateName,
        certificatePrivateKey: resourceProperties.certificatePrivateKey,
        domainName: resourceProperties.domainName
    };
}
