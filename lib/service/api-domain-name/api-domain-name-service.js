'use strict';

var getWrappedService = require('../util/api-gateway-retry-wrapper');
var awsApiGateway = getWrappedService({ apiVersion: '2015-07-09' });
var aws = require('aws-sdk');
var iam = new aws.IAM({apiVersion: '2010-05-08'});
var ApiDomainNameEvent = require('./api-domain-name-event');
var certificateParser = require('../util/certificate-parser');

var logger = require('../util/logger');

var pub = {};

pub.getForResponse = function getForResponse(domainName, callback) {
    var params = {
        domainName: domainName
    };
    awsApiGateway.getDomainName(params, function (error, apiDomainName) {
        if (error) {
            logger.log('Error ApiDomainNameService::getForResponse', { error: error, params: params });
        }
        return callback(error, apiDomainName);
    });
};

pub.createDomain = function createDomain(parameters, callback) {
    if (parameters.iamServerCertificateName) {
        var iamParams = {
            ServerCertificateName: parameters.iamServerCertificateName
        };
        iam.getServerCertificate(iamParams, function (iamError, iamResponse) {
            if (iamError) {
                logger.log('Error ApiDomainNameService::createDomainName:getServerCertificate', { error: iamError, params: iamParams });
                return callback(iamError);
            } else if (!iamResponse || !iamResponse.ServerCertificate || !iamResponse.ServerCertificate.CertificateBody || !iamResponse.ServerCertificate.CertificateChain) {
                logger.log('Invalid server certificate. It must contain both a certificate body and a certificate chain.', { certificateData: iamResponse.ServerCertificate });
                return callback('Invalid server certificate. It must contain both a certificate body and a certificate chain.');
            }

            parameters.certificateBody = certificateParser.parseCertificate(iamResponse.ServerCertificate.CertificateBody, certificateParser.CERTIFICATE_PART.BODY);
            parameters.certificateChain = certificateParser.parseCertificate(iamResponse.ServerCertificate.CertificateChain, certificateParser.CERTIFICATE_PART.CHAIN);
            _createDomain(parameters, callback);
        });
    } else {
        _createDomain(parameters, callback);
    }
};

pub.deleteDomain = function deleteDomain(domainName, callback) {
    var params = {
        domainName: domainName
    };
    awsApiGateway.deleteDomainName(params, function (error) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiDomainNameService::deleteDomainName', { error: error, params: params });
            return callback(error);
        }
        callback();
    });
};

pub.patchDomain = function patchDomain(domainName, eventParams, callback) {
    var patchOperations = ApiDomainNameEvent.getPatchOperations(eventParams);
    if (patchOperations.length === 0) {
        return callback();
    }
    var params = {
        domainName: domainName,
        patchOperations: patchOperations
    };
    awsApiGateway.updateDomainName(params, function (error, apiDomainName) {
        if (error && error.code !== 'NotFoundException') {
            logger.log('Error ApiDomainNameService::patchDomain', error, params);
            return callback(error);
        }
        return callback(undefined, apiDomainName);
    });
};

module.exports = pub;

function _createDomain(parameters, callback) {
    var params = {
        certificateBody: parameters.certificateBody,
        certificateChain: parameters.certificateChain,
        certificateName: parameters.certificateName,
        certificatePrivateKey: parameters.certificatePrivateKey,
        domainName: parameters.domainName
    };
    awsApiGateway.createDomainName(params, function (error, apiDomainName) {
        if (error) {
            params.certificatePrivateKey = '***masked***'; // We don't want the private key in the logs
            logger.log('Error ApiDomainNameService::createDomainName', { error: error, params: params });
        }
        return callback(error, apiDomainName);
    });
}
