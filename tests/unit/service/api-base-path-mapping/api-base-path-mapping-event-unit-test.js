'use strict';

var expect = require('chai').expect;
var testSubject = require('../../../../lib/service/api-base-path-mapping/api-base-path-mapping-event');

describe('ApiBasePathMappingEvent', function () {

    describe('getParameters', function () {
        it('should give both old and new parameters', function (done) {
            var event = {
                ResourceProperties: {
                    domainName: 'DomainName',
                    restApiId: 'RestApiId',
                    basePath: 'BasePath',
                    stage: 'Stage'
                },
                OldResourceProperties: {
                    domainName: 'DomainName2',
                    restApiId: 'RestApiId2',
                    basePath: 'BasePath2',
                    stage: 'Stage2'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.domainName).to.equal('DomainName');
            expect(parameters.params.basePath).to.equal('BasePath');
            expect(parameters.params.stage).to.equal('Stage');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.domainName).to.equal('DomainName2');
            expect(parameters.old.basePath).to.equal('BasePath2');
            expect(parameters.old.stage).to.equal('Stage2');
            done();
        });
        it('should yield an error due to missing restApiId', function (done) {
            var event = {
                ResourceProperties: {
                    domainName: 'DomainName'
                }
            };
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/restApiId/);
            done();
        });
        it('should yield an error due to missing domainName', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId'
                }
            };
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/domainName/);
            done();
        });
        it('should yield an error due to missing stage', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    domainName: "DomainName"
                }
            };
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/stage/);
            done();
        });

        it('should get parameters with defaults', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    domainName: 'DomainName',
                    stage: "Stage"
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.domainName).to.equal('DomainName');
            expect(parameters.params.stage).to.equal('Stage');
            expect(parameters.params.basePath).to.equal('');
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
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an('Array');
            expect(patchOperations.length).to.equal(3);
            done();
        });
    });
});
