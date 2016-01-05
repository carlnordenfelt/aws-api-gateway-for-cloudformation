'use strict';

var ApiDomainNameService = require('../service/ApiDomainName/ApiDomainNameService');
var ApiDomainNameEvent = require('../service/ApiDomainName/ApiDomainNameEvent');

var pub = {};

pub.getParameters = function (event) {
    return ApiDomainNameEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiDomainNameService.createDomain(eventParams.params, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.domainName, callback);
    });
};

pub.deleteResource = function deleteResource(_event, _context, eventParams, callback) {
    ApiDomainNameService.deleteDomain(eventParams.params.domainName, function (error) {
        callback(error);
    });
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    ApiDomainNameService.patchDomain(eventParams.params.domainName, eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.domainName, callback);
    });
};

module.exports = pub;

function getForResponse(_event, _context, domainName, callback) {
    ApiDomainNameService.getForResponse(domainName, function (error, apiDomainName) {
        return callback(error, apiDomainName);
    });
}
