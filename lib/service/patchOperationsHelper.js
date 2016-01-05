'use strict';

var _ = require('lodash');
var equal = require('deep-equal');

var pub = {};

/* eslint max-statements: 0 */
pub.getAllowedModifications = function getAllowedModifications(newConfiguration, oldConfiguration, allowedModifications) {
    if (!oldConfiguration) {
        oldConfiguration = {};
    }
    var newConfigurationProperties = Object.getOwnPropertyNames(newConfiguration);
    var oldConfigurationProperties = Object.getOwnPropertyNames(oldConfiguration);

    if (!allowedModifications) {
        allowedModifications = {};
    }
    if (!allowedModifications.add) {
        allowedModifications.add = [];
    }
    if (!allowedModifications.remove) {
        allowedModifications.remove = [];
    }
    if (!allowedModifications.replace) {
        allowedModifications.replace = [];
    }

    var modifications = {
        add: _.intersection(_.difference(newConfigurationProperties, oldConfigurationProperties), allowedModifications.add),
        remove: _.intersection(_.difference(oldConfigurationProperties, newConfigurationProperties), allowedModifications.remove),
        replace: []
    };

    var potentiallyChangedKeys = _.intersection(oldConfigurationProperties, newConfigurationProperties);
    potentiallyChangedKeys.forEach(function (key) {
        if (!equal(oldConfiguration[key], newConfiguration[key]) && allowedModifications.replace.indexOf(key) > -1) {
            modifications.replace.push(key);
        }
    });

    if (allowedModifications.addForReplace) {
        var addForReplace = _.intersection(_.difference(newConfigurationProperties, oldConfigurationProperties), allowedModifications.addForReplace);
        modifications.replace = modifications.replace.concat(addForReplace);
    }
    return modifications;
};

pub.getOperations = function getOperations(configuration, modifications) {
    var operations = [];

    for (var op in modifications) {
        /* istanbul ignore else */
        if (modifications.hasOwnProperty(op)) {
            for (var i = 0; i < modifications[op].length; i++) {
                if (op === 'remove' || configuration[modifications[op][i]] !== undefined) {
                    operations.push(
                        {
                            op: op,
                            path: '/' + modifications[op][i],
                            value: configuration[modifications[op][i]]
                        }
                    );
                }
            }
        }
    }
    return operations;
};

module.exports = pub;
