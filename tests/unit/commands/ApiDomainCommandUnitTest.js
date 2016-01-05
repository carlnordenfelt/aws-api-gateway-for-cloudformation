'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiDomainCommand', function () {
    var createDomainStub;
    var deleteDomainStub;
    var patchDomainStub;
    var getForResponseStub;
    var getParametersStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        createDomainStub = sinon.stub();
        deleteDomainStub = sinon.stub();
        patchDomainStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiDomainNameServiceStub = {
            createDomain: createDomainStub,
            deleteDomain: deleteDomainStub,
            patchDomain: patchDomainStub,
            getForResponse: getForResponseStub
        };
        var apiDomainNameEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/ApiDomainName/ApiDomainNameService', apiDomainNameServiceStub);
        mockery.registerMock('../service/ApiDomainName/ApiDomainNameEvent', apiDomainNameEventStub);
        testSubject = require('../../../lib/commands/ApiDomainName');
    });
    beforeEach(function () {
        createDomainStub.reset().resetBehavior();
        createDomainStub.yields(undefined, {});
        deleteDomainStub.reset().resetBehavior();
        deleteDomainStub.yields(undefined, {});
        patchDomainStub.reset().resetBehavior();
        patchDomainStub.yields(undefined, {});
        getForResponseStub.reset().resetBehavior();
        getForResponseStub.yields(undefined, {});
        getParametersStub.reset().resetBehavior();
        getParametersStub.returns({ params: {} });
    });

    describe('getParameters', function () {
        it('should get parameters', function (done) {
            var parameters = testSubject.getParameters();
            expect(parameters.params).to.be.an('object');
            done();
        });
        it('should get error', function (done) {
            getParametersStub.returns(new Error());
            var parameters = testSubject.getParameters();
            expect(parameters.params).to.be.an.Error;
            done();
        });
    });

    describe('createResource', function () {
        it('should create resource', function (done) {
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(createDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            createDomainStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('createError');
                expect(resource).to.be.undefined;
                expect(createDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(createDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(deleteDomainStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteDomainStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('deleteError');
                expect(resource).to.be.undefined;
                expect(deleteDomainStub.called).to.be.true;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(patchDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should update resource', function (done) {
            patchDomainStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.be.undefined;
                expect(patchDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(patchDomainStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });
});