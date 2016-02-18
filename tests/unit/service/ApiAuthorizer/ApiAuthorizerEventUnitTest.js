'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiAuthorizer/ApiAuthorizerEvent');
var event;

describe('ApiAuthorizerEvent', function () {

    describe('getParameters', function () {
        beforeEach(function (done) {
            event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    authorizerUri: 'AuthorizerUri',
                    identitySource: 'IdentitySource',
                    name: 'Name',
                    authorizerCredentials: 'AuthorizerCredentials',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds',
                    identityValidationExpression: 'IdentityValidationExpression'
                },
                OldResourceProperties: {
                    restApiId: 'RestApiId2',
                    authorizerUri: 'AuthorizerUri2',
                    identitySource: 'IdentitySource2',
                    name: 'Name2',
                    authorizerCredentials: 'AuthorizerCredentials2',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds2',
                    identityValidationExpression: 'IdentityValidationExpression2'
                }
            };
            done();
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.authorizerUri).to.equal('AuthorizerUri');
            expect(parameters.params.identitySource).to.equal('IdentitySource');
            expect(parameters.params.name).to.equal('Name');
            expect(parameters.params.authorizerCredentials).to.equal('AuthorizerCredentials');
            expect(parameters.params.authorizerResultTtlInSeconds).to.equal('AuthorizerResultTtlInSeconds');
            expect(parameters.params.identityValidationExpression).to.equal('IdentityValidationExpression');
            expect(parameters.params.type).to.equal('TOKEN'); // Default value only

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.authorizerUri).to.equal('AuthorizerUri2');
            expect(parameters.old.identitySource).to.equal('IdentitySource2');
            expect(parameters.old.name).to.equal('Name2');
            expect(parameters.old.authorizerCredentials).to.equal('AuthorizerCredentials2');
            expect(parameters.old.authorizerResultTtlInSeconds).to.equal('AuthorizerResultTtlInSeconds2');
            expect(parameters.old.identityValidationExpression).to.equal('IdentityValidationExpression2');
            done();
        });
        it('should yield an error due to missing restApiId', function (done) {
            delete event.ResourceProperties.restApiId;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{restApiId}');
            done();
        });
        it('should yield an error due to missing authorizerUri', function (done) {
            delete event.ResourceProperties.authorizerUri;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{authorizerUri}');
            done();
        });
        it('should yield an error due to missing identitySource', function (done) {
            delete event.ResourceProperties.identitySource;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{identitySource}');
            done();
        });
        it('should yield an error due to missing name', function (done) {
            delete event.ResourceProperties.name;
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{name}');
            done();
        });
        it('should set default ttl to 300', function (done) {
            delete event.ResourceProperties.authorizerResultTtlInSeconds;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.authorizerResultTtlInSeconds).to.equal(300);
            done();
        });
        it('should not validate parameters id RequestType is Delete', function (done) {
            var event = {
                RequestType: 'Delete',
                ResourceProperties: {
                    restApiId: 'RestApiId'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    restApiId: 'RestApiId',
                    name: 'Name',
                    authorizerUri: 'AuthorizerUri',
                    authorizerCredentials: 'AuthorizerCredentials',
                    identitySource: 'IdentitySource',
                    identityValidationExpression: 'IdentityValidationExpression',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds'
                },
                old: {
                    restApiId: 'RestApiId2',
                    name: 'Name2',
                    authorizerUri: 'AuthorizerUri2',
                    authorizerCredentials: 'AuthorizerCredentials2',
                    identitySource: 'IdentitySource2',
                    identityValidationExpression: 'IdentityValidationExpression2',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds2'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(6);
            expect(patchOperations[0].path).to.equal('/name');
            expect(patchOperations[1].path).to.equal('/authorizerUri');
            expect(patchOperations[2].path).to.equal('/authorizerCredentials');
            expect(patchOperations[3].path).to.equal('/identitySource');
            expect(patchOperations[4].path).to.equal('/identityValidationExpression');
            expect(patchOperations[5].path).to.equal('/authorizerResultTtlInSeconds');
            done();
        });
    });
});