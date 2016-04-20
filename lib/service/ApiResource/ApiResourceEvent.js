'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var CorsService = require('../Cors/CorsService');

var pub = {};

/* eslint max-statements: 0 */
pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };
    if (event.RequestType !== 'Delete') {
        if (!eventParams.params.restApiId) {
            throw new Error('Missing parameter {restApiId} in input');
        }
        if (!eventParams.params.parentId) {
            throw new Error('Missing parameter {parentId} in input');
        }
        if (!eventParams.params.pathPart) {
            throw new Error('Missing parameter {pathPart} in input');
        }
        CorsService.getValidatedCorsConfigFromEventInput(eventParams);
    }
    return eventParams;
};

pub.getPatchOperations = function (eventParams) {
    var allowedModifications = {
        add: [],
        addForReplace: ['parentId', 'pathPart'],
        replace: ['parentId', 'pathPart'],
        remove: []
    };

    var modifications = patchOperationsHelper.getAllowedModifications(eventParams.params, eventParams.old, allowedModifications);
    return patchOperationsHelper.getOperations(eventParams.params, modifications);
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        parentId: resourceProperties.parentId,
        pathPart: resourceProperties.pathPart,
        corsConfig: resourceProperties.corsConfiguration,
        restApiId: resourceProperties.restApiId
    };
}
