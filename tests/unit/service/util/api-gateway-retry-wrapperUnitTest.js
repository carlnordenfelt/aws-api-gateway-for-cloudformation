'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('api-gateway-retry-wrapper', function () {
    var getResourceStub;

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

        var awsSdkStub = {
            APIGateway: function () {
                this.getResource = getResourceStub;
            }
        };
        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/util/api-gateway-retry-wrapper')({ apiVersion: '2015-07-09' }, { minRetryIntervalMs: 10, maxRetries: 1, retryWindow: 10 });
    });
    beforeEach(function () {
        getResourceStub.reset().resetBehavior();
        getResourceStub.yields(undefined, {});
    });

    it('should handle retires when aws-sdk responds with TooManyRequestsException', function (done) {
        var params = {
            restApiId: 'RestApiId',
            parentId: 'ParentId2',
            pathPart: '/pathPart'
        };
        getResourceStub.onCall(0).yields({ code: 'TooManyRequestsException' });
        getResourceStub.onCall(1).yields(undefined, { result: 'success' });
        testSubject.getResource(params, function (error, response) {
            expect(error).to.be.undefined;
            expect(response).to.be.an('object');
            expect(response.result).to.equal('success');
            done();
        });
    });

    it('should fail when too many retry attempts have been executed', function (done) {
        var params = {
            restApiId: 'RestApiId',
            parentId: 'ParentId2',
            pathPart: '/pathPart'
        };
        getResourceStub.onCall(0).yields({ code: 'TooManyRequestsException' });
        getResourceStub.onCall(1).yields({ code: 'TooManyRequestsException' });
        testSubject.getResource(params, function (error, response) {
            expect(error).to.be.an('object');
            expect(error.code).to.equal('TooManyRequestsException');
            expect(response).to.be.undefined;
            done();
        });
    });
});