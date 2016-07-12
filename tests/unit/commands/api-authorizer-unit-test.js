'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Api Authorizer Command', function () {
    var createAuthorizerStub;
    var deleteAuthorizerStub;
    var patchAuthorizerStub;
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
        mockery.registerAllowable('../../../lib/commands/api-authorizer');

        createAuthorizerStub = sinon.stub();
        deleteAuthorizerStub = sinon.stub();
        patchAuthorizerStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        var apiAuthorizerServiceStub = {
            createAuthorizer: createAuthorizerStub,
            deleteAuthorizer: deleteAuthorizerStub,
            patchAuthorizer: patchAuthorizerStub,
            getForResponse: getForResponseStub
        };
        var apiAuthorizerEventStub = {
            getParameters: getParametersStub
        };

        mockery.registerMock('../service/api-authorizer/api-authorizer-service', apiAuthorizerServiceStub);
        mockery.registerMock('../service/api-authorizer/api-authorizer-event', apiAuthorizerEventStub);
        testSubject = require('../../../lib/commands/api-authorizer');
    });
    beforeEach(function () {
        createAuthorizerStub.reset().resetBehavior();
        createAuthorizerStub.yields(undefined, {});
        deleteAuthorizerStub.reset().resetBehavior();
        deleteAuthorizerStub.yields(undefined);
        patchAuthorizerStub.reset().resetBehavior();
        patchAuthorizerStub.yields(undefined);
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
    });

    describe('create authorizer', function () {
        it('should create api authorizer', function (done) {
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal(null);
                expect(createAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail create authorizer', function (done) {
            createAuthorizerStub.yields('createError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('createError');
                expect(createAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({ PhysicalResourceId: 'valid' }, {}, { params: {} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteAuthorizerStub.called).to.equal(true);
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteAuthorizerStub.yields('deleteError');
            testSubject.deleteResource({ PhysicalResourceId: 'valid' }, {}, { params: {} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(deleteAuthorizerStub.called).to.equal(true);
                done();
            });
        });
        it('should fail delete resource with invalid physicalResourceId', function (done) {

            testSubject.deleteResource({ PhysicalResourceId: 'invalid/withslash' }, {}, { params: {} }, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteAuthorizerStub.called).to.equal(false);
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {}}, function (error, resource) {
                expect(error).to.equal(null);
                expect(resource).to.be.an('object');
                expect(patchAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail update resource if update fails', function (done) {
            patchAuthorizerStub.yields('updateError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('updateError');
                expect(resource).to.equal(undefined);
                expect(patchAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.equal(undefined);
                expect(patchAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(true);
                done();
            });
        });
        it('should fail if get for response doesnt find the resource', function (done) {
            patchAuthorizerStub.yields('API authorizer not found');
            testSubject.updateResource({}, {}, { params: {} }, function (error, resource) {
                expect(error).to.equal('API authorizer not found');
                expect(resource).to.equal(undefined);
                expect(patchAuthorizerStub.called).to.equal(true);
                expect(getForResponseStub.called).to.equal(false);
                done();
            });
        });
    });
});
