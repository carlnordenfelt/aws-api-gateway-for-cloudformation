'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiResourceService', function () {
    var getResourceStub;
    var getResourcesStub;
    var createResourceStub;
    var deleteResourceStub;
    var updateResourceStub;
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

        getResourceStub = sinon.stub();
        getResourcesStub = sinon.stub();
        createResourceStub = sinon.stub();
        deleteResourceStub = sinon.stub();
        updateResourceStub = sinon.stub();
        putOptionsMethodStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getResource = getResourceStub;
                this.getResources = getResourcesStub;
                this.createResource = createResourceStub;
                this.deleteResource = deleteResourceStub;
                this.updateResource = updateResourceStub;
            }
        };
        var corsServiceStub = {
            putOptionsMethod: putOptionsMethodStub
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        mockery.registerMock('../cors/cors-service', corsServiceStub);
        testSubject = require('../../../../lib/service/api-resource/api-resource-service');
    });
    beforeEach(function () {
        getResourceStub.reset().resetBehavior();
        getResourceStub.yields(undefined, {});
        getResourcesStub.reset().resetBehavior();
        getResourcesStub.yields(undefined, { items: []});
        createResourceStub.reset().resetBehavior();
        createResourceStub.yields(undefined, { id: 'ResourceId'});
        deleteResourceStub.reset().resetBehavior();
        deleteResourceStub.yields(undefined, {});
        updateResourceStub.reset().resetBehavior();
        updateResourceStub.yields(undefined, {});
        putOptionsMethodStub.reset().resetBehavior();
        putOptionsMethodStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an api resource', function (done) {
            testSubject.getForResponse('RestApiId', 'ResourceId', function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting api resource', function (done) {
            getResourceStub.yields({});
            testSubject.getForResponse('RestApiId', 'ResourceId', function (error, apiResource) {
                expect(error).to.be.an.Error;
                expect(apiResource).to.be.undefined;
                done();
            });
        });
    });

    describe('createResource', function () {
        it('should create an api resource without cors config', function (done) {
            testSubject.createResource('RestApiId', 'ParentId', 'PathPart', undefined, function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.equal('ResourceId');
                expect(putOptionsMethodStub.called).to.be.false;
                done();
            });
        });
        it('should create an api resource with cors', function (done) {
            testSubject.createResource('RestApiId', 'ParentId', 'PathPart', {}, function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.equal('ResourceId');
                expect(putOptionsMethodStub.called).to.be.true;
                done();
            });
        });
        it('should return an error when creating api model', function (done) {
            createResourceStub.yields({});
            testSubject.createResource('RestApiId', 'ParentId', 'PathPart', undefined, function (error, apiResource) {
                expect(error).to.be.an.Error;
                expect(apiResource).to.be.undefined;
                expect(putOptionsMethodStub.called).to.be.false;
                done();
            });
        });
        it('should delete the resource and return an error cors fails', function (done) {
            putOptionsMethodStub.yields('corsError');
            testSubject.createResource('RestApiId', 'ParentId', 'PathPart', {}, function (error, apiResource) {
                expect(error).to.be.equal('corsError');
                expect(apiResource).to.be.undefined;
                expect(putOptionsMethodStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.true;
                done();
            });
        });
        it('should delete the resource and return an error cors fails', function (done) {
            putOptionsMethodStub.yields({});
            deleteResourceStub.yields('deleteError');
            testSubject.createResource('RestApiId', 'ParentId', 'PathPart', {}, function (error, apiResource) {
                expect(error).to.be.equal('deleteError');
                expect(apiResource).to.be.undefined;
                expect(putOptionsMethodStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.true;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete an api resource', function (done) {
            testSubject.deleteResource('ResourceId', 'RestApiId', function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteResourceStub.yields('deleteError');
            testSubject.deleteResource('ResourceId','RestApiId', function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
    });

    describe('patchResource', function () {
        var event;
        beforeEach(function() {
            event = {
                params: {
                    restApiId: 'RestApiId',
                    parentId: 'ParentId',
                    pathPart: 'PathPart',
                    corsConfiguration: {
                        allowMethods: ['GET']
                    }
                },
                old: {
                    restApiId: 'RestApiId2',
                    parentId: 'ParentId2',
                    pathPart: 'PathPart2',
                    corsConfiguration: {
                        allowMethods: ['GET2']
                    }
                }
            };
        });
        it('should patch an api resource', function (done) {
            testSubject.patchResource('ResourceId', 'RestApiId', event, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should patch noting', function (done) {
            delete event.params.parentId;
            delete event.params.pathPart;
            testSubject.patchResource('ResourceId', 'RestApiId', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
        });
        it('should return error', function (done) {
            updateResourceStub.yields({ code: 'NotFoundException' });
            testSubject.patchResource('ResourceId', 'RestApiId', event, function (error) {
                expect(error.code).to.equal('NotFoundException');
                done();
            });
        });
    });

    describe('getResource', function () {
        it('should find an api resource', function (done) {
            var params = {
                restApiId: 'RestApiId',
                parentId: 'ParentId2',
                pathPart: '/test2'
            };
            getResourcesStub.yields(undefined, { items: [
                { pathPart: '/test1', parentId: 'ResourceId' },
                { pathPart: '/test2', parentId: 'ParentId2' }
            ] });
            testSubject.getResource(params, undefined, function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.an('object');
                done();
            });
        });
    });

    describe('getApiParentResource', function () {
        it('should find an api resource', function (done) {
            getResourcesStub.yields(undefined, { items: [{ pathPart: '/', parentId: undefined }] });
            testSubject.getApiParentResource('RestApiId', function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.an('object');
                done();
            });
        });
        it('should return an error', function (done) {
            getResourcesStub.yields('getError');
            testSubject.getApiParentResource('RestApiId', function (error, apiResource) {
                expect(error).to.equal('getError');
                expect(apiResource).to.be.undefined
                done();
            });
        });
        it('should not return error if api not found', function (done) {
            getResourcesStub.yields({ code : 'NotFoundException' });
            testSubject.getApiParentResource('RestApiId', function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.undefined;
                done();
            });
        });
        it('should not return anything if not found', function (done) {
            getResourcesStub.yields(undefined, { items: [{ pathPart: '/test', parentId: 'ParentId' }] });
            testSubject.getApiParentResource('RestApiId', function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.undefined;
                done();
            });
        });
        it('should handle pagination and find api resource', function (done) {
            getResourcesStub.onFirstCall().yields(undefined, { items: [{}], position: 1 });
            getResourcesStub.onSecondCall().yields(undefined, { items: [{ pathPart: '/', parentId: undefined }] });
            testSubject.getApiParentResource('RestApiId', function (error, apiResource) {
                expect(error).to.be.undefined;
                expect(apiResource).to.be.an('object');
                done();
            });
        });
    });
});
