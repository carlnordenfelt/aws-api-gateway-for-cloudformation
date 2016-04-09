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

    if (!eventParams.params.stageConfig) {
        eventParams.params.stageConfig = {};
    }

    if (!eventParams.params.stageConfig.cacheClusterEnabled) {
        eventParams.params.stageConfig.cacheClusterEnabled = false;
    }
    if (!eventParams.params.stageConfig.cacheClusterSize) {
        eventParams.params.stageConfig.cacheClusterSize = 0.5;
    }
    if (!eventParams.params.stageConfig.description) {
        eventParams.params.stageConfig.description = '';
    }

    return eventParams;
};

var allowedStageModifications = {
    add: [],
    addForReplace: ['description'],
    replace: [
        'description',
        'cacheClusterEnabled',
        'cacheClusterSize'
    ],
    remove: []
};

pub.getPatchOperations = function (eventParams) {
    if (!eventParams.old) {
        eventParams.old = {};
    }

    var stageOperations = getStageConfigPatchOperations(eventParams, allowedStageModifications);
    var stageVariableOperations = getStageVariablesPatchOperations(eventParams);
    var methodSettingsOperations = getMethodSettingsPatchOperations(eventParams);

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

function getStageConfigPatchOperations(eventParams, allowedModifications) {
    if (eventParams.params.stageConfig) {
        var stageModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.stageConfig, eventParams.old.stageConfig, allowedModifications);
        return patchOperationsHelper.getOperations(eventParams.params.stageConfig, stageModifications);
    }
    return [];
}

function getStageVariablesPatchOperations(eventParams) {
    if (eventParams.params.stageVariables) {
        var stageVariableModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.stageVariables, eventParams.old.stageVariables);
        var stageVariableOperations = patchOperationsHelper.getOperations(eventParams.params.stageVariables, stageVariableModifications);
        for (var i = 0; i < stageVariableOperations.length; i++) {
            stageVariableOperations[i].path = '/variables/' + stageVariableOperations[i].path.substring(1);
            if (stageVariableOperations[i].op === 'add') {
                stageVariableOperations[i].op = 'replace';
            }
        }
        return stageVariableOperations;
    }
    return [];
}

function getMethodSettingsPatchOperations(eventParams) {
    if (eventParams.params.methodSettings) {
        var methodModifications = patchOperationsHelper.getAllowedModifications(eventParams.params.methodSettings, eventParams.old.methodSettings);
        var temporaryMethodSettingOperations = patchOperationsHelper.getOperations(eventParams.params.methodSettings, methodModifications);
        var methodSettingsOperations = [];
        for (var j = 0; j < temporaryMethodSettingOperations.length; j++) {
            // TODO: Temporary workaround until AWS has sorted the update bug (~1)
            if (temporaryMethodSettingOperations[j].path.indexOf('/*/*/') !== 0) {
                temporaryMethodSettingOperations[j].path = '/~1' + temporaryMethodSettingOperations[j].path.substring(1);
            }
            if (temporaryMethodSettingOperations[j].op === 'add') {
                temporaryMethodSettingOperations[j].op = 'replace';
            }
            // TODO: Temporary fix due to second AWS update bug (remove)
            if (temporaryMethodSettingOperations[j].op !== 'remove') {
                methodSettingsOperations.push(temporaryMethodSettingOperations[j]);
            }
        }
        return methodSettingsOperations;
    }
    return [];
}
