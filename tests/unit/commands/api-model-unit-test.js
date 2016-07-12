'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Api Model Command', function () {
    var createModelStub;
    var deleteModelStub;
    var patchModelStub;
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
        mockery.registerAllowable('../../../lib/commands/api-model');

        createModelStub = sinon.stub();
        deleteModelStub = sinon.stub();
        patchModelStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiModelServiceStub = {
            createModel: createModelStub,
            deleteModel: deleteModelStub,
            patchModel: patchModelStub,
            getForResponse: getForResponseStub
        };
        var apiModelEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/api-model/api-model-service', apiModelServiceStub);
        mockery.registerMock('../service/api-model/api-model-event', apiModelEventStub);

        testSubject = require('../../../lib/commands/api-model');
    });
    beforeEach(function () {
        createModelStub.reset().resetBehavior();
        createModelStub.yields(undefined);
        deleteModelStub.reset().resetBehavior();
        deleteModelStub.yields(undefined);
        patchModelStub.reset().resetBehavior();
        patchModelStub.yields(undefined);
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
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal(null);
                expect(createModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail create resource', function (done) {
            createModelStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(createModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteModelStub.called).to.equal(true);
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteModelStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(deleteModelStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {}}, function (error, resource) {
                expect(error).to.equal(null);
                expect(resource).to.be.an('object');
                expect(patchModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail update resource if update fails', function (done) {
            patchModelStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.equal(undefined);
                expect(patchModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.equal(undefined);
                expect(patchModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail if get for response doesnt find the resource', function (done) {
            patchModelStub.yields('API Model not found');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('API Model not found');
                expect(resource).to.equal(undefined);
                expect(patchModelStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
    });
});
