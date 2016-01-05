'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiDomainName/ApiDomainNameEvent');

describe('ApiDomainNameEvent', function () {

    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = {
                ResourceProperties: {
                    certificateBody: 'CertificateBody',
                    certificateChain: 'CertificateChain',
                    certificateName: 'CertificateName',
                    certificatePrivateKey: 'CertificatePrivateKey',
                    domainName: 'DomainName'
                },
                OldResourceProperties: {
                    certificateBody: 'CertificateBody2',
                    certificateChain: 'CertificateChain2',
                    certificateName: 'CertificateName2',
                    certificatePrivateKey: 'CertificatePrivateKey2',
                    domainName: 'DomainName2'
                }
            };
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.certificateBody).to.equal('CertificateBody');
            expect(parameters.params.certificateChain).to.equal('CertificateChain');
            expect(parameters.params.certificateName).to.equal('CertificateName');
            expect(parameters.params.certificatePrivateKey).to.equal('CertificatePrivateKey');
            expect(parameters.params.domainName).to.equal('DomainName');

            expect(parameters.old.certificateBody).to.equal('CertificateBody2');
            expect(parameters.old.certificateChain).to.equal('CertificateChain2');
            expect(parameters.old.certificateName).to.equal('CertificateName2');
            expect(parameters.old.certificatePrivateKey).to.equal('CertificatePrivateKey2');
            expect(parameters.old.domainName).to.equal('DomainName2');
            done();
        });
        it('should yield an error due to missing certificateBody', function (done) {
            delete event.ResourceProperties.certificateBody;
            delete event.OldResourceProperties;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{certificateBody}');
            done();
        });
        it('should yield an error due to missing certificateChain', function (done) {
            delete event.ResourceProperties.certificateChain;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{certificateChain}');
            done();
        });
        it('should yield an error due to missing certificateName', function (done) {
            delete event.ResourceProperties.certificateName;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{certificateName}');
            done();
        });
        it('should yield an error due to missing certificatePrivateKey', function (done) {
            delete event.ResourceProperties.certificatePrivateKey;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{certificatePrivateKey}');
            done();
        });
        it('should yield an error due to missing domainName', function (done) {
            delete event.ResourceProperties.domainName;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{domainName}');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    certificateBody: 'CertificateBody',
                    certificateChain: 'CertificateChain',
                    certificateName: 'CertificateName',
                    certificatePrivateKey: 'CertificatePrivateKey',
                    domainName: 'DomainName'
                },
                old: {
                    certificateBody: 'CertificateBody2',
                    certificateChain: 'CertificateChain2',
                    certificateName: 'CertificateName2',
                    certificatePrivateKey: 'CertificatePrivateKey2',
                    domainName: 'DomainName2'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(0);
            done();
        });
    });
});