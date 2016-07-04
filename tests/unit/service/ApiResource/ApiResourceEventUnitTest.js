'use strict';

var chai = require('chai');
var expect = chai.expect;

var Constants = require('../../../../lib/service/Constants');
var testSubject = require('../../../../lib/service/ApiResource/ApiResourceEvent');

describe('ApiResourceEvent', function () {

    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = {
                ResourceProperties: {
                    parentId: 'ParentId',
                    pathPart: 'PathPart',
                    corsConfiguration: {
                        allowMethods: []
                    },
                    restApiId: 'RestApiId'
                },
                OldResourceProperties: {
                    parentId: 'ParentId2',
                    pathPart: 'PathPart2',
                    corsConfiguration: {
                        allowMethods: []
                    },
                    restApiId: 'RestApiId2'
                }
            };
        });
        it('should give both old and new parameters with defaults', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.parentId).to.equal('ParentId');
            expect(parameters.params.pathPart).to.equal('PathPart');
            expect(parameters.params.corsConfiguration).to.be.an('object');
            expect(parameters.params.corsConfiguration.allowMethods).be.an('array');
            expect(parameters.params.corsConfiguration.allowOrigin).to.equal('*');
            expect(parameters.params.corsConfiguration.allowHeaders.length).to.equal(4);
            expect(parameters.params.corsConfiguration.allowHeaders).to.contain('Content-Type');
            expect(parameters.params.corsConfiguration.allowHeaders).to.contain('X-Amz-Date');
            expect(parameters.params.corsConfiguration.allowHeaders).to.contain('Authorization');
            expect(parameters.params.corsConfiguration.allowHeaders).to.contain('X-Api-Key');
            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.parentId).to.equal('ParentId2');
            expect(parameters.old.pathPart).to.equal('PathPart2');
            expect(parameters.old.corsConfiguration).to.be.an('object');
            done();
        });
        it('should give CORS with all methods', function (done) {
            delete event.ResourceProperties.corsConfiguration.allowMethods;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfiguration.allowMethods).be.an('array');
            expect(parameters.params.corsConfiguration.allowMethods.length).to.equals(Constants.CORS_ALL_METHODS.length);
            done();
        });
        it('should give parameters without cors', function (done) {
            delete event.ResourceProperties.corsConfiguration;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.parentId).to.equal('ParentId');
            expect(parameters.params.pathPart).to.equal('PathPart');
            expect(parameters.params.corsConfiguration).to.equal(undefined);
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
        it('should yield an error due to missing pathPart', function (done) {
            delete event.ResourceProperties.pathPart;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/pathPart/);
            done();
        });
        it('should yield an error due to missing parentId', function (done) {
            delete event.ResourceProperties.parentId;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/parentId/);
            done();
        });
        it('should not validate parameters if RequestType is Delete', function (done) {
            delete event.ResourceProperties.parentId;
            delete event.OldResourceProperties;
            event.RequestType = 'Delete';
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            done();
        });

        it('should get parameters with complete cors config', function (done) {
            event.ResourceProperties.corsConfiguration = {
                allowMethods: [],
                allowOrigin: 'Origin',
                allowHeaders: [],
                exposeHeaders: [],
                allowCredentials: 'true',
                maxAge: '123'
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfiguration.allowMethods).be.an('array');
            expect(parameters.params.corsConfiguration.allowOrigin).to.equal('Origin');
            expect(parameters.params.corsConfiguration.allowHeaders).be.an('array');
            expect(parameters.params.corsConfiguration.exposeHeaders).be.an('array');
            expect(parameters.params.corsConfiguration.allowCredentials).be.equal('true');
            expect(parameters.params.corsConfiguration.maxAge).to.equal('123');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    parentId: 'ParentId',
                    pathPart: 'PathPart',
                    corsConfiguration: {
                        allowMethods: ['GET']
                    },
                    restApiId: 'RestApiId'
                },
                old: {
                    parentId: 'ParentId2',
                    pathPart: 'PathPart2',
                    corsConfiguration: {
                        allowMethods: ['GET2']
                    },
                    restApiId: 'RestApiId2'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an('array');
            expect(patchOperations.length).to.equal(2);
            expect(patchOperations[0].path).to.equal('/parentId');
            expect(patchOperations[1].path).to.equal('/pathPart');
            done();
        });
    });
});
