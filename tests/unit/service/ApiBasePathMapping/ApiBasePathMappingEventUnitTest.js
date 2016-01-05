'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiBasePathMapping/ApiBasePathMappingEvent');

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
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{restApiId}');
            done();
        });
        it('should yield an error due to missing domainName', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{domainName}');
            done();
        });

        it('should get parameters with defaults', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    domainName: 'DomainName'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.domainName).to.equal('DomainName');
            expect(parameters.params.basePath).to.equal('');
            expect(parameters.params.stage).to.be.undefined;
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    domainName: 'newDomainName'
                },
                old: {
                    domainName: 'oldDomainName'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(0);
            done();
        });
    });
});