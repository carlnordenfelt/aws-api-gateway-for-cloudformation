'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiBasePathMappingService', function () {
    var getBasePathMappingStub;
    var createBasePathMappingStub;
    var deleteBasePathMappngStub;
    var updateBasePathMappingStub;
    var createDeploymentStub;
    var getStageStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getBasePathMappingStub = sinon.stub();
        createBasePathMappingStub = sinon.stub();
        deleteBasePathMappngStub = sinon.stub();
        updateBasePathMappingStub = sinon.stub();
        createDeploymentStub = sinon.stub();
        getStageStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getBasePathMapping = getBasePathMappingStub;
                this.createBasePathMapping = createBasePathMappingStub;
                this.deleteBasePathMapping = deleteBasePathMappngStub;
                this.updateBasePathMapping = updateBasePathMappingStub;
                this.createDeployment = createDeploymentStub;
                this.getStage = getStageStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/ApiBasePathMapping/ApiBasePathMappingService');
    });
    beforeEach(function () {
        getBasePathMappingStub.reset().resetBehavior();
        getBasePathMappingStub.yields(undefined, {});
        createBasePathMappingStub.reset().resetBehavior();
        createBasePathMappingStub.yields(undefined, {});
        deleteBasePathMappngStub.reset().resetBehavior();
        deleteBasePathMappngStub.yields(undefined, {});
        updateBasePathMappingStub.reset().resetBehavior();
        updateBasePathMappingStub.yields(undefined, {});
        createDeploymentStub.reset().resetBehavior();
        createDeploymentStub.yields(undefined, {});
        getStageStub.reset().resetBehavior();
        getStageStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an api base path mapping', function (done) {
            testSubject.getForResponse('BasePath', 'DomainName', function (error, apiBasePathMapping) {
                expect(error).to.be.undefined;
                expect(apiBasePathMapping).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting an api base path mapping', function (done) {
            getBasePathMappingStub.yields({});
            testSubject.getForResponse('BasePath', 'DomainName', function (error, apiBasePathMapping) {
                expect(error).to.be.an.Error;
                expect(apiBasePathMapping).to.be.undefined;
                done();
            });
        });
    });

    describe('createBasePathMapping', function () {
        var params;
        beforeEach(function () {
            params = {
                domainName: 'DomainName',
                restApiId: 'RestApiId',
                basePath: 'BasePath',
                stage: 'Stage'
            };
        });
        it('should create an api base path mapping', function (done) {
            testSubject.createBasePathMapping(params, function (error) {
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.false;
                expect(createBasePathMappingStub.called).to.be.true;
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when creating base path mapping', function (done) {
            createBasePathMappingStub.yields({});
            testSubject.createBasePathMapping(params, function (error) {
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.false;
                expect(createBasePathMappingStub.called).to.be.true;
                expect(error).to.be.an.Error;
                done();
            });
        });
        it('should return an error when get stage fails', function (done) {
            getStageStub.yields({});
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.an.Error;
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.false;
                expect(createBasePathMappingStub.called).to.be.false;
                done();
            });
        });
        it('should return success after creating a deployment', function (done) {
            getStageStub.yields();
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.an.Error;
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.true;
                expect(createBasePathMappingStub.called).to.be.true;
                done();
            });
        });
        it('should return an error when create deployment fails', function (done) {
            getStageStub.yields({ code: 'NotFoundException' });
            createDeploymentStub.yields({});
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.an.Error;
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.true;
                expect(createBasePathMappingStub.called).to.be.false;
                done();
            });
        });
        it('should return an error when create deployment fails but get stage yeilds no error', function (done) {
            getStageStub.yields();
            createDeploymentStub.yields({});
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.an.Error;
                expect(getStageStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.true;
                expect(createBasePathMappingStub.called).to.be.false;
                done();
            });
        });
    });

    describe('deleteBasePathMapping', function () {
        var params;
        beforeEach(function () {
            params = {
                domainName: 'DomainName',
                basePath: 'BasePath'
            };
        });
        it('should delete an api base path mapping', function (done) {
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteBasePathMappngStub.yields('deleteError');
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
        it('should not return an error when resource is not found', function (done) {
            // Test poor error message from AWS
            deleteBasePathMappngStub.yields({ message : 'Unexpected token <' });
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
    });

    describe('patchBasePathMapping', function () {
        var event;
        beforeEach(function () {
            event = {
                params: {
                    domainName: 'DomainName',
                    restApiId: 'RestApiId',
                    basePath: 'BasePath',
                    stage: 'Stage'
                },
                old: {
                    domainName: 'DomainName2',
                    restApiId: 'RestApiId2',
                    basePath: 'BasePath2',
                    stage: 'Stage2'
                }
            };
        });
        it('should patch everything', function (done) {
            getStageStub.yields();
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateBasePathMappingStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.true;
                expect(getStageStub.called).to.be.true;
                done();
            });
        });
        it('should patch nothing', function (done) {
            event.old = event.params;
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateBasePathMappingStub.called).to.be.false;
                expect(createDeploymentStub.called).to.be.false;
                expect(getStageStub.called).to.be.false;
                done();
            });
        });
        it('should patch without creating stage', function (done) {
            event.old.stage = 'Stage';
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateBasePathMappingStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.false;
                expect(getStageStub.called).to.be.false;
                done();
            });
        });
        it('should return error if patch fails', function (done) {
            event.old.stage = 'Stage';
            updateBasePathMappingStub.yields({ code: 'NotFoundException' });
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error.code).to.equal('NotFoundException');
                expect(updateBasePathMappingStub.called).to.be.true;
                expect(createDeploymentStub.called).to.be.false;
                expect(getStageStub.called).to.be.false;
                done();
            });
        });
        it('should return error if get stage fails', function (done) {
            getStageStub.yields('CreateDeploymentError');
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error).to.equal('CreateDeploymentError');
                expect(updateBasePathMappingStub.called).to.be.false;
                expect(createDeploymentStub.called).to.be.false;
                expect(getStageStub.called).to.be.true;
                done();
            });
        });
    });
});