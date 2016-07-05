'use strict';

var patchOperationsHelper = require('../patch-operations-helper');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-authorizer-schema');
var pub = {};

pub.getParameters = function getParameters(event) {
    return validator.validate(event, schema);
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
