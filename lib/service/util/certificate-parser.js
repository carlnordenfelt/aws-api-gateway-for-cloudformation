'use strict';

var pub = {};
pub.CERTIFICATE_PART = {
    CHAIN: 'CHAIN',
    BODY: 'BODY',
    PRIVATE_KEY: 'PRIVATE_KEY'
};
var certHeaderFooter = {
    CHAIN: { footer: '-----END CERTIFICATE-----', header: '-----BEGIN CERTIFICATE-----' },
    BODY: { footer: '-----END CERTIFICATE-----', header: '-----BEGIN CERTIFICATE-----' },
    PRIVATE_KEY: { footer: '-----END RSA PRIVATE KEY-----', header: '-----BEGIN RSA PRIVATE KEY-----' }
};

/* eslint dot-location: 0 */
pub.parseCertificate = function (certificate, part) {
    if (!certHeaderFooter[part]) {
        throw new Error('Invalid certificate part specified', { givenPart: part, allowedParts: pub.CERTIFICATE_PART });
    }
    var cleanString = certificate
        .replace(new RegExp(certHeaderFooter[part].header, 'g'), 'CERTHEADERFOOTERHEADER') // Remove headers and footers, we'll re-add them later
        .replace(new RegExp(certHeaderFooter[part].footer, 'g'), 'CERTHEADERFOOTERFOOTER')

        .replace(/\\n/g, '\n') // Replace escaped new line with proper new line
        .replace(/ /g, '\n') // Replace space with new line


        .replace(/CERTHEADERFOOTERHEADER\n/g, 'CERTHEADERFOOTERHEADER') // Remove any extra newlines that have snuck in
        .replace(/\nCERTHEADERFOOTERFOOTER/g, 'CERTHEADERFOOTERFOOTER')

        .replace(/CERTHEADERFOOTERHEADER/g, certHeaderFooter[part].header + '\n') // Replace headers and footers
        .replace(/CERTHEADERFOOTERFOOTER/g, '\n' + certHeaderFooter[part].footer);

    return cleanString;
};

module.exports = pub;
