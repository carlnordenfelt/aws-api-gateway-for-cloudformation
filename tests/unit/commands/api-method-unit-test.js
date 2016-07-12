'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Api Method Command', function () {
    var createMethodStub;
    var deleteMethodStub;
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
        mockery.registerAllowable('../../../lib/commands/api-method');

        createMethodStub = sinon.stub();
        deleteMethodStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiMethodServiceStub = {
            createMethod: createMethodStub,
            deleteMethod: deleteMethodStub,
            getForResponse: getForResponseStub
        };
        var apiMethodEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/api-method/api-method-service', apiMethodServiceStub);
        mockery.registerMock('../service/api-method/api-method-event', apiMethodEventStub);

        testSubject = require('../../../lib/commands/api-method');
    });
    beforeEach(function () {
        createMethodStub.reset().resetBehavior();
        createMethodStub.yields(undefined);
        deleteMethodStub.reset().resetBehavior();
        deleteMethodStub.yields(undefined);
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

    describe('createMethod', function () {
        it('should create resource', function (done) {
            testSubject.createResource({}, {}, { params: { method: {}} }, function (error) {
                expect(error).to.equal(undefined);
                done();
            });
        });
        it('should fail create resource', function (done) {
            createMethodStub.yields('createError');
            testSubject.createResource({}, {}, { params: { method: {}} }, function (error) {
                expect(error).to.equal('createError');
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail create resource but with a proper physical resource id', function (done) {
            createMethodStub.yields('createError', {});
            testSubject.createResource({}, {}, { params: { resourceId: 'test', method: { httpMethod: 'GET' }} }, function (error) {
                expect(error.message).to.equal('createError');
                expect(error.physicalResourceId).to.equal('test/GET');
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail create resource but with a proper physical resource id', function (done) {
            createMethodStub.yields({ code: 'createError' }, {});
            testSubject.createResource({}, {}, { params: { resourceId: 'test', method: { httpMethod: 'GET' }} }, function (error) {
                expect(error.code).to.equal('createError');
                expect(error.physicalResourceId).to.equal('test/GET');
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: { method: {}} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(true);
                done();
            });
        });
        it('should do nothingif physical resource id is not set properly', function (done) {
            testSubject.deleteResource({ PhysicalResourceId: 'dummy' }, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(false);
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteMethodStub.yields('deleteError');
            testSubject.deleteResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(deleteMethodStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal(undefined);
                expect(resource).to.be.an('object');
                expect(deleteMethodStub.called).to.equal(true);
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should do nothing if PhysicalResourceId is not properly set', function (done) {
            testSubject.updateResource({ PhysicalResourceId: 'dummy' }, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('Resource not found');
                expect(resource).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(false);
                expect(createMethodStub.called).to.equal(false);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail update resource if delete fails', function (done) {
            deleteMethodStub.yields('deleteError');
            testSubject.updateResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('deleteError');
                expect(resource).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(true);
                expect(createMethodStub.called).to.equal(false);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail update resource if create fails', function (done) {
            createMethodStub.yields('createError');
            testSubject.updateResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('createError');
                expect(resource).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(true);
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({ PhysicalResourceId: 'test/GET' }, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.equal(undefined);
                expect(deleteMethodStub.called).to.equal(true);
                expect(createMethodStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });
});
