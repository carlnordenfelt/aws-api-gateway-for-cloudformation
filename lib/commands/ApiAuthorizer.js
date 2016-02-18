
'use strict';

var ApiAuthorizerService = require('../service/ApiAuthorizer/ApiAuthorizerService');
var ApiAuthorizerEvent = require('../service/ApiAuthorizer/ApiAuthorizerEvent');

var pub = {};

pub.getParameters = function (event) {
    return ApiAuthorizerEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiAuthorizerService.createAuthorizer(eventParams.params, function (error, apiAuthorizer) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, apiAuthorizer.id, eventParams.params.restApiId, callback);
    });
};

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    if (!_isValidPhysicalResourceId(event.PhysicalResourceId)) {
        return callback();
    }
    ApiAuthorizerService.deleteAuthorizer(event.PhysicalResourceId, eventParams.params.restApiId, function (error) {
        return callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiAuthorizerService.patchAuthorizer(event.PhysicalResourceId, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        return getForResponse(event, context, event.PhysicalResourceId, eventParams.params.restApiId, callback);
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(_event, _context, authorizerId, restApiId, callback) {
    ApiAuthorizerService.getForResponse(authorizerId, restApiId, function (error, apiAuthorizer) {
        if (error) {
            return callback(error);
        }
        apiAuthorizer.physicalResourceId = apiAuthorizer.id;
        return callback(null, apiAuthorizer);
    });
}

function _isValidPhysicalResourceId(physicalResourceId) {
    if (physicalResourceId.indexOf('/') > -1) {
        return false;
    }
    return true;
}
