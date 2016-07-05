'use strict';

var patchOperationsHelper = require('../patch-operations-helper');
var certificateParser = require('../util/certificate-parser');
var validator = require('../util/validator');
var schema = require('../json-schemas/api-domain-name-schema');
var pub = {};

/* eslint max-statements: 0 */
/* eslint complexity: 0 */
pub.getParameters = function getParameters(event) {
    var eventParams = validator.validate(event, schema);

    if (event.RequestType !== 'Delete') {
        // Parse the certificate parts as they are mangled by CloudFormation
        if (eventParams.params.certificateBody && eventParams.params.certificateChain) {
            eventParams.params.certificateBody = certificateParser.parseCertificate(eventParams.params.certificateBody, certificateParser.CERTIFICATE_PART.BODY);
            eventParams.params.certificateChain = certificateParser.parseCertificate(eventParams.params.certificateChain, certificateParser.CERTIFICATE_PART.CHAIN);
        }
        eventParams.params.certificatePrivateKey = certificateParser.parseCertificate(eventParams.params.certificatePrivateKey, certificateParser.CERTIFICATE_PART.PRIVATE_KEY);

        if (eventParams.old) {
            if (eventParams.old.certificateBody && eventParams.old.certificateChain) {
                eventParams.old.certificateBody = certificateParser.parseCertificate(eventParams.old.certificateBody, certificateParser.CERTIFICATE_PART.BODY);
                eventParams.old.certificateChain = certificateParser.parseCertificate(eventParams.old.certificateChain, certificateParser.CERTIFICATE_PART.CHAIN);
            }
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
