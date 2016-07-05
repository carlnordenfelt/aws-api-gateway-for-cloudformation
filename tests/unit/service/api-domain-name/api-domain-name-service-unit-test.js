'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiDomainNameService', function () {
    var getDomainNameStub;
    var createDomainNameStub;
    var deleteDomainNameStub;
    var updateDomainNameStub;
    var getServerCertificateStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getDomainNameStub = sinon.stub();
        createDomainNameStub = sinon.stub();
        deleteDomainNameStub = sinon.stub();
        updateDomainNameStub = sinon.stub();
        getServerCertificateStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getDomainName = getDomainNameStub;
                this.createDomainName = createDomainNameStub;
                this.deleteDomainName = deleteDomainNameStub;
                this.updateDomainName = updateDomainNameStub;
            },
            IAM: function () {
                this.getServerCertificate = getServerCertificateStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/api-domain-name/api-domain-name-service');
    });
    beforeEach(function () {
        getDomainNameStub.reset().resetBehavior();
        getDomainNameStub.yields(undefined, {});
        createDomainNameStub.reset().resetBehavior();
        createDomainNameStub.yields(undefined, {});
        deleteDomainNameStub.reset().resetBehavior();
        deleteDomainNameStub.yields(undefined, {});
        updateDomainNameStub.reset().resetBehavior();
        updateDomainNameStub.yields(undefined, {});
        getServerCertificateStub.reset().resetBehavior();
        getServerCertificateStub.yields(undefined, { ServerCertificate: { CertificateBody: 'ServerCertificateBody', CertificateChain: 'ServerCertificateChain' }});
    });

    describe('getForResponse', function () {
        it('should get a domain name', function (done) {
            testSubject.getForResponse('DomainName', function (error, apiDomainName) {
                expect(error).to.be.undefined;
                expect(apiDomainName).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting domain name', function (done) {
            getDomainNameStub.yields({});
            testSubject.getForResponse('DomainName', function (error, apiDomainName) {
                expect(error).to.be.an.Error;
                expect(apiDomainName).to.be.undefined;
                done();
            });
        });
    });

    describe('createDomain', function () {
        var params;
        beforeEach(function () {
            params = {
                certificateBody: 'CertificateBody',
                certificateChain: 'CertificateChain',
                certificateName: 'CertificateName',
                certificatePrivateKey: 'CertificatePrivateKey',
                domainName: 'DomainName'
            };
        });
        it('should create a domain name', function (done) {
            testSubject.createDomain(params, function (error, apiDomainName) {
                expect(error).to.be.undefined;
                expect(getServerCertificateStub.called).to.be.false;
                expect(createDomainNameStub.called).to.be.true;
                expect(apiDomainName).to.be.an('object');
                done();
            });
        });
        it('should create a domain name by fetching certificate from IAM', function (done) {
            delete params.certificateBody;
            delete params.certificateChain;
            params.iamServerCertificateName = 'IamServerCertificateName';
            testSubject.createDomain(params, function (error, apiDomainName) {
                expect(error).to.be.undefined;
                expect(getServerCertificateStub.called).to.be.true;
                expect(createDomainNameStub.called).to.be.true;
                expect(apiDomainName).to.be.an('object');
                done();
            });
        });
        it('should return an error when creating domain name', function (done) {
            createDomainNameStub.yields({});
            testSubject.createDomain(params, function (error, apiDomainName) {
                expect(error).to.be.an.Error;
                expect(getServerCertificateStub.called).to.be.false;
                expect(createDomainNameStub.called).to.be.true;
                expect(apiDomainName).to.be.undefined;
                done();
            });
        });
        it('should return an error if getServerCertificate fails', function (done) {
            delete params.certificateBody;
            delete params.certificateChain;
            params.iamServerCertificateName = 'IamServerCertificateName';
            getServerCertificateStub.yields({});
            testSubject.createDomain(params, function (error, apiDomainName) {
                expect(error).to.be.an.Error;
                expect(getServerCertificateStub.called).to.be.true;
                expect(createDomainNameStub.called).to.be.false;
                expect(apiDomainName).to.be.undefined;
                done();
            });
        });
        it('should return an error if getServerCertificate does not contain a certificate chain', function (done) {
            delete params.certificateBody;
            delete params.certificateChain;
            params.iamServerCertificateName = 'IamServerCertificateName';
            getServerCertificateStub.yields(undefined, { ServerCertificate: { CertificateBody: 'ServerCertificateBody' }});
            testSubject.createDomain(params, function (error, apiDomainName) {
                expect(error).to.be.an.Error;
                expect(getServerCertificateStub.called).to.be.true;
                expect(createDomainNameStub.called).to.be.false;
                expect(apiDomainName).to.be.undefined;
                done();
            });
        });
    });

    describe('deleteDomain', function () {
        it('should delete a domain name', function (done) {
            testSubject.deleteDomain('DomainName', function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteDomainNameStub.yields('deleteError');
            testSubject.deleteDomain('DomainName', function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
    });

    describe('patchDomain', function () {
        it('should patch everything', function (done) {
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
            testSubject.patchDomain('DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateDomainNameStub.called).to.be.true;
                done();
            });
        });
        it('should patch noting', function (done) {
            var event = {
                params: { domainName: 'DomainName' },
                old: { domainName: 'DomainName' }
            };
            testSubject.patchDomain('DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateDomainNameStub.called).to.be.false;
                done();
            });
        });
        it('should return error', function (done) {
            var event = {
                params: { domainName: 'DomainName' },
                old: { domainName: 'DomainName2' }
            };
            updateDomainNameStub.yields({ code: 'BadRequestException' });
            testSubject.patchDomain('DomainName', event, function (error) {
                expect(error.code).to.equal('BadRequestException');
                expect(updateDomainNameStub.called).to.be.true;
                done();
            });
        });
    });
});
