'use strict';

var patchOperationsHelper = require('../patchOperationsHelper');
var certificateParser = require('../util/certificateParser');

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };

    if (event.RequestType !== 'Delete') {
        // Validation
        if (!eventParams.params.certificateBody) {
            return new Error('Missing parameter {certificateBody} in input');
        }
        if (!eventParams.params.certificateChain) {
            return new Error('Missing parameter {certificateChain} in input');
        }
        if (!eventParams.params.certificateName) {
            return new Error('Missing parameter {certificateName} in input');
        }
        if (!eventParams.params.certificatePrivateKey) {
            return new Error('Missing parameter {certificatePrivateKey} in input');
        }
        if (!eventParams.params.domainName) {
            return new Error('Missing parameter {domainName} in input');
        }

        // Parse the certificate parts as they are mangled by CloudFormation
        eventParams.params.certificateBody = certificateParser.parseCertificate(eventParams.params.certificateBody, certificateParser.CERTIFICATE_PART.BODY);
        eventParams.params.certificateChain = certificateParser.parseCertificate(eventParams.params.certificateChain, certificateParser.CERTIFICATE_PART.CHAIN);
        eventParams.params.certificatePrivateKey = certificateParser.parseCertificate(eventParams.params.certificatePrivateKey, certificateParser.CERTIFICATE_PART.PRIVATE_KEY);

        if (eventParams.old) {
            eventParams.old.certificateBody = certificateParser.parseCertificate(eventParams.old.certificateBody, certificateParser.CERTIFICATE_PART.BODY);
            eventParams.old.certificateChain = certificateParser.parseCertificate(eventParams.old.certificateChain, certificateParser.CERTIFICATE_PART.CHAIN);
            eventParams.old.certificatePrivateKey = certificateParser.parseCertificate(eventParams.old.certificatePrivateKey, certificateParser.CERTIFICATE_PART.PRIVATE_KEY);
        }
    }

    return eventParams;
};

var allowedModifications = {
    add: [],
    replace: ['domainName', 'certificateName', 'certificateBody', 'certificatePrivateKey', 'certificateChain'],
    remove: []
};
pub.getPatchOperations = function (eventParams) {
    var modifications = patchOperationsHelper.getAllowedModifications(eventParams.params, eventParams.old, allowedModifications);
    return patchOperationsHelper.getOperations(eventParams.params, modifications);
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        certificateBody: resourceProperties.certificateBody,
        certificateChain: resourceProperties.certificateChain,
        certificateName: resourceProperties.certificateName,
        certificatePrivateKey: resourceProperties.certificatePrivateKey,
        domainName: resourceProperties.domainName
    };
}
