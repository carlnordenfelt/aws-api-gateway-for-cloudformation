'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiBasePathMappingCommand', function () {
    var createBasePathMappingStub;
    var deleteBasePathMappingStub;
    var patchBasePathMappingStub;
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
        mockery.registerAllowable('../../../lib/commands/api-base-path-mapping');

        createBasePathMappingStub = sinon.stub();
        deleteBasePathMappingStub = sinon.stub();
        patchBasePathMappingStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiBasePathMappingServiceStub = {
            createBasePathMapping: createBasePathMappingStub,
            deleteBasePathMapping: deleteBasePathMappingStub,
            patchBasePathMapping: patchBasePathMappingStub,
            getForResponse: getForResponseStub
        };
        var apiBasePathMappingEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/api-base-path-mapping/api-base-path-mapping-service', apiBasePathMappingServiceStub);
        mockery.registerMock('../service/api-base-path-mapping/api-base-path-mapping-event', apiBasePathMappingEventStub);
        testSubject = require('../../../lib/commands/api-base-path-mapping');
    });
    beforeEach(function () {
        createBasePathMappingStub.reset().resetBehavior();
        createBasePathMappingStub.yields(undefined, {});
        deleteBasePathMappingStub.reset().resetBehavior();
        deleteBasePathMappingStub.yields(undefined, {});
        patchBasePathMappingStub.reset().resetBehavior();
        patchBasePathMappingStub.yields(undefined, {});
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
                done();
            });
        });
        it('should fail create resource', function (done) {
            createBasePathMappingStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('createError');
                expect(resource).to.be.undefined;
                expect(createBasePathMappingStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(createBasePathMappingStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({ PhysicalResourceId: 'www.example.com/test' }, {}, { params: {} }, function (error) {
                expect(error).to.be.undefined;
                expect(deleteBasePathMappingStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteBasePathMappingStub.yields('deleteError');
            testSubject.deleteResource({ PhysicalResourceId: 'www.example.com/' }, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('deleteError');
                expect(resource).to.be.undefined;
                expect(deleteBasePathMappingStub.called).to.be.true;
                done();
            });
        });
        it('should not delete resource if physicalResourceId is invalid', function (done) {
            testSubject.deleteResource({ PhysicalResourceId: 'invalid' }, {}, { params: {} }, function (error, resource) {
                expect(error).to.be.undefined;
                expect(deleteBasePathMappingStub.called).to.be.false;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({ PhysicalResourceId: 'www.example.com/' }, {}, { params: {} }, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(patchBasePathMappingStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should update resource', function (done) {
            patchBasePathMappingStub.yields('updateError');
            testSubject.updateResource({ PhysicalResourceId: 'www.example.com/' }, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.be.undefined;
                expect(patchBasePathMappingStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({ PhysicalResourceId: 'www.example.com/' }, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(patchBasePathMappingStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
    });
});
