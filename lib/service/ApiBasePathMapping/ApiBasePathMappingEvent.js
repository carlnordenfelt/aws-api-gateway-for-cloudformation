'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-base-path-mapping-schema');
var pub = {};

pub.getParameters = function getParameters(event) {
    return validator.validate(event, schema);
};

var allowedModifications = {
    add: [],
    replace: ['basePath', 'restapiId', 'stage'],
    remove: []
};
pub.getPatchOperations = function (eventParams) {
    // Work around due to faulty, or inconsistent, AWS validation where it requires restapiId rather than restApiId (casing)
    eventParams.params.restapiId = eventParams.params.restApiId;
    eventParams.old.restapiId = eventParams.old.restApiId;

    var modifications = patchOperationsHelper.getAllowedModifications(eventParams.params, eventParams.old, allowedModifications);
    return patchOperationsHelper.getOperations(eventParams.params, modifications);
};

module.exports = pub;
