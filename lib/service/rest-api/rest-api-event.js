'use strict';

var patchOperationsHelper = require('../patch-operations-helper');
var validator = require('../util/validator');
var schema = require('../json-schemas/rest-api-schema');
var _ = require('lodash');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);
    if (eventParams.params.corsConfiguration && eventParams.params.corsConfiguration.allowDefaultHeaders === 'true') {
        eventParams.params.corsConfiguration.allowHeaders =
            _.union(eventParams.params.corsConfiguration.allowHeaders.concat(['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']));
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

var VALID_API_ID_REG_EXP = /^[a-zA-Z0-9]+$/;
pub.isValidResourceId = function (resourceId) {
    return VALID_API_ID_REG_EXP.test(resourceId);
};

module.exports = pub;
