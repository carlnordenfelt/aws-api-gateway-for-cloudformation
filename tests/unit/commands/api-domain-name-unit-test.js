'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Api Domain Command', function () {
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
        mockery.registerAllowable('../../../lib/commands/api-domain-name');

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

        mockery.registerMock('../service/api-domain-name/api-domain-name-service', apiDomainNameServiceStub);
        mockery.registerMock('../service/api-domain-name/api-domain-name-event', apiDomainNameEventStub);
        testSubject = require('../../../lib/commands/api-domain-name');
    });
    beforeEach(function () {
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
            expect(parameters).to.be.an('Error');
            done();
        });
    });

    describe('createResource', function () {
        it('should create resource', function (done) {
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal(undefined);
                expect(resource).to.be.an('object');
                expect(createDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail create resource', function (done) {
            createDomainStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('createError');
                expect(resource).to.equal(undefined);
                expect(createDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.equal(undefined);
                expect(createDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteDomainStub.called).to.equal(true);
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteDomainStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('deleteError');
                expect(resource).to.equal(undefined);
                expect(deleteDomainStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal(undefined);
                expect(resource).to.be.an('object');
                expect(patchDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should update resource', function (done) {
            patchDomainStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.equal(undefined);
                expect(patchDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.equal(undefined);
                expect(patchDomainStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });
});
