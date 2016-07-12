'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Cors::GetCorsMethodUpdateOperations', function () {
    var getMethodStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getMethodStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getMethod = getMethodStub;
            }
        };
        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/cors/get-cors-method-update-operations');
    });
    beforeEach(function () {
        getMethodStub.reset().resetBehavior();
        getMethodStub.yields(undefined, {});
    });

    describe('getCorsMethodUpdateOperations', function () {
        var newMethods, newOrigin, oldMethods, oldOrigin;
        beforeEach(function (){
            newMethods = ['GET', 'POST'];
            newOrigin = 'http://example.com';
            oldMethods = ['GET', 'PUT'];
            oldOrigin = '*';
        });

        it('should get changes for existing method when origin changed', function (done) {
            var stubParams = {
                httpMethod: 'GET',
                resourceId: 'ResourceId',
                restApiId: 'RestApiId'
            };
            getMethodStub.withArgs(stubParams, sinon.match.any).yields(undefined, yieldMethodWithStatusCodes([200, 400]));
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.be.undefined;

                expect(operations.length).to.equal(2);
                expect(operations[0].httpMethod).to.equal('GET');
                expect(operations[0].statusCode).to.equal('200');
                expect(operations[0].op).to.equal('replace');

                expect(operations[1].httpMethod).to.equal('GET');
                expect(operations[1].statusCode).to.equal('400');
                expect(operations[1].op).to.equal('replace');
                done();
            });
        });
        it('should get no changes for existing method when origin has not changed', function (done) {
            var stubParams = {
                httpMethod: 'GET',
                resourceId: 'ResourceId',
                restApiId: 'RestApiId'
            };
            newOrigin = '*';
            getMethodStub.withArgs(stubParams, sinon.match.any).yields(undefined, yieldMethodWithStatusCodes([200, 400]));
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.be.undefined;
                expect(operations.length).to.equal(0);
                done();
            });
        });

        it('should get no changes if method does not exist', function (done) {
            getMethodStub.yields({ code: 'NotFoundException' });
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(operations.length).to.equal(0);
                done();
            });
        });
        it('should get error if getMethod fails', function (done) {
            getMethodStub.yields('getMethodError');
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.equal('getMethodError');
                expect(operations).to.be.undefined;
                done();
            });
        });

        it('should ignore new OPTIONS method', function (done) {
            newMethods = ['OPTIONS'];
            oldMethods = [];
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.be.undefined;
                expect(operations.length).to.equal(0);
                done();
            });
        });
        it('should ignore removed OPTIONS method', function (done) {
            newMethods = [];
            oldMethods = ['OPTIONS'];
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.be.undefined;
                expect(operations.length).to.equal(0);
                done();
            });
        });
        it('should ignore changed OPTIONS method', function (done) {
            newMethods = ['OPTIONS'];
            oldMethods = ['OPTIONS'];
            testSubject('RestApiId', 'ResourceId', newMethods, newOrigin, oldMethods, oldOrigin, function (error, operations) {
                expect(error).to.be.undefined;
                expect(operations.length).to.equal(0);
                done();
            });
        });
    });
});

function yieldMethodWithStatusCodes(statusCodes) {
    var method = {
        methodIntegration: {
            integrationResponses: {}
        }
    };
    for (var i = 0; i < statusCodes.length; i++) {
        method.methodIntegration.integrationResponses[statusCodes[i]] = {};
    }
    return method;
}
