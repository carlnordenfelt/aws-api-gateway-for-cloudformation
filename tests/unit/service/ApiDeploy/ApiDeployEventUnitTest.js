'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiDeploy/ApiDeployEvent');
var event;
describe('ApiDeployEvent', function () {
    beforeEach(function () {
        event = {
            ResourceProperties: {
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
            },
            OldResourceProperties: {
                restApiId: 'RestApiId2',
                stageName: 'StageName2',
                stageConfig: {
                    cacheClusterEnabled: false,
                    cacheClusterSize: 1.0,
                    description: 'TestStage2'
                },
                methodSettings: {
                    '*/*/metrics/enabled': false,
                    '*/*/logging/loglevel': 'ERROR2',
                    'no-params/GET/logging/loglevel': 'INFO2'
                },
                stageVariables: {
                    testVar1: 'TestValue1-2',
                    testVar2: 'TestValue2-2'
                }
            }
        };
    });

    describe('getParameters', function () {
        it('should give both old and new parameters', function (done) {

            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.stageName).to.equal('StageName');
            expect(parameters.params.stageConfig.cacheClusterEnabled).to.equal(true);
            expect(parameters.params.stageConfig.cacheClusterSize).to.equal(0.5);
            expect(parameters.params.stageConfig.description).to.equal('TestStage');
            expect(parameters.params.methodSettings['*/*/metrics/enabled']).to.equal(true);
            expect(parameters.params.methodSettings['*/*/logging/loglevel']).to.equal('ERROR');
            expect(parameters.params.methodSettings['no-params/GET/logging/loglevel']).to.equal('INFO');
            expect(parameters.params.stageVariables.testVar1).to.equal('TestValue1');
            expect(parameters.params.stageVariables.testVar2).to.equal('TestValue2');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.stageName).to.equal('StageName2');
            expect(parameters.old.stageConfig.cacheClusterEnabled).to.equal(false);
            expect(parameters.old.stageConfig.cacheClusterSize).to.equal(1.0);
            expect(parameters.old.stageConfig.description).to.equal('TestStage2');
            expect(parameters.old.methodSettings['*/*/metrics/enabled']).to.equal(false);
            expect(parameters.old.methodSettings['*/*/logging/loglevel']).to.equal('ERROR2');
            expect(parameters.old.methodSettings['no-params/GET/logging/loglevel']).to.equal('INFO2');
            expect(parameters.old.stageVariables.testVar1).to.equal('TestValue1-2');
            expect(parameters.old.stageVariables.testVar2).to.equal('TestValue2-2');
            done();
        });
        it('should get new params only if old params are not set', function (done) {
            delete event.OldResourceProperties;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params).to.be.an('object');
            expect(parameters.old).to.be.undefined;
            done();
        });
        it('should yield an error due to missing restApiId', function (done) {
            delete event.ResourceProperties.restApiId;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/restApiId/);
            done();
        });
        it('should yield an error due to missing name', function (done) {
            delete event.ResourceProperties.stageName;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/stageName/);
            done();
        });
        it('should not validate parameters id RequestType is Delete', function (done) {
            event.RequestType =  'Delete';
            delete event.ResourceProperties.restApiId;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.stageName).to.equal('StageName');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var parameters = testSubject.getParameters(event);
            var patchOperations = testSubject.getPatchOperations(parameters);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(8);
            console.log(patchOperations)
            expect(patchOperations[0].path).to.equal('/cacheClusterEnabled');
            expect(patchOperations[1].path).to.equal('/cacheClusterSize');
            expect(patchOperations[2].path).to.equal('/description');
            expect(patchOperations[3].path).to.equal('/variables/testVar1');
            expect(patchOperations[4].path).to.equal('/variables/testVar2');
            expect(patchOperations[5].path).to.equal('/*/*/metrics/enabled');
            expect(patchOperations[6].path).to.equal('/*/*/logging/loglevel');
            expect(patchOperations[7].path).to.equal('/~1no-params/GET/logging/loglevel');
            done();
        });
        it('should give no patch operations for subset of config', function (done) {
            delete event.ResourceProperties.stageConfig;
            delete event.ResourceProperties.stageVariables;
            delete event.ResourceProperties.methodSettings;
            var parameters = testSubject.getParameters(event);
            var patchOperations = testSubject.getPatchOperations(parameters);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(0);
            done();
        });
    });
});