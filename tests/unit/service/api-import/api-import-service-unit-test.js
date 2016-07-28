'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('APi Import Service', function () {
    var importRestApiStub;
    var putRestApiStub;
    var getObjectStub;

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
        getObjectStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.importRestApi = importRestApiStub;
                this.putRestApi = putRestApiStub;
            },
            S3: function () {
                this.getObject = getObjectStub;
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
        getObjectStub.reset().resetBehavior();
        getObjectStub.yields(undefined, {
            Body: 'yaml',
            ETag: 'checksum'
        });
    });

    describe('importApi', function () {
        describe('with apiDefinition', function () {
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
        describe('importApi with apiDefinitionS3Location', function () {
            var params;
            beforeEach(function () {
                params = {
                    apiDefinitionS3Location: {
                        bucket: 'mybucket',
                        key: 'objectKey',
                        version: '123',
                        etag: 'checksum'
                    },
                    parameters: {},
                    failOnWarnings: true
                };
            });
            it('should import an API without ETag check', function (done) {
                delete params.apiDefinitionS3Location.etag;
                testSubject.importApi(params, function (error, restApi) {
                    expect(error).to.equal(undefined);
                    expect(restApi).to.be.an('object');
                    done();
                });
            });
            it('should import an API with ETag check', function (done) {
                testSubject.importApi(params, function (error, restApi) {
                    expect(error).to.equal(undefined);
                    expect(restApi).to.be.an('object');
                    done();
                });
            });
            it('should return an error when the ETag does not match', function (done) {
                getObjectStub.yields(null, { ETag: 'invalid' });
                testSubject.importApi(params, function (error, restApi) {
                    expect(error.message).to.contain('Invalid ETag');
                    expect(restApi).to.equal(undefined);
                    done();
                });
            });
            it('should return an error when getting api from s3 fails', function (done) {
                getObjectStub.yields({});
                testSubject.importApi(params, function (error, restApi) {
                    expect(error).to.be.an('object');
                    expect(restApi).to.equal(undefined);
                    done();
                });
            });
        });
    });

    describe('updateApi', function () {
        describe('with apiDefinition', function () {
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
        describe('with apiDefinitionS3Location', function () {
            var params;
            beforeEach(function () {
                params = {
                    apiDefinitionS3Location: {},
                    parameters: {},
                    failOnWarnings: true
                };
            });
            it('should return an error when getting api from s3 fails', function (done) {
                getObjectStub.yields({});
                testSubject.updateApi('RestApiId', params, function (error, restApi) {
                    expect(error).to.be.an('object');
                    expect(restApi).to.equal(undefined);
                    done();
                });
            });
        });
    });
});
