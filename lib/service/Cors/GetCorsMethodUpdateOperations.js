'use strict';

var getWrappedService = require('./util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var Constants = require('./../Constants');
var _ = require('lodash');
var async = require('async');

/* eslint max-params: 0 */
module.exports = function getCorsMethodUpdateOperations(restApiId, resourceId, newMethods, newOrigin, oldMethods, oldOrigin, callback) {
    var add = _.difference(newMethods, oldMethods);
    var remove = _.difference(oldMethods, newMethods);
    var replace = _.intersection(oldMethods, newMethods);

    var operations = [];
    for (var i = 0; i < add.length; i++) {
        if (add[i] !== Constants.CORS_OPTIONS_METHOD) {
            operations.push({
                httpMethod: add[i],
                op: 'add'
            });
        }
    }
    for (var j = 0; j < remove.length; j++) {
        if (remove[j] !== Constants.CORS_OPTIONS_METHOD) {
            operations.push({
                httpMethod: remove[j],
                op: 'remove'
            });
        }
    }
    if (newOrigin !== oldOrigin) {
        for (var k = 0; k < replace.length; k++) {
            if (replace[k] !== Constants.CORS_OPTIONS_METHOD) {
                operations.push({
                    httpMethod: replace[k],
                    op: 'replace'
                });
            }
        }
    }
    async.map(operations, function (operation, asyncCallback) {
        getMethodStatusCodes(operation.httpMethod, restApiId, resourceId, function (error, statusCodes) {
            if (error && error.code !== 'NotFoundException') {
                return asyncCallback(error);
            } else if (statusCodes) {
                var methodOperations = [];
                for (var l = 0; l < statusCodes.length; l++) {
                    methodOperations.push({
                        httpMethod: operation.httpMethod,
                        op: operation.op,
                        statusCode: statusCodes[l]
                    });
                }
                return asyncCallback(undefined, methodOperations);
            }
            return asyncCallback(undefined, []);
        });
    }, function (error, allOperations) {
        if (error) {
            return callback(error);
        }
        allOperations = _.compact(_.flatten(allOperations, true));
        return callback(undefined, allOperations);
    });
};

function getMethodStatusCodes(httpMethod, restApiId, resourceId, callback) {
    var params = {
        httpMethod: httpMethod,
        resourceId: resourceId,
        restApiId: restApiId
    };
    awsApiGateway.getMethod(params, function (error, method) {
        if (error) {
            return callback(error);
        }
        var statusCodes;
        if (method.methodIntegration && method.methodIntegration.integrationResponses) {
            statusCodes = Object.getOwnPropertyNames(method.methodIntegration.integrationResponses);
        }
        callback(undefined, statusCodes);
    });
}
