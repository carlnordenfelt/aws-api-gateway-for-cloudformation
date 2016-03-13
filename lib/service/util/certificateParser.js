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
        .replace(certHeaderFooter[part].header, '')// Remove header and footer, we'll re-add them later
        .replace(certHeaderFooter[part].footer, '')
        .trim() // Trim to be sure we don't inject a bad new line
        .replace(/\\n/g, '\n') // Replace escaped new line with proper new line
        .replace(/ /g, '\n') // Replace space with new line
        .trim(); // Add a final trim as a new line might have slipped in at the end
    // Rebuild cert with header and footer
    return certHeaderFooter[part].header + '\n' + cleanString + '\n' + certHeaderFooter[part].footer;
};

module.exports = pub;
