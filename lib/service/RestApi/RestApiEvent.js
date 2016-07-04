'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var validator = require('../util/validator');
var schema = require('../json-schemas/rest-api-schema');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);
    if (eventParams.params.corsConfiguration && eventParams.params.corsConfiguration.allowDefaultHeaders) {
        eventParams.params.corsConfiguration.allowHeaders = eventParams.params.corsConfiguration.allowHeaders || [];
        eventParams.params.corsConfiguration.allowHeaders = eventParams.params.corsConfiguration.allowHeaders.concat(eventParams.params.corsConfiguration.allowHeaders);
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
