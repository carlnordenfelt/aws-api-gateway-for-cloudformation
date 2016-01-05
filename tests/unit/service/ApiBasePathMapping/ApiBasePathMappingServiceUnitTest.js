'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiBasePathMappingService', function () {
    var getBasePathMappingStub;
    var createBasePathMappingStub;
    var deleteBasePathMappngStub;
    var updateBasePathMappingStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getBasePathMappingStub = sinon.stub();
        createBasePathMappingStub = sinon.stub();
        deleteBasePathMappngStub = sinon.stub();
        updateBasePathMappingStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getBasePathMapping = getBasePathMappingStub;
                this.createBasePathMapping = createBasePathMappingStub;
                this.deleteBasePathMapping = deleteBasePathMappngStub;
                this.updateBasePathMapping = updateBasePathMappingStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/ApiBasePathMapping/ApiBasePathMappingService');
    });
    beforeEach(function () {
        getBasePathMappingStub.reset().resetBehavior();
        getBasePathMappingStub.yields(undefined, {});
        createBasePathMappingStub.reset().resetBehavior();
        createBasePathMappingStub.yields(undefined, {});
        deleteBasePathMappngStub.reset().resetBehavior();
        deleteBasePathMappngStub.yields(undefined, {});
        updateBasePathMappingStub.reset().resetBehavior();
        updateBasePathMappingStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an api base path mapping', function (done) {
            testSubject.getForResponse('BasePath', 'DomainName', function (error, apiBasePathMapping) {
                expect(error).to.be.undefined;
                expect(apiBasePathMapping).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting an api base path mapping', function (done) {
            getBasePathMappingStub.yields({});
            testSubject.getForResponse('BasePath', 'DomainName', function (error, apiBasePathMapping) {
                expect(error).to.be.an.Error;
                expect(apiBasePathMapping).to.be.undefined;
                done();
            });
        });
    });

    describe('createBasePathMapping', function () {
        var params;
        beforeEach(function () {
            params = {
                domainName: 'DomainName',
                restApiId: 'RestApiId',
                basePath: 'BasePath',
                stage: 'Stage'
            };
        });
        it('should create an api base path mapping', function (done) {
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when creating base path mapping', function (done) {
            createBasePathMappingStub.yields({});
            testSubject.createBasePathMapping(params, function (error) {
                expect(error).to.be.an.Error;
                done();
            });
        });
    });

    describe('deleteBasePathMapping', function () {
        var params;
        beforeEach(function () {
            params = {
                domainName: 'DomainName',
                basePath: 'BasePath'
            };
        });
        it('should delete an api base path mapping', function (done) {
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteBasePathMappngStub.yields('deleteError');
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
        it('should not return an error when resource is not found', function (done) {
            deleteBasePathMappngStub.yields({ code : 'NotFoundException' });
            testSubject.deleteBasePathMapping(params, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
    });

    describe('patchBasePathMapping', function () {
        it('should patch nothing', function (done) {
            var event = {
                params: {
                    domainName: 'DomainName',
                    restApiId: 'RestApiId',
                    basePath: 'BasePath',
                    stage: 'Stage'
                },
                old: {
                    domainName: 'DomainName2',
                    restApiId: 'RestApiId2',
                    basePath: 'BasePath2',
                    stage: 'Stage2'
                }
            };
            testSubject.patchBasePathMapping('BasePath', 'DomainName', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateBasePathMappingStub.called).to.be.false;
                done();
            });
        });
    });
});