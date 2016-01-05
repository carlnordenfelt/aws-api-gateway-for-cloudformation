'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiDomainNameService', function () {
    var getDomainNameStub;
    var createDomainNameStub;
    var deleteDomainNameStub;
    var updateDomainNameStub;

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

        var awsSdkStub = {
            APIGateway: function () {
                this.getDomainName = getDomainNameStub;
                this.createDomainName = createDomainNameStub;
                this.deleteDomainName = deleteDomainNameStub;
                this.updateDomainName = updateDomainNameStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/ApiDomainName/ApiDomainNameService');
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
            delete params.schema;
            testSubject.createDomain(params, function (error, apiModel) {
                expect(error).to.be.undefined;
                expect(apiModel).to.be.an('object');
                done();
            });
        });
        it('should return an error when creating domain name', function (done) {
            createDomainNameStub.yields({});
            testSubject.createDomain(params, function (error, apiModel) {
                expect(error).to.be.an.Error;
                expect(apiModel).to.be.undefined;
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
        it('should patch nothing', function (done) {
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
                expect(updateDomainNameStub.called).to.be.false;
                done();
            });
        });
    });
});