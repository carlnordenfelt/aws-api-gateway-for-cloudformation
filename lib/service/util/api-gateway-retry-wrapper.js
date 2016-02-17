'use strict';

var logger = require('./logger');
var aws = require('aws-sdk');
var _minRetryIntervalMs;
var _maxRetries;
var _retryWindow;

function getWrappedService(sdkOptions, options) {
    _minRetryIntervalMs = options && options.minRetryIntervalMs || 2000;
    _maxRetries = options && options.maxRetries || 8;
    _retryWindow = options && options.retryWindow || 5000;

    var apiGateway = new aws.APIGateway(sdkOptions);
    _wrapMethods(apiGateway);

    return apiGateway;
}

function _wrapMethods(apiGateway) {
    var methodsToWrap = [
        'getBasePathMapping',
        'createBasePathMapping',
        'deleteBasePathMapping',
        'updateBasePathMapping',
        'getDomainName',
        'createDomainName',
        'deleteDomainName',
        'updateDomainName',
        'getMethod',
        'deleteMethod',
        'putMethod',
        'putIntegration',
        'putMethodResponse',
        'updateMethodResponse',
        'putIntegrationResponse',
        'updateIntegrationResponse',
        'getModel',
        'createModel',
        'deleteModel',
        'updateModel',
        'getResource',
        'createResource',
        'deleteResource',
        'updateResource',
        'getResources',
        'getRestApi',
        'createRestApi',
        'deleteRestApi',
        'updateRestApi',
        'getRestApis'
    ];

    for (var i = 0; i < methodsToWrap.length; i++) {
        var methodName = methodsToWrap[i];
        var method = apiGateway[methodName];

        _wrapMethod(apiGateway, methodName, method);
    }
}

function _wrapMethod(apiGateway, methodName, method) {
    apiGateway[methodName] = _getWrappedMethod(apiGateway, methodName, method);
}

function _getWrappedMethod(apiGateway, methodName, method) {
    return function (params, callback) {
        logger.log('Calling wrappedMethod: ' + methodName);
        var invocationData = {
            apiGateway: apiGateway,
            methodName: methodName,
            method: method,
            retryCount: 0,
            params: params,
            originalCallback: callback
        };

        // Invoke original method repeatedly until no TooManyRequestsException or max retry limit hit.
        _invokeInnerMethod(invocationData);
    };
}

function _invokeInnerMethod(invocationData) {
    // Replace the original callback with our own to check for TooManyRequests exceptions.
    var retryCheck = function (err, data) { //eslint-disable-line func-style
        logger.log(invocationData.methodName + ' completed.\n'
                                             + 'retryCheck(err: ' + err + ', data: ' + data + ')');

        if (err && _isRetryableError(err)) {
            if (++invocationData.retryCount <= _maxRetries) {
                // Wait then retry.
                var retryIntervalMs = _getRetryInterval();
                logger.log(invocationData.methodName + ' failed with a retry-able error. Retrying in ' + retryIntervalMs);

                setTimeout(function () {
                    logger.log('Retrying ' + invocationData.methodName);
                    _invokeInnerMethod(invocationData);
                }, retryIntervalMs);

                // Drop out so we don't invoke the original callback.
                return;
            }

            // Too many retries - abandon ship.
            logger.log(invocationData.methodName + ' failed with a retryable error and reached max retry count (' + _maxRetries + ')');
        }

        // If we reach here, the call either:
        //  - succeeded (yay);
        //  - failed with an error other than TooManyRequests;
        //  - reached the max retry count after numerous TooManyRequests errors.
        // Whichever, we still need to invoke the original callback.
        invocationData.originalCallback(err, data);
    };

    invocationData.method.call(invocationData.apiGateway, invocationData.params, retryCheck);
}

function _isRetryableError(err) {
    return err
        && err.code === 'TooManyRequestsException'
        || err.toString().indexOf('try again') > -1;
}

function _getRetryInterval() {
    return _minRetryIntervalMs
        + Math.random() * _retryWindow;
}

module.exports = getWrappedService;
