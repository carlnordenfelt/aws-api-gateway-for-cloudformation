'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiDeployService', function () {
    var getStageStub;
    var createDeploymentStub;
    var updateStageStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getStageStub = sinon.stub();
        createDeploymentStub = sinon.stub();
        updateStageStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getStage = getStageStub;
                this.createDeployment = createDeploymentStub;
                this.updateStage = updateStageStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/api-deploy/api-deploy-service');
    });
    beforeEach(function () {
        getStageStub.reset().resetBehavior();
        getStageStub.yields(undefined, {});
        createDeploymentStub.reset().resetBehavior();
        createDeploymentStub.yields(undefined, {});
        updateStageStub.reset().resetBehavior();
        updateStageStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an api stage', function (done) {
            testSubject.getForResponse('StageName', 'RestApiId', function (error, apiStage) {
                expect(error).to.equal(undefined);
                expect(apiStage).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting api stage', function (done) {
            getStageStub.yields({});
            testSubject.getForResponse('StageName', 'RestApiId', function (error, apiStage) {
                expect(error).to.be.an('object');
                expect(apiStage).to.equal(undefined);
                done();
            });
        });
    });

    describe('deployApi', function () {
        var event;
        beforeEach(function () {
            event = {
                params: {
                    restApiId: 'RestApiId',
                    stageName: 'StageName',
                    stageConfig: {
                        cacheClusterEnabled: true,
                        cacheClusterSize: 0.5,
                        description: 'TestStage'
                    },
                    methodSettings: {
                        '*/*/metrics/enabled': true,
                        '*/*/logging/loglevel': 'ERROR',
                        'no-params/GET/logging/loglevel': 'INFO'
                    },
                    stageVariables: {
                        testVar1: 'TestValue1',
                        testVar2: 'TestValue2'
                    }
                }
            };
        });
        it('should create an api deployment and patch the stage', function (done) {
            testSubject.deployApi(event, function (error) {
                expect(error).to.equal(undefined);
                expect(createDeploymentStub.calledOnce).to.equal(true);
                expect(updateStageStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail if create deployment fails', function (done) {
            createDeploymentStub.yields({});
            testSubject.deployApi(event, function (error) {
                expect(error).to.be.an('object');
                expect(createDeploymentStub.calledOnce).to.equal(true);
                expect(updateStageStub.calledOnce).to.equal(false);
                done();
            });
        });
        it('should fail if patch stage fails', function (done) {
            updateStageStub.yields({});
            testSubject.deployApi(event, function (error) {
                expect(error).to.be.an('object');
                expect(createDeploymentStub.calledOnce).to.equal(true);
                expect(updateStageStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should not patch stage if there are no changes', function (done) {
            updateStageStub.yields({});
            event.old = event.params;
            testSubject.deployApi(event, function (error) {
                expect(error).to.equal(undefined);
                expect(createDeploymentStub.calledOnce).to.equal(true);
                expect(updateStageStub.calledOnce).to.equal(false);
                done();
            });
        });
    });
});
