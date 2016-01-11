'use strict';

var getWrappedService = require('./util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(domainName, callback) {
    var params = {
        domainName: domainName
    };
    awsApiGateway.getDomainName(params, function (error, apiDomainName) {
        if (error) {
            logger.log('Error ApiDomainNameService::getForResponse', error, params);
        }
        return callback(error, apiDomainName);
    });
};

pub.createDomain = function createDomain(parameters, callback) {
    var params = {
        certificateBody: parameters.certificateBody,
        certificateChain: parameters.certificateChain,
        certificateName: parameters.certificateName,
        certificatePrivateKey: parameters.certificatePrivateKey,
        domainName: parameters.domainName
    };
    awsApiGateway.createDomainName(params, function (error, apiDomainName) {
        if (error) {
            logger.log('Error ApiDomainNameService::createDomain', error, params);
        }
        return callback(error, apiDomainName);
    });
};

pub.deleteDomain = function deleteDomain(domainName, callback) {
    var params = {
        domainName: domainName
    };
    awsApiGateway.deleteDomainName(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiDomainNameService::deleteDomain', error, params);
            return callback(error);
        }
        callback();
    });
};

pub.patchDomain = function patchDomain(_domainName, _eventParams, callback) {
    return callback();
    //Updates currently not allowed
    //var patchOperations = ApiDomainNameEvent.getPatchOperations(eventParams);
    //if (patchOperations.length === 0) {
    //    return callback();
    //}
    //var params = {
    //    domainName: domainName,
    //    patchOperations: patchOperations
    //};
    //awsApiGateway.updateDomainName(params, function(error, apiDomainName) {
    //    if (error && error.code !== 'NotFoundException') {
    //        logger.log('Error ApiDomainNameService::patchDomain', error, params);
    //        return callback(error);
    //    }
    //    return callback(undefined, apiDomainName);
    //});
};

module.exports = pub;
