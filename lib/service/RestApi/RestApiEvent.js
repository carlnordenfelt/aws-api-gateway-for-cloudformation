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
        if (!eventParams.params.name) {
            return new Error('Missing parameter {name} in input');
        }
    }
    return eventParams;
};

var allowedModifications = {
    add: [],
    addForReplace: ['description'],
    replace: ['name', 'description'],
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
        name: resourceProperties.name,
        description: resourceProperties.description
    };
}
