'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiResourceCommand', function () {
    var createResourceStub;
    var deleteResourceStub;
    var patchResourceStub;
    var getForResponseStub;
    var getParametersStub;
    var updateCorsConfigurationStub;

    var getStub;
    var putStub;
    var deleteStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        createResourceStub = sinon.stub();
        deleteResourceStub = sinon.stub();
        patchResourceStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();
        updateCorsConfigurationStub = sinon.stub();

        getStub = sinon.stub();
        putStub = sinon.stub();
        deleteStub = sinon.stub();

        var apiResourceServiceStub = {
            createResource: createResourceStub,
            deleteResource: deleteResourceStub,
            patchResource: patchResourceStub,
            getForResponse: getForResponseStub
        };
        var apiResourceEventStub = {
            getParameters: getParametersStub
        };
        var corsServiceStub = {
            updateCorsConfiguration: updateCorsConfigurationStub
        };
        var cloudFormationTrackerStub = {
            put: putStub,
            get: getStub,
            delete: deleteStub
        };

        mockery.registerMock('../service/ApiResource/ApiResourceService', apiResourceServiceStub);
        mockery.registerMock('../service/ApiResource/ApiResourceEvent', apiResourceEventStub);
        mockery.registerMock('../service/Cors/CorsService', corsServiceStub);
        mockery.registerMock('../service/CloudFormationResourceTracker', cloudFormationTrackerStub);

        testSubject = require('../../../lib/commands/ApiResource');
    });
    beforeEach(function () {
        createResourceStub.reset().resetBehavior();
        createResourceStub.yields(undefined);
        deleteResourceStub.reset().resetBehavior();
        deleteResourceStub.yields(undefined);
        patchResourceStub.reset().resetBehavior();
        patchResourceStub.yields(undefined);
        getForResponseStub.reset().resetBehavior();
        getForResponseStub.yields(undefined, {});
        getParametersStub.reset().resetBehavior();
        getParametersStub.returns({ params: {} });
        updateCorsConfigurationStub.reset().resetBehavior();
        updateCorsConfigurationStub.yields(undefined, {});

        getStub.reset().resetBehavior();
        getStub.yields(undefined, {});
        putStub.reset().resetBehavior();
        putStub.yields(undefined, {});
        deleteStub.reset().resetBehavior();
        deleteStub.yields(undefined, {});
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
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(createResourceStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            createResourceStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(createResourceStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createResourceStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.true;
                expect(deleteStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteResourceStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(getStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.true;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should succeed if get from tracker return nothing', function (done) {
            getStub.yields();
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.false;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get from tracker fails', function (done) {
            getStub.yields('getTrackerError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getTrackerError');
                expect(getStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.false;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {}}, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.true;
                expect(updateCorsConfigurationStub.called).to.be.true;
                expect(putStub.called).to.be.true;
                expect(getForResponseStub.calledTwice).to.be.true;
                done();
            });
        });
        it('should fail update resource if patch fails', function (done) {
            patchResourceStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.true;
                expect(updateCorsConfigurationStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.true;
                expect(updateCorsConfigurationStub.called).to.be.false;
                expect(getForResponseStub.calledOnce).to.be.true;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response doesnt find the resource', function (done) {
            getStub.yields();
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('API Resource not found');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.false;
                expect(updateCorsConfigurationStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get from tracker fails', function (done) {
            getStub.yields('getTrackerError');
            testSubject.updateResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getTrackerError');
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.false;
                expect(updateCorsConfigurationStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if cors service fails', function (done) {
            updateCorsConfigurationStub.yields('corsError');
            testSubject.updateResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('corsError');
                expect(getStub.called).to.be.true;
                expect(patchResourceStub.called).to.be.true;
                expect(updateCorsConfigurationStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                expect(getForResponseStub.calledOnce).to.be.true;
                expect(getForResponseStub.calledTwice).to.be.false;
                done();
            });
        });
    });
});