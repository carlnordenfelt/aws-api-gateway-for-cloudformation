'use strict';

var validator = require('../util/validator');
var schema = require('../json-schemas/api-import-schema');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);

    if (eventParams.params.restApiId) {
        eventParams.params.updateMode = 'merge';
    } else {
        eventParams.params.updateMode = 'overwrite';
    }
    return eventParams;
};

module.exports = pub;
