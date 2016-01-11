'use strict';

var logger = require('./logger');
var aws = require('aws-sdk');
var _minRetryIntervalMs;
var _maxRetries;

function GetWrappedService(options, minRetryIntervalMs, maxRetries) {
    _minRetryIntervalMs = minRetryIntervalMs || 2000;
    _maxRetries = maxRetries || 8;

    var apiGateway = new aws.APIGateway(options);
    _wrapMethods(apiGateway);

    return apiGateway;
}

function _wrapMethods(apiGateway) {
    for (var prop in apiGateway) {
        if (!apiGateway.hasOwnProperty(prop)) {
            continue;
        }

        var value = apiGateway[prop];

        if (_isWrappableMethod(value)) {
            _wrapMethod(apiGateway, prop, value);
        }
    }
}

function _isWrappableMethod(value) {
    return typeof value === 'function';
}

function _wrapMethod(apiGateway, methodName, method) {
    apiGateway[methodName] = _getWrappedMethod(apiGateway, methodName, method);
}

function _getWrappedMethod(apiGateway, methodName, method) {
    return function (params, callback) {
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
        if (err && _isRetryableError(err)) {
            if (++invocationData.retryCount < _maxRetries) {
                // Wait then retry.
                var retryIntervalMs = _getRetryInterval();
                logger.log(invocationData.methodName + ' failed with TooManyRequestsException; retrying in ' + retryIntervalMs); setTimeout(function () {
                    logger.log('Retrying ' + invocationData.methodName);
                    _invokeInnerMethod(invocationData);
                }, retryIntervalMs);

                // Drop out so we don't invoke the original callback.
                return;
            }

            // Too many retries - abandon ship.
            logger.log(invocationData.methodName + ' failed with TooManyRequestsException and reached max retry count (' + _maxRetries + ')');
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
        && err.code === 'TooManyRequestsException';
}

function _getRetryInterval() {
    var retryWindow = 5000;
    return _minRetryIntervalMs
        + Math.random() * retryWindow;
}

module.exports = GetWrappedService;
