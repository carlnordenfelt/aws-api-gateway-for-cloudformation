'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('APi Import Service', function () {
    var importRestApiStub;
    var putRestApiStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        importRestApiStub = sinon.stub();
        putRestApiStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.importRestApi = importRestApiStub;
                this.putRestApi = putRestApiStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/api-import/api-import-service');
    });
    beforeEach(function () {
        importRestApiStub.reset().resetBehavior();
        importRestApiStub.yields(undefined, {});
        putRestApiStub.reset().resetBehavior();
        putRestApiStub.yields(undefined, {});
    });

    describe('importApi', function () {
        var params;
        beforeEach(function () {
            params = {
                apiDefinition: {},
                parameters: {},
                failOnWarnings: true
            };
        });
        it('should import an API', function (done) {
            testSubject.importApi(params, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.be.an('object');
                done();
            });
        });
        it('should return an error when importing API', function (done) {
            importRestApiStub.yields({});
            params.failOnWarnings = false; // coverage
            testSubject.importApi(params, function (error, restApi) {
                expect(error).to.be.an('object');
                expect(restApi).to.equal(undefined);
                done();
            });
        });
    });

    describe('updateApi', function () {
        var params;
        beforeEach(function () {
            params = {
                apiDefinition: {},
                parameters: {},
                failOnWarnings: true,
                restApiId: 'RestApiId'
            };
        });
        it('should update an API', function (done) {
            testSubject.updateApi('RestApiId', params, function (error, restApi) {
                expect(error).to.equal(undefined);
                expect(restApi).to.be.an('object');
                done();
            });
        });
        it('should return an error when updating API', function (done) {
            putRestApiStub.yields({});
            params.failOnWarnings = false; // coverage
            testSubject.updateApi('RestApiId', params, function (error, restApi) {
                expect(error).to.be.an('object');
                expect(restApi).to.equal(undefined);
                done();
            });
        });
    });
});
