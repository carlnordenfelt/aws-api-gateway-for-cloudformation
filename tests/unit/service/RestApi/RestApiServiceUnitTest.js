'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('RestApiService', function () {
    var getRestApiStub;
    var createRestApiStub;
    var deleteRestApiStub;
    var updateRestApiStub;
    var getApiParentResourceStub;
    var getRestApisStub;
    var putOptionsMethodStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getRestApiStub = sinon.stub();
        createRestApiStub = sinon.stub();
        deleteRestApiStub = sinon.stub();
        updateRestApiStub = sinon.stub();
        getRestApisStub = sinon.stub();
        getApiParentResourceStub = sinon.stub();
        putOptionsMethodStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getRestApi = getRestApiStub;
                this.createRestApi = createRestApiStub;
                this.deleteRestApi = deleteRestApiStub;
                this.updateRestApi = updateRestApiStub;
                this.getRestApis = getRestApisStub;
            }
        };
        var apiResourceServiceStub = {
            getApiParentResource: getApiParentResourceStub
        };
        var corsServiceStub = {
            putOptionsMethod: putOptionsMethodStub
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        mockery.registerMock('../Cors/CorsService', corsServiceStub);
        mockery.registerMock('../ApiResource/ApiResourceService', apiResourceServiceStub);
        testSubject = require('../../../../lib/service/RestApi/RestApiService');
    });
    beforeEach(function () {
        getRestApiStub.reset().resetBehavior();
        getRestApiStub.yields(undefined, {});
        createRestApiStub.reset().resetBehavior();
        createRestApiStub.yields(undefined, {});
        deleteRestApiStub.reset().resetBehavior();
        deleteRestApiStub.yields(undefined, {});
        updateRestApiStub.reset().resetBehavior();
        updateRestApiStub.yields(undefined, {});
        getRestApisStub.reset().resetBehavior();
        getRestApisStub.yields(undefined, {});
        getApiParentResourceStub.reset().resetBehavior();
        getApiParentResourceStub.yields(undefined, { id: 1234 });
        putOptionsMethodStub.reset().resetBehavior();
        putOptionsMethodStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get a rest api', function (done) {
            testSubject.getForResponse('123', function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi.parentResourceId).to.equal(1234);
                expect(getRestApiStub.called).to.equal(true);
                expect(getApiParentResourceStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error when getting rest api', function (done) {
            getRestApiStub.yields({});
            testSubject.getForResponse('123', function (error, restApi) {
                expect(error).to.be.an('object');
                expect(restApi).to.equal(undefined);
                expect(getRestApiStub.called).to.equal(true);
                expect(getApiParentResourceStub.called).to.equal(false);
                done();
            });
        });
        it('should return an error when getting parent resource', function (done) {
            getApiParentResourceStub.yields({});
            testSubject.getForResponse('123', function (error, restApi) {
                expect(error).to.be.an('object');
                expect(restApi).to.equal(undefined);
                expect(getRestApiStub.called).to.equal(true);
                expect(getApiParentResourceStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('findApiByName', function () {
        it('should find a rest api', function (done) {
            getRestApisStub.yields(undefined, { items: [{ name: 'ApiName' }] });
            testSubject.findApiByName('ApiName', undefined, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.be.an('object');
                expect(getRestApisStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error', function (done) {
            getRestApisStub.yields('getError');
            testSubject.findApiByName('ApiName', undefined, function (error, restApi) {
                expect(error).to.equal('getError');
                expect(restApi).to.equal(undefined);
                expect(getRestApisStub.called).to.equal(true);
                done();
            });
        });
        it('should not return error if api not found', function (done) {
            getRestApisStub.yields({ code : 'NotFoundException' });
            testSubject.findApiByName('ApiName', undefined, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.equal(undefined);
                expect(getRestApisStub.called).to.equal(true);
                done();
            });
        });
        it('should handle pagination and find api resource', function (done) {
            getRestApisStub.onFirstCall().yields(undefined, { items: [{}], position: 1 });
            getRestApisStub.onSecondCall().yields(undefined, { items: [{ name: 'ApiName' }] });
            testSubject.findApiByName('ApiName', undefined, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.be.an('object');
                expect(getRestApisStub.calledTwice).to.equal(true);
                done();
            });
        });
        it('should not return anything if not found', function (done) {
            getRestApisStub.yields(undefined, { items: [{ name: 'ApiName' }] });
            testSubject.findApiByName('ApiName2', undefined, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.equal(undefined);
                expect(getRestApisStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('createApi', function () {
        var event;
        beforeEach(function () {
             event = { 
                 name: 'ApiName',
                 description: 'ApiDesc',
                 corsConfiguration: {}
             };
        });
        it('should create a rest api without description and cors', function (done) {
            delete event.description;
            delete event.corsConfiguration;
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi.parentResourceId).to.equal(1234);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(false);
                expect(deleteRestApiStub.called).to.equal(false);
                done();
            });
        });
        it('should create a rest api with description and cors', function (done) {
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi.parentResourceId).to.equal(1234);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(true);
                expect(deleteRestApiStub.called).to.equal(false);
                done();
            });
        });
        it('should return an error when creating rest api', function (done) {
            createRestApiStub.yields({});
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.be.an('object');
                expect(restApi).to.equal(undefined);
                expect(getApiParentResourceStub.called).to.equal(false);
                expect(putOptionsMethodStub.called).to.equal(false);
                expect(deleteRestApiStub.called).to.equal(false);
                done();
            });
        });
        it('should return an error when getting parent resource', function (done) {
            getApiParentResourceStub.yields('resourceError');
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal('resourceError');
                expect(restApi).to.equal(undefined);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(false);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error when getting parent resource and delete fails', function (done) {
            getApiParentResourceStub.yields({});
            deleteRestApiStub.yields('deleteError');
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal('deleteError');
                expect(restApi).to.equal(undefined);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(false);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error when cors fails', function (done) {
            putOptionsMethodStub.yields('corsError');
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal('corsError');
                expect(restApi).to.equal(undefined);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(true);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error when cors fails and subsequent delete fails', function (done) {
            putOptionsMethodStub.yields('corsError');
            deleteRestApiStub.yields('deleteError');
            testSubject.createApi(event, function (error, restApi) {
                expect(error).to.equal('deleteError');
                expect(restApi).to.equal(undefined);
                expect(getApiParentResourceStub.called).to.equal(true);
                expect(putOptionsMethodStub.called).to.equal(true);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('deleteApi', function () {
        it('should delete a rest api', function (done) {
            testSubject.deleteApi('123', function (error) {
                expect(error).to.equal(undefined);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should return an error when getting parent resource and delete fails', function (done) {
            deleteRestApiStub.yields('deleteError');
            testSubject.deleteApi('123', function (error) {
                expect(error).to.equal('deleteError');
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should not return error if api is not found', function (done) {
            deleteRestApiStub.yields({ code: 'NotFoundException' });
            testSubject.deleteApi('123', function (error) {
                expect(error).to.equal(undefined);
                expect(deleteRestApiStub.called).to.equal(true);
                done();
            });
        });
    });

    describe('patchApi', function () {
        it('should patch a rest api', function (done) {
            var event = {
                params: { name: 'ApiName' },
                old: { name: 'ApiName2' }
            };
            testSubject.patchApi('RestApiId', event, function (error) {
                expect(error).to.equal(undefined);
                expect(updateRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should patch description', function (done) {
            var event = {
                params: { description: 'ApiDesc' },
                old: { description: 'ApiDesc2', name: 'ApiName2' }
            };
            testSubject.patchApi('RestApiId', event, function (error) {
                expect(error).to.equal(undefined);
                expect(updateRestApiStub.called).to.equal(true);
                done();
            });
        });
        it('should patch nothing', function (done) {
            var event = {
                params: { description: 'ApiDesc' },
                old: { description: 'ApiDesc', name: 'ApiName2' }
            };
            testSubject.patchApi('RestApiId', event, function (error) {
                expect(error).to.equal(undefined);
                expect(updateRestApiStub.called).to.equal(false);
                done();
            });
        });
        it('should return error', function (done) {
            var event = {
                params: { name: 'After' },
                old: { name: 'Before' }
            };
            updateRestApiStub.yields({ code: 'NotFoundException' });
            testSubject.patchApi('RestApiId', event, function (error) {
                expect(error.code).to.equal('NotFoundException');
                expect(updateRestApiStub.called).to.equal(true);
                done();
            });
        });
    });
});
