'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('RestApiCommand', function () {
    var createRestApiStub;
    var deleteRestApiStub;
    var patchRestApiStub;
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

        createRestApiStub = sinon.stub();
        deleteRestApiStub = sinon.stub();
        patchRestApiStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiRestApiServiceStub = {
            createApi: createRestApiStub,
            deleteApi: deleteRestApiStub,
            patchApi: patchRestApiStub,
            getForResponse: getForResponseStub
        };
        var apiRestApiEventStub = {
            getParameters: getParametersStub
        };
        mockery.registerMock('../service/RestApi/RestApiService', apiRestApiServiceStub);
        mockery.registerMock('../service/RestApi/RestApiEvent', apiRestApiEventStub);

        testSubject = require('../../../lib/commands/RestApi');
    });
    beforeEach(function () {
        createRestApiStub.reset().resetBehavior();
        createRestApiStub.yields(undefined, {});
        deleteRestApiStub.reset().resetBehavior();
        deleteRestApiStub.yields(undefined);
        patchRestApiStub.reset().resetBehavior();
        patchRestApiStub.yields(undefined, {});
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
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(createRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            createRestApiStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(createRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete the rest api', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(deleteRestApiStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete rest api', function (done) {
            deleteRestApiStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(deleteRestApiStub.called).to.be.true;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update rest api', function (done) {
            testSubject.updateResource({}, {}, { params: {}}, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(patchRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail update rest api if delete fails', function (done) {
            patchRestApiStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.be.undefined;
                expect(patchRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(patchRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail if get for response doesnt find the rest api', function (done) {
            patchRestApiStub.yields('Rest API not found');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('Rest API not found');
                expect(resource).to.be.undefined;
                expect(patchRestApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
    });
});