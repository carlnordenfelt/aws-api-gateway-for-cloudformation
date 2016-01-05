'use strict';

var Constants = require('../Constants');

var pub = {};

pub.getAllowMethodsValue = function getAllowMethodsValue(methods) {
    methods = methods || [];
    if (methods.indexOf(Constants.CORS_OPTIONS_METHOD) === -1) {
        methods.push(Constants.CORS_OPTIONS_METHOD);
    }
    return encapsulateHeader(methods.join(','));
};

pub.getAllowOriginValue = function getAllowOriginValue(origin) {
    origin = origin || Constants.CORS_DEFAULT_ORIGIN;
    return encapsulateHeader(origin);
};

pub.getAllowHeadersValue = function getAllowHeadersValue(headers) {
    return encapsulateHeader(headers.join(','));
};

pub.getExposeHeadersValue = function exposeHeadersValue(exposeHeaders) {
    return encapsulateHeader(exposeHeaders.join(','));
};

pub.getMaxAgeValue = function getMaxAgeValue(maxAge) {
    return encapsulateHeader(maxAge.toString());
};

pub.getAllowCredentialsValue = function getAllowCredentialsValue(allowCredentials) {
    if (allowCredentials && allowCredentials.toString() === 'true') {
        return encapsulateHeader('true');
    }
};

function encapsulateHeader(header) {
    return '\'' + header + '\'';
}

pub.getCorsChanges = function getCorsChanges(newCorsConfig, oldCorsConfig) {
    oldCorsConfig = oldCorsConfig || {};

    var changes = {
        hasOriginChanged: newCorsConfig.allowOrigin !== oldCorsConfig.allowOrigin,
        hasMethodsChanged: !areEqual(newCorsConfig.allowMethods, oldCorsConfig.allowMethods),
        hasOtherChanges:
            !areEqual(newCorsConfig.allowHeaders, oldCorsConfig.allowHeaders) ||
            !areEqual(newCorsConfig.exposeHeaders, oldCorsConfig.exposeHeaders) ||
            newCorsConfig.maxAge !== oldCorsConfig.maxAge ||
            newCorsConfig.allowCredentials !== oldCorsConfig.allowCredentials
    };

    changes.hasChanged = changes.hasOriginChanged || changes.hasMethodsChanged || changes.hasOtherChanges;

    return changes;
};

function areEqual(x, y) {
    x = x || [];
    y = y || [];
    for (var i = 0; i < x.length; i++) {
        if (y.indexOf(x[i]) === -1) {
            return false;
        }
    }
    for (var j = 0; j < y.length; j++) {
        if (x.indexOf(y[j]) === -1) {
            return false;
        }
    }
    return true;
}

module.exports = pub;
