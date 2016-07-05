'use strict';

var _ = require('lodash');
var equal = require('deep-equal');

var pub = {};

/* eslint max-statements: 0 */
/**
 *
 * @param newConfiguration
 * @param oldConfiguration
 * @param allowedModifications Optional. If not provided any modification is allowed.
 * @returns {{add: *, remove: *, replace: Array}}
 */
pub.getAllowedModifications = function getAllowedModifications(newConfiguration, oldConfiguration, allowedModifications) {
    if (!oldConfiguration) {
        oldConfiguration = {};
    }
    var newConfigurationProperties = Object.getOwnPropertyNames(newConfiguration);
    var oldConfigurationProperties = Object.getOwnPropertyNames(oldConfiguration);
    var modifications = {
        add: _.difference(newConfigurationProperties, oldConfigurationProperties),
        remove: _.difference(oldConfigurationProperties, newConfigurationProperties),
        replace: []
    };

    if (allowedModifications) {
        if (!allowedModifications.add) {
            allowedModifications.add = [];
        }
        if (!allowedModifications.remove) {
            allowedModifications.remove = [];
        }
        if (!allowedModifications.replace) {
            allowedModifications.replace = [];
        }
        modifications.add = _.intersection(modifications.add, allowedModifications.add);
        modifications.remove = _.intersection(modifications.remove, allowedModifications.remove);
    }

    var potentiallyChangedKeys = _.intersection(oldConfigurationProperties, newConfigurationProperties);
    potentiallyChangedKeys.forEach(function (key) {
        if (!equal(oldConfiguration[key], newConfiguration[key]) && (!allowedModifications || allowedModifications.replace.indexOf(key) > -1)) {
            modifications.replace.push(key);
        }
    });

    if (allowedModifications && allowedModifications.addForReplace) {
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
                // There is no value if op equals remove
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
