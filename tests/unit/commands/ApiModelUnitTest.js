'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiModelCommand', function () {
    var createModelStub;
    var deleteModelStub;
    var patchModelStub;
    var getForResponseStub;
    var getParametersStub;

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

        createModelStub = sinon.stub();
        deleteModelStub = sinon.stub();
        patchModelStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        getStub = sinon.stub();
        putStub = sinon.stub();
        deleteStub = sinon.stub();

        var apiModelServiceStub = {
            createModel: createModelStub,
            deleteModel: deleteModelStub,
            patchModel: patchModelStub,
            getForResponse: getForResponseStub
        };
        var apiModelEventStub = {
            getParameters: getParametersStub
        };
        var cloudFormationTrackerStub = {
            put: putStub,
            get: getStub,
            delete: deleteStub
        };

        mockery.registerMock('../service/ApiModel/ApiModelService', apiModelServiceStub);
        mockery.registerMock('../service/ApiModel/ApiModelEvent', apiModelEventStub);
        mockery.registerMock('../service/CloudFormationResourceTracker', cloudFormationTrackerStub);

        testSubject = require('../../../lib/commands/ApiModel');
    });
    beforeEach(function () {
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
                expect(createModelStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            createModelStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(createModelStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createModelStub.called).to.be.true;
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
                expect(deleteModelStub.called).to.be.true;
                expect(deleteStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteModelStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(getStub.called).to.be.true;
                expect(deleteModelStub.called).to.be.true;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should succeed if get from tracker return nothing', function (done) {
            getStub.yields();
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteModelStub.called).to.be.false;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get from tracker fails', function (done) {
            getStub.yields('getTrackerError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getTrackerError');
                expect(getStub.called).to.be.true;
                expect(deleteModelStub.called).to.be.false;
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
                expect(patchModelStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.true;
                done();
            });
        });
        it('should fail update resource if update fails', function (done) {
            patchModelStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(patchModelStub.called).to.be.true;
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
                expect(patchModelStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response doesnt find the resource', function (done) {
            getStub.yields();
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('API Model not found');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(patchModelStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get from tracker fails', function (done) {
            getStub.yields('getTrackerError');
            testSubject.updateResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getTrackerError');
                expect(getStub.called).to.be.true;
                expect(patchModelStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
    });
});