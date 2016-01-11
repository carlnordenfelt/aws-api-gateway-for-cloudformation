'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var Constants = require('../Constants');

var pub = {};

/* eslint max-statements: 0 */
pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };
    if (event.RequestType !== 'Delete') {
        if (!eventParams.params.restApiId) {
            return new Error('Missing parameter {restApiId} in input');
        }
        if (!eventParams.params.parentId) {
            return new Error('Missing parameter {parentId} in input');
        }
        if (!eventParams.params.pathPart) {
            return new Error('Missing parameter {pathPart} in input');
        }
        if (eventParams.params.corsConfig) {
            if (!eventParams.params.corsConfig.allowMethods) {
                return new Error('Missing parameter {corsConfiguration.allowMethods} in input');
            }
            this.getCorsParams(eventParams);
        }
    }
    return eventParams;
};

pub.getCorsParams = function (eventParams) {
    if (!eventParams.params.corsConfig.allowOrigin) {
        eventParams.params.corsConfig.allowOrigin = Constants.CORS_DEFAULT_ORIGIN;
    }

    var allowHeaders = [];
    if (!eventParams.params.corsConfig.allowHeaders || eventParams.params.corsConfig.allowDefaultHeaders) {
        allowHeaders = Constants.CORS_DEFAULT_ALLOWED_HEADERS;
    }
    if (eventParams.params.corsConfig.allowHeaders) {
        allowHeaders = allowHeaders.concat(eventParams.params.corsConfig.allowHeaders);
    }
    if (allowHeaders.length > 0) {
        eventParams.params.corsConfig.allowHeaders = allowHeaders;
    }
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
