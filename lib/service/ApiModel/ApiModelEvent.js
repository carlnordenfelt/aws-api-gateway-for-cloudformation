'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-model-schema');
var pub = {};

pub.getParameters = function getParameters(event) {
    return validator.validate(event, schema);
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
