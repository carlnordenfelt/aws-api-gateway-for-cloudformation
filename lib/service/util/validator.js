'use strict';

var jsonSchemaValidator = require('jsonschema').Validator;
var validator = new jsonSchemaValidator(); // eslint-disable-line new-cap
var validatorOptions = {
    propertyName: 'input',
    // enables use of the default value in the schema, if any
    rewrite: function (instance, schema, _options, _ctx) {
        if (instance === undefined) {
            if (schema.required !== true && schema.default !== undefined) {
                instance = schema.default;
            }
        }
        return instance;
    }
};
var pub = {};

pub.validate = function (event, schema) {
    var ignoreErrors = event.RequestType === 'Delete';
    var eventParams = {
        params: null,
        old: null
    };

    var resourceProperties = validate(event.ResourceProperties, schema, validatorOptions, ignoreErrors);
    eventParams.params = resourceProperties.instance;
    if (event.OldResourceProperties) {
        var oldResourceProperties = validate(event.OldResourceProperties, schema, validatorOptions, true);
        eventParams.old = oldResourceProperties.instance;
    }
    return eventParams;
};

pub.throwOnError = function (errors) {
    if (errors.length === 1) {
        throw new Error('Validation error: ' + errors[0].stack);
    } else if (errors.length > 1) {
        var errorMessage = 'Multiple validation errors: ';
        for (var i = 0; i < errors.length; i++) {
            errorMessage += ' [' + (i + 1) + ']' + errors[i].stack;
        }
        throw new Error(errorMessage);
    }
};

module.exports = pub;

function validate(input, schema, options, ignoreErrors) {
    delete input.ServiceToken;
    var result = validator.validate(input, schema, options);
    if (!ignoreErrors) {
        pub.throwOnError(result.errors);
    }
    return result;
}
