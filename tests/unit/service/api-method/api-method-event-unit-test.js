'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var testSubject = require('../../../../lib/service/api-method/api-method-event');

describe('ApiMethodEvent', function () {
    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = _.cloneDeep(require('./util').event);
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.resourceId).to.equal('ResourceId');
            expect(parameters.params.method.httpMethod).to.equal('GET');
            expect(parameters.params.method.authorizationType).to.equal('AWS_IAM');
            expect(parameters.params.method.apiKeyRequired).to.equal('true');
            expect(parameters.params.integration).to.be.an('object');
            expect(parameters.params.integration.httpMethod).to.equal('POST');
            expect(parameters.params.integration.passthroughBehavior).to.equal('WHEN_NO_MATCH');
            expect(parameters.params.responses).to.be.an('object');
            expect(parameters.params.responses.default.statusCode).to.equal('200');
            expect(parameters.params.responses.selectionPattern1.statusCode).to.equal('400');
            expect(parameters.params.responses.selectionPattern2.statusCode).to.equal('500');
            done();
        });
        it('should return valid parameters with valid defaults', function (done) {
            delete event.ResourceProperties.method.authorizationType;
            delete event.ResourceProperties.method.authorizerId;
            delete event.ResourceProperties.method.apiKeyRequired;
            delete event.ResourceProperties.method.requestModels;
            delete event.ResourceProperties.method.parameters;
            event.ResourceProperties.integration.type = 'MOCK';
            delete event.ResourceProperties.integration.credentials;
            delete event.ResourceProperties.integration.cacheNamespace;
            delete event.ResourceProperties.integration.cacheKeyParameters;
            delete event.ResourceProperties.integration.httpMethod;
            delete event.ResourceProperties.integration.passthroughBehavior;
            delete event.ResourceProperties.integration.requestTemplates;
            delete event.ResourceProperties.integration.requestParameters;
            delete event.ResourceProperties.integration.uri;
            delete event.ResourceProperties.responses.uri;
            delete event.ResourceProperties.responses.default.headers;
            delete event.ResourceProperties.responses.default.responseTemplates;
            delete event.ResourceProperties.responses.default.responseModels;
            delete event.ResourceProperties.responses.selectionPattern1;
            delete event.ResourceProperties.responses.selectionPattern2;

            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.resourceId).to.equal('ResourceId');
            expect(parameters.params.method.httpMethod).to.equal('GET');
            expect(parameters.params.method.authorizationType).to.equal('NONE');
            expect(parameters.params.method.apiKeyRequired).to.equal('false');
            expect(parameters.params.integration).to.be.an('object');
            expect(parameters.params.integration.type).to.equal('MOCK');
            expect(parameters.params.integration.httpMethod).to.equal(undefined);
            expect(parameters.params.integration.passthroughBehavior).to.equal('WHEN_NO_MATCH');
            expect(parameters.params.responses).to.be.an('object');
            expect(parameters.params.responses.default.statusCode).to.equal('200');
            done();
        });
        it('should not do validation if RequestType is set to delete', function (done) {
            event.RequestType = 'Delete';
            delete event.ResourceProperties.method.httpMethod;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
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
        it('should yield an error due to missing authorizerId if authorizationType = CUSTOM', function (done) {
            event.ResourceProperties.method.authorizationType = 'CUSTOM';
            delete event.ResourceProperties.method.authorizerId;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/authorizerId/);
            done();
        });
        it('should yield an error due to missing method.httpMethod', function (done) {
            delete event.ResourceProperties.method.httpMethod;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method.httpMethod/);
            done();
        });
        it('should yield an error if integration is missing', function (done) {
            delete event.ResourceProperties.integration;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration/);
            done();
        });
        it('should throw an error due to missing integration.type', function (done) {
            delete event.ResourceProperties.integration.type;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.type/);
            done();
        });
        it('should throw an error due to missing integration.httpMethod', function (done) {
            delete event.ResourceProperties.integration.httpMethod;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.httpMethod/);
            done();
        });
        it('should throw an error due to missing integration.uri', function (done) {
            delete event.ResourceProperties.integration.uri;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/integration.uri/);
            done();
        });
        it('should return valid parameters if responses is missing', function (done) {
            delete event.ResourceProperties.responses;
            var parameters = testSubject.getParameters(event);
            expect(parameters).not.to.be.an.Error;
            done();
        });
        it('should throw an error due to missing responses.statusCode', function (done) {
            delete event.ResourceProperties.responses.selectionPattern1.statusCode;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/selectionPattern1.statusCode/);
            done();
        });
        it('should throw an error if authorizationType is CUSTOM and no authorizerId is set', function (done) {
            event.ResourceProperties.method.authorizationType = 'CUSTOM';
            delete event.ResourceProperties.method.authorizerId;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/method.authorizerId/);
            done();
        });
    });
});
