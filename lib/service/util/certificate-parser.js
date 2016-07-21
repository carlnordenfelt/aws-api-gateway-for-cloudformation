'use strict';

var pub = {};
pub.CERTIFICATE_PART = {
    CHAIN: 'CHAIN',
    BODY: 'BODY',
    PRIVATE_KEY: 'PRIVATE_KEY'
};
var certHeaders = {
    CHAIN: '-----BEGIN CERTIFICATE-----',
    BODY: '-----BEGIN CERTIFICATE-----',
    PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----'
};
var certFooters = {
    CHAIN: '-----END CERTIFICATE-----',
    BODY: '-----END CERTIFICATE-----',
    PRIVATE_KEY: '-----END RSA PRIVATE KEY-----'
};

/* eslint dot-location: 0 */
pub.parseCertificate = function (certificate, part) {
    if (!certHeaders[part]) {
        throw new Error('Invalid certificate part specified', { givenPart: part, allowedParts: pub.CERTIFICATE_PART });
    }
    var cleanString = certificate
        .replace(new RegExp(certHeaders[part], 'g'), 'CERT_HEADER_PLACEHOLDER') // Remove headers and footers, we'll re-add them later
        .replace(new RegExp(certFooters[part], 'g'), 'CERT_FOOTER_PLACEHOLDER')

        .replace(/\\n/g, '\n') // Replace escaped new line with proper new line
        .replace(/ /g, '\n') // Replace space with new line

        .replace(/CERT_HEADER_PLACEHOLDER\n/g, 'CERT_HEADER_PLACEHOLDER') // Remove any extra newlines that have snuck in
        .replace(/\nCERT_FOOTER_PLACEHOLDER/g, 'CERT_FOOTER_PLACEHOLDER')

        .replace(/CERT_HEADER_PLACEHOLDER/g, certHeaders[part] + '\n') // Replace headers and footers
        .replace(/CERT_FOOTER_PLACEHOLDER/g, '\n' + certFooters[part]);

    return cleanString;
};

module.exports = pub;
