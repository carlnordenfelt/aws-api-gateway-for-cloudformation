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
            throw new Error('Missing parameter {restApiId} in input');
        }
        if (!eventParams.params.stageName) {
            throw new Error('Missing parameter {stageName} in input');
        }
    }

    return eventParams;
};

var allowedStageModifications = {
    add: [],
    replace: [
        'description',
        'cacheClusterEnabled',
        'cacheClusterSize'
    ],
    remove: []
};

pub.getPatchOperations = function (eventParams) {
    var stageOperations = [];
    var stageVariableOperations = [];
    var methodSettingsOperations = [];

    if (!eventParams.old) {
        eventParams.old = {};
    }

    if (eventParams.params.stageConfig) {
        var stageModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.stageConfig, eventParams.old.stageConfig, allowedStageModifications);
        stageOperations = patchOperationsHelper.getOperations(eventParams.params.stageConfig, stageModifications);
    }

    if (eventParams.params.stageVariables) {
        var stageVariableModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.stageVariables, eventParams.old.stageVariables);
        stageVariableOperations = patchOperationsHelper.getOperations(eventParams.params.stageVariables, stageVariableModifications);
        for (var i = 0; i < stageVariableOperations.length; i++) {
            stageVariableOperations[i].path = '/variables/' + stageVariableOperations[i].path.substring(1);
        }
    }

    if (eventParams.params.methodSettings) {
        var methodModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.methodSettings, eventParams.old.methodSettings);
        methodSettingsOperations = patchOperationsHelper.getOperations(eventParams.params.methodSettings, methodModifications);
        // TODO: Temporary workaround until AWS has sorted the update bug
        for (var j = 0; j < methodSettingsOperations.length; j++) {
            if (methodSettingsOperations[j].path.indexOf('/*/*/') !== 0) {
                methodSettingsOperations[j].path = '/~1' + methodSettingsOperations[j].path.substring(1);
            }
        }
    }

    return stageOperations.concat(stageVariableOperations, methodSettingsOperations);
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        restApiId: resourceProperties.restApiId,
        stageName: resourceProperties.stageName,
        description: resourceProperties.description,
        stageConfig: resourceProperties.stageConfig,
        stageVariables: resourceProperties.stageVariables,
        methodSettings: resourceProperties.methodSettings
    };
}
