'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiAuthorizerService', function () {
    var getAuthorizer;
    var createAuthorizerStub;
    var deleteAuthorizerStub;
    var updateAuthorizerStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getAuthorizer = sinon.stub();
        createAuthorizerStub = sinon.stub();
        deleteAuthorizerStub = sinon.stub();
        updateAuthorizerStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getAuthorizer = getAuthorizer;
                this.createAuthorizer = createAuthorizerStub;
                this.deleteAuthorizer = deleteAuthorizerStub;
                this.updateAuthorizer = updateAuthorizerStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/ApiAuthorizer/ApiAuthorizerService');
    });
    beforeEach(function () {
        getAuthorizer.reset().resetBehavior();
        getAuthorizer.yields(undefined, {});
        createAuthorizerStub.reset().resetBehavior();
        createAuthorizerStub.yields(undefined, {});
        deleteAuthorizerStub.reset().resetBehavior();
        deleteAuthorizerStub.yields(undefined, {});
        updateAuthorizerStub.reset().resetBehavior();
        updateAuthorizerStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an authorizer', function (done) {
            testSubject.getForResponse('AuthorizerId', 'RestApiId', function (error, apiAuthorizer) {
                expect(error).to.be.undefined;
                expect(apiAuthorizer).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting api model', function (done) {
            getAuthorizer.yields({});
            testSubject.getForResponse('AuthorizerId', 'RestApiId', function (error, apiAuthorizer) {
                expect(error).to.be.an.Error;
                expect(apiAuthorizer).to.be.undefined;
                done();
            });
        });
    });

    describe('create authorizer', function () {
        var params;
        beforeEach(function () {
            params = {
                restApiId: 'RestApiId',
                authorizerUri: 'AuthorizerUri',
                identitySource: 'IdentitySource',
                name: 'Name',
                authorizerCredentials: 'AuthorizerCredentials',
                authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds',
                identityValidationExpression: 'IdentityValidationExpression'
            };
        });
        it('should create an authorizer', function (done) {
            createAuthorizerStub.yields(undefined, {});
            testSubject.createAuthorizer(params, function (error, apiAuthorizer) {
                expect(error).to.be.an.Error;
                expect(error).to.be.undefined;
                expect(apiAuthorizer).to.be.an('object');
                done();
            });
        });
        it('should create an authorizer without all parameters', function (done) {
            delete params.authorizerCredentials;
            delete params.identityValidationExpression;
            createAuthorizerStub.yields(undefined, {});
            testSubject.createAuthorizer(params, function (error, apiAuthorizer) {
                expect(error).to.be.an.Error;
                expect(error).to.be.undefined;
                expect(apiAuthorizer).to.be.an('object');
                done();
            });
        });
        it('should return an error when creating an authorizer', function (done) {
            createAuthorizerStub.yields({});
            testSubject.createAuthorizer(params, function (error, apiAuthorizer) {
                expect(error).to.be.an.Error;
                expect(apiAuthorizer).to.be.undefined;
                done();
            });
        });
    });

    describe('delete authorizer', function () {
        it('should delete an api authorizer', function (done) {
            testSubject.deleteAuthorizer('AuthorizerId', 'RestApiId', function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteAuthorizerStub.yields('deleteError');
            testSubject.deleteAuthorizer('AuthorizerId', 'RestApiId', function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
    });

    describe('patchAuthorizer', function () {
        it('should patch an authorizer', function (done) {
            var event = {
                params: {
                    restApiId: 'RestApiId',
                    authorizerUri: 'AuthorizerUri',
                    identitySource: 'IdentitySource',
                    name: 'Name',
                    authorizerCredentials: 'AuthorizerCredentials',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds'
                },
                old: {
                    restApiId: 'RestApiId2',
                    authorizerUri: 'AuthorizerUri2',
                    identitySource: 'IdentitySource2',
                    name: 'Name2',
                    authorizerCredentials: 'AuthorizerCredentials2',
                    authorizerResultTtlInSeconds: 'AuthorizerResultTtlInSeconds2',
                    identityValidationExpression: 'IdentityValidationExpression2'
                }
            };
            testSubject.patchAuthorizer('AuthorizerId', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateAuthorizerStub.called).to.be.true;
                done();
            });
        });
        it('should patch noting', function (done) {
            var event = {
                params: { name: 'AuthorizerName' },
                old: { name: 'AuthorizerName' }
            };
            testSubject.patchAuthorizer('AuthorizerId', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateAuthorizerStub.called).to.be.false;
                done();
            });
        });
        it('should return error', function (done) {
            var event = {
                params: { name: 'AuthorizerName' },
                old: { name: 'AuthorizerName2' }
            };
            updateAuthorizerStub.yields({ code: 'NotFoundException' });
            testSubject.patchAuthorizer('AuthorizerId', event, function (error) {
                expect(error.code).to.equal('NotFoundException');
                done();
            });
        });
    });
});