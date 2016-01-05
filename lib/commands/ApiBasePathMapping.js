'use strict';

var ApiBasePathMappingService = require('../service/ApiBasePathMapping/ApiBasePathMappingService');
var ApiBasePathMappingEvent = require('../service/ApiBasePathMapping/ApiBasePathMappingEvent');

var pub = {};

pub.getParameters = function (event) {
    return ApiBasePathMappingEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiBasePathMappingService.createBasePathMapping(eventParams.params, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.basePath, eventParams.params.domainName, callback);
    });
};

pub.deleteResource = function deleteResource(_event, _context, eventParams, callback) {
    ApiBasePathMappingService.deleteBasePathMapping(eventParams.params, function (error) {
        callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiBasePathMappingService.patchBasePathMapping(eventParams.params.basePath, eventParams.params.domainName, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.basePath, eventParams.params.domainName, callback);
    });
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(_event, _context, basePath, domainName, callback) {
    ApiBasePathMappingService.getForResponse(basePath, domainName, function (error, basePathMapping) {
        if (error) {
            return callback(error);
        }
        return callback(error, basePathMapping);
    });
}
