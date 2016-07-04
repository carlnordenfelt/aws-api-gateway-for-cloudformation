'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-deploy-schema');

var pub = {};

pub.getParameters = function getParameters(event) {
    return validator.validate(event, schema);
};

var allowedStageModifications = {
    add: [],
    addForReplace: ['stageDescription'],
    replace: [
        'stageDescription',
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

function getStageConfigPatchOperations(eventParams, allowedModifications) {
    var stageModifications = patchOperationsHelper.getAllowedModifications(eventParams.params, eventParams.old, allowedModifications);
    var operations = patchOperationsHelper.getOperations(eventParams.params, stageModifications);
    for (var i = 0; i < operations.length; i++) {
        if (operations[i].path === '/stageDescription') {
            operations[i].path = '/description';
        }
    }
    return operations;
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
            // FIXME: Temporary workaround until AWS has sorted the update bug (~1)
            if (temporaryMethodSettingOperations[j].path.indexOf('/*/*/') !== 0) {
                temporaryMethodSettingOperations[j].path = '/~1' + temporaryMethodSettingOperations[j].path.substring(1);
            }
            if (temporaryMethodSettingOperations[j].op === 'add') {
                temporaryMethodSettingOperations[j].op = 'replace';
            }
            // FIXME: Temporary fix due to second AWS update bug (remove)
            if (temporaryMethodSettingOperations[j].op !== 'remove') {
                methodSettingsOperations.push(temporaryMethodSettingOperations[j]);
            }
        }
        return methodSettingsOperations;
    }
    return [];
}
