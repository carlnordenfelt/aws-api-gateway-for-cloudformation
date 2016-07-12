'use strict';

var expect = require('chai').expect;var _ = require('lodash');

var testSubject = require('../../../../lib/service/api-deploy/api-deploy-event');
var event;
describe('ApiDeployEvent', function () {
    beforeEach(function () {
        event = {
            ResourceProperties: {
                restApiId: 'RestApiId',
                stageName: 'StageName',
                cacheClusterEnabled: 'true',
                cacheClusterSize: '0.5',
                stageDescription: 'TestStage',
                methodSettings: {
                    '*/*/metrics/enabled': true,
                    '*/*/logging/loglevel': 'ERROR',
                    'no-params/GET/logging/loglevel': 'INFO',
                    'no-params/GET/logging/dataTrace': true
                },
                stageVariables: {
                    testVar1: 'TestValue1',
                    testVar2: 'TestValue2'
                }
            },
            OldResourceProperties: {
                restApiId: 'RestApiId2',
                stageName: 'StageName2',
                cacheClusterEnabled: 'false',
                cacheClusterSize: '1.0',
                stageDescription: 'TestStage2',
                methodSettings: {
                    '*/*/metrics/enabled': false,
                    '*/*/logging/loglevel': 'ERROR2',
                    'no-params/GET/logging/loglevel': 'INFO2',
                    'no-params/GET/logging/dataTrace': true
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
            expect(parameters.params.cacheClusterEnabled).to.equal('true');
            expect(parameters.params.cacheClusterSize).to.equal('0.5');
            expect(parameters.params.stageDescription).to.equal('TestStage');
            expect(parameters.params.methodSettings['*/*/metrics/enabled']).to.equal(true);
            expect(parameters.params.methodSettings['*/*/logging/loglevel']).to.equal('ERROR');
            expect(parameters.params.methodSettings['no-params/GET/logging/loglevel']).to.equal('INFO');
            expect(parameters.params.methodSettings['no-params/GET/logging/dataTrace']).to.equal(true);
            expect(parameters.params.stageVariables.testVar1).to.equal('TestValue1');
            expect(parameters.params.stageVariables.testVar2).to.equal('TestValue2');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.stageName).to.equal('StageName2');
            expect(parameters.old.cacheClusterEnabled).to.equal('false');
            expect(parameters.old.cacheClusterSize).to.equal('1.0');
            expect(parameters.old.stageDescription).to.equal('TestStage2');
            expect(parameters.old.methodSettings['*/*/metrics/enabled']).to.equal(false);
            expect(parameters.old.methodSettings['*/*/logging/loglevel']).to.equal('ERROR2');
            expect(parameters.old.methodSettings['no-params/GET/logging/loglevel']).to.equal('INFO2');
            expect(parameters.old.methodSettings['no-params/GET/logging/dataTrace']).to.equal(true);
            expect(parameters.old.stageVariables.testVar1).to.equal('TestValue1-2');
            expect(parameters.old.stageVariables.testVar2).to.equal('TestValue2-2');
            done();
        });
        it('should get params with defaults', function (done) {
            delete event.ResourceProperties.cacheClusterEnabled;
            delete event.ResourceProperties.cacheClusterSize;
            delete event.ResourceProperties.stageDescription;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.cacheClusterEnabled).to.equal('false');
            expect(parameters.params.cacheClusterSize).to.equal('0.5');
            expect(parameters.params.stageDescription).to.equal('');
            done();
        });
        it('should get new params only if old params are not set', function (done) {
            delete event.OldResourceProperties;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params).to.be.an('object');
            expect(parameters.old).to.equal(null);
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
            event.RequestType = 'Delete';
            delete event.ResourceProperties.restApiId;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.stageName).to.equal('StageName');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            delete event.OldResourceProperties.stageDescription;
            delete event.ResourceProperties.stageVariables.testVar2;
            delete event.ResourceProperties.methodSettings['no-params/GET/logging/dataTrace'];
            event.OldResourceProperties.cacheClusterEnabled = 'true';
            event.ResourceProperties.stageVariables.testVar3 = 'TestVar3';
            event.ResourceProperties.methodSettings['no-params/GET/metrics/enabled'] = true;
            var parameters = testSubject.getParameters(event);
            var patchOperations = testSubject.getPatchOperations(parameters);

            expect(patchOperations).to.be.an('Array');
            expect(patchOperations.length).to.equal(9);
            expect(_.find(patchOperations, { path: '/cacheClusterSize' }).op).to.equal('replace');
            expect(_.find(patchOperations, { path: '/cacheClusterSize' }).value).to.equal('0.5');
            expect(_.find(patchOperations, { path: '/description' }).value).to.equal('TestStage');
            expect(_.find(patchOperations, { path: '/description' }).op).to.equal('replace');
            expect(_.find(patchOperations, { path: '/variables/testVar1' }).value).to.equal('TestValue1');
            expect(_.find(patchOperations, { path: '/variables/testVar2' }).op).to.equal('remove');
            expect(_.find(patchOperations, { path: '/variables/testVar3' }).op).to.equal('replace');
            expect(_.find(patchOperations, { path: '/*/*/metrics/enabled' }).value).to.equal(true);
            expect(_.find(patchOperations, { path: '/*/*/logging/loglevel' }).value).to.equal('ERROR');
            expect(_.find(patchOperations, { path: '/~1no-params/GET/logging/loglevel' }).value).to.equal('INFO');
            expect(_.find(patchOperations, { path: '/~1no-params/GET/metrics/enabled' }).value).to.equal(true);
            expect(_.find(patchOperations, { path: '/~1no-params/GET/metrics/enabled' }).op).to.equal('replace');
            expect(_.find(patchOperations, { path: '/~1no-params/GET/logging/dataTrace' })).to.equal(undefined);
            done();
        });
        it('should give patch operations for defaults only', function (done) {
            delete event.ResourceProperties.stageDescription;
            delete event.ResourceProperties.cacheClusterEnabled;
            delete event.ResourceProperties.cacheClusterSize;
            delete event.ResourceProperties.stageVariables;
            delete event.ResourceProperties.methodSettings;
            event.OldResourceProperties.cacheClusterEnabled = 'true';
            var parameters = testSubject.getParameters(event);
            var patchOperations = testSubject.getPatchOperations(parameters);
            expect(patchOperations).to.be.an('Array');
            expect(_.find(patchOperations, { path: '/cacheClusterSize' })).to.be.an('object');
            expect(_.find(patchOperations, { path: '/cacheClusterEnabled' })).to.be.an('object');
            expect(_.find(patchOperations, { path: '/description' })).to.be.an('object');
            expect(patchOperations.length).to.equal(3);
            done();
        });
    });
});
