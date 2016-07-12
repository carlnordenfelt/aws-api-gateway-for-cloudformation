'use strict';

var expect = require('chai').expect;

var testSubject = require('../../../../lib/service/util/certificate-parser');

describe('certificateParser', function () {

    describe('ParseCertificate', function () {
        describe('Parse CHAIN part', function () {
            it('should give a valid certificate with newline', function (done) {
                var certificate = '-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.CHAIN);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
            it('should give a valid certificate with space', function (done) {
                var certificate = '-----BEGIN CERTIFICATE----- line1 line2 -----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.CHAIN);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
            it('should give a valid certificate with escaped newline', function (done) {
                var certificate = '-----BEGIN CERTIFICATE-----\\nline1\\nline2\\n-----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.CHAIN);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
        });
        describe('Parse BODY part', function () {
            it('should give a valid certificate with newline', function (done) {
                var certificate = '-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.BODY);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
            it('should give a valid certificate with space', function (done) {
                var certificate = '-----BEGIN CERTIFICATE----- line1 line2 -----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.BODY);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
            it('should give a valid certificate with escaped newline', function (done) {
                var certificate = '-----BEGIN CERTIFICATE-----\\nline1\\nline2\\n-----END CERTIFICATE-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.BODY);
                expect(parsedCertificate).to.equal('-----BEGIN CERTIFICATE-----\nline1\nline2\n-----END CERTIFICATE-----');
                done();
            });
        });
        describe('Parse PRIVATE_KEY part', function () {
            it('should give a valid certificate with newline', function (done) {
                var certificate = '-----BEGIN RSA PRIVATE KEY-----\nline1\nline2\n-----END RSA PRIVATE KEY-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.PRIVATE_KEY);
                expect(parsedCertificate).to.equal('-----BEGIN RSA PRIVATE KEY-----\nline1\nline2\n-----END RSA PRIVATE KEY-----');
                done();
            });
            it('should give a valid certificate with space', function (done) {
                var certificate = '-----BEGIN RSA PRIVATE KEY----- line1 line2 -----END RSA PRIVATE KEY-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.PRIVATE_KEY);
                expect(parsedCertificate).to.equal('-----BEGIN RSA PRIVATE KEY-----\nline1\nline2\n-----END RSA PRIVATE KEY-----');
                done();
            });
            it('should give a valid certificate with escaped newline', function (done) {
                var certificate = '-----BEGIN RSA PRIVATE KEY-----\\nline1\\nline2\\n-----END RSA PRIVATE KEY-----';
                var parsedCertificate = testSubject.parseCertificate(certificate, testSubject.CERTIFICATE_PART.PRIVATE_KEY);
                expect(parsedCertificate).to.equal('-----BEGIN RSA PRIVATE KEY-----\nline1\nline2\n-----END RSA PRIVATE KEY-----');
                done();
            });
        });
        describe('Parse INVALID part', function () {
            it('should throw an error', function (done) {
                var certificate = '-----BEGIN RSA PRIVATE KEY-----\nline1\nline2\n-----END RSA PRIVATE KEY-----';
                function test() {
                    testSubject.parseCertificate(certificate, 'INVALID');
                }
                expect(test).to.throw(Error);
                done();
            });
        });
    });
});
