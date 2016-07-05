'use strict';

var patchOperationsHelper = require('../patch-operations-helper');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-resource-schema');
var _ = require('lodash');
var pub = {};

/* eslint max-statements: 0 */
pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);
    if (eventParams.params.corsConfiguration && eventParams.params.corsConfiguration.allowDefaultHeaders) {
        eventParams.params.corsConfiguration.allowHeaders =
            _.union(eventParams.params.corsConfiguration.allowHeaders.concat(['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']));
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
