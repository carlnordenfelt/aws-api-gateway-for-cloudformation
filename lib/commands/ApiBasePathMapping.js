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

pub.deleteResource = function deleteResource(event, _context, eventParams, callback) {
    var domainAndBasePath = _parsePhysicalResourceId(event.PhysicalResourceId, eventParams.params.domainName, eventParams.params.basePath);
    ApiBasePathMappingService.deleteBasePathMapping(domainAndBasePath, function (error) {
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

function _parsePhysicalResourceId(physicalResourceId, eventDomainName, eventBasePath) {
    var parts = physicalResourceId.split('/');
    if (parts.length > 1) {
        return {
            domainName: parts[0],
            basePath: parts.slice(1).join('/')
        };
    }
    // Fallback if the PhysicalResourceId appears to be incorrectly formatted.
    // This happens if the create operation fails and CFN makes a subsequent delete call to clean up.
    return {
        domainName: eventDomainName,
        basePath: eventBasePath
    };
}
