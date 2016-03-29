'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiMethod/ApiMethodEvent');

describe('ApiMethodEvent', function () {

    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    resourceId: 'ResourceId',
                    method: {
                        httpMethod: 'HttpMethod'
                    },
                    integration: 'Integration',
                    responses: 'Responses'
                },
                OldResourceProperties: {
                    restApiId: 'RestApiId2',
                    resourceId: 'ResourceId2',
                    method: {
                        httpMethod: 'HttpMethod2'
                    },
                    integration: 'Integration2',
                    responses: 'Responses2'
                }
            };
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.resourceId).to.equal('ResourceId');
            expect(parameters.params.method.httpMethod).to.equal('HttpMethod');
            expect(parameters.params.integration).to.equal('Integration');
            expect(parameters.params.responses).to.equal('Responses');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.resourceId).to.equal('ResourceId2');
            expect(parameters.old.method.httpMethod).to.equal('HttpMethod2');
            expect(parameters.old.integration).to.equal('Integration2');
            expect(parameters.old.responses).to.equal('Responses2');
            done();
        });
        it('additional coverage test', function (done) {
            delete event.OldResourceProperties.method;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.resourceId).to.equal('ResourceId2');
            expect(parameters.old.method).to.be.undefined;
            expect(parameters.old.integration).to.equal('Integration2');
            expect(parameters.old.responses).to.equal('Responses2');
            done();
        });
        it('should yield an error due to missing restApiId', function (done) {
            delete event.ResourceProperties.restApiId;
            delete event.OldResourceProperties;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/restApiId/);
            done();
        });
        it('should yield an error due to missing resourceId', function (done) {
            delete event.ResourceProperties.resourceId;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/resourceId/);
            done();
        });
        it('should yield an error due to missing method', function (done) {
            delete event.ResourceProperties.method;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method/);
            done();
        });
        it('should yield an error due to missing method.httpMethod', function (done) {
            delete event.ResourceProperties.method.httpMethod;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method.httpMethod/);
            done();
        });
        it('should not do validation if RequestType is set to delete', function (done) {
            event.RequestType = 'Delete';
            delete event.ResourceProperties.method.httpMethod;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            done();
        });
    });

    describe('validateParameters', function () {
        var params;
        beforeEach(function () {
             params = {
                 restApiId: 'RestApiId',
                 resourceId: 'ResourceId',
                 method: {
                     httpMethod: 'HttpMethod',
                     authorizationType: 'IAM',
                     authorizerId: 'AuthorizerId',
                     apiKeyRequired: true
                 },
                 integration: {
                     type: 'integration.type',
                     httpMethod: 'integration.httpMethod',
                     uri: 'integration.uri',
                     requestTemplates: {
                         IntegrationRequestTemplateObject: {},
                         IntegrationRequestTemplateString: ''
                     }
                 },
                 responses: {
                     default: {
                         statusCode: "Response.StatusCode",
                         responseTemplates: {
                             ResponseTemplateObject: {},
                             ResponseTemplateString: ''
                         }
                     },
                     ResponseKey: {
                         statusCode: "Response.StatusCode"
                     }
                 }
             };
        });
        it('should return valid parameters', function (done) {
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            expect(parameters.method.httpMethod).to.equal('HTTPMETHOD');
            expect(parameters.method.authorizationType).to.equal('IAM');
            expect(parameters.method.apiKeyRequired).to.be.true;
            expect(parameters.integration.httpMethod).to.equal('INTEGRATION.HTTPMETHOD');
            expect(parameters.responses[0].selectionPattern).to.be.undefined;
            expect(parameters.responses[1].selectionPattern).to.equal('ResponseKey');
            done();
        });
        it('should return valid parameters with valid defaults', function (done) {
            delete params.method.authorizationType;
            delete params.method.apiKeyRequired;
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            expect(parameters.method.authorizationType).to.equal('NONE');
            expect(parameters.method.apiKeyRequired).to.be.false;
            done();
        });
        it('should return valid parameters if integration is missing', function (done) {
            delete params.integration;
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            done();
        });
        it('should return valid parameters for authorizationType CUSTOM', function (done) {
            params.method.authorizationType = 'CUSTOM';
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            done();
        });
        it('should not require integration.httpMethod or integration.uri if integration.httpMethod is MOCK', function (done) {
            params.integration.type = 'MOCK';
            delete params.integration.uri;
            delete params.integration.httpMethod;
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            done();
        });
        it('should not require integration.requestTemplates to be set', function (done) {
            delete params.integration.requestTemplates;
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            done();
        });
        it('should return valid parameters if response is missing', function (done) {
            delete params.responses;
            var parameters = testSubject.validateParameters(params);
            expect(parameters).not.to.be.an.Error;
            done();
        });

        it('should throw an error due to missing restApiId', function (done) {
            delete params.restApiId;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/restApiId/);
            done();
        });
        it('should throw an error due to missing resourceId', function (done) {
            delete params.resourceId;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/resourceId/);
            done();
        });
        it('should throw an error due to missing method', function (done) {
            delete params.method;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method/);
            done();
        });
        it('should throw an error due to missing method.httpMethod', function (done) {
            delete params.method.httpMethod;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method.httpMethod/);
            done();
        });
        it('should throw an error due to missing integration.type', function (done) {
            delete params.integration.type;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.type/);
            done();
        });
        it('should throw an error due to missing integration.httpMethod', function (done) {
            delete params.integration.httpMethod;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.httpMethod/);
            done();
        });
        it('should throw an error due to missing integration.uri', function (done) {
            delete params.integration.uri;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.uri/);
            done();
        });
        it('should throw an error due to missing responses.statusCode', function (done) {
            delete params.responses.ResponseKey.statusCode;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/responses.statusCode/);
            done();
        });
        it('should throw an error if authorizationType is CUSTOM and no authorizerId is set', function (done) {
            params.method.authorizationType = 'CUSTOM';
            delete params.method.authorizerId;
            var fn = function () { testSubject.validateParameters(params); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method.authorizerId/);
            done();
        });
    });
});