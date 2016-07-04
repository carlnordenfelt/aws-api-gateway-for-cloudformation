'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiDeployCommand', function () {
    var deployApiStub;
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

        deployApiStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiDeployServiceStub = {
            deployApi: deployApiStub,
            getForResponse: getForResponseStub
        };
        var apiDeployEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/ApiDeploy/ApiDeployService', apiDeployServiceStub);
        mockery.registerMock('../service/ApiDeploy/ApiDeployEvent', apiDeployEventStub);

        testSubject = require('../../../lib/commands/ApiDeploy');
    });
    beforeEach(function () {
        deployApiStub.reset().resetBehavior();
        deployApiStub.yields(undefined);
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
                expect(error).to.be.null;
                expect(deployApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            deployApiStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(deployApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(deployApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {}}, function (error, resource) {
                expect(error).to.be.null;
                expect(resource).to.be.an('object');
                expect(deployApiStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });
});