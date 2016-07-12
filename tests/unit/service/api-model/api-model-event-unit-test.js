'use strict';

var expect = require('chai').expect;
var testSubject = require('../../../../lib/service/api-model/api-model-event');

describe('ApiModelEvent', function () {

    describe('getParameters', function () {
        it('should give both old and new parameters', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    name: 'ModelName',
                    contentType: 'application/json',
                    schema: {},
                    description: 'ModelDesc'
                },
                OldResourceProperties: {
                    restApiId: 'RestApiId2',
                    name: 'ModelName2',
                    contentType: 'application/xml',
                    schema: {},
                    description: 'ModelDesc2'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.name).to.equal('ModelName');
            expect(parameters.params.contentType).to.equal('application/json');
            expect(parameters.params.schema).to.be.an('object');
            expect(parameters.params.description).to.equal('ModelDesc');

            expect(parameters.old.restApiId).to.equal('RestApiId2');
            expect(parameters.old.name).to.equal('ModelName2');
            expect(parameters.old.contentType).to.equal('application/xml');
            expect(parameters.old.schema).to.be.an('object');
            expect(parameters.old.description).to.equal('ModelDesc2');
            done();
        });
        it('should yield an error due to missing restApiId', function (done) {
            var event = { ResourceProperties: { } };
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/restApiId/);
            done();
        });
        it('should yield an error due to missing name', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId'
                }
            };
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/name/);
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

        it('should get parameters with defaults', function (done) {
            var event = {
                ResourceProperties: {
                    restApiId: 'RestApiId',
                    name: 'ModelName'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.name).to.equal('ModelName');
            expect(parameters.params.contentType).to.equal('application/json');
            expect(parameters.params.schema).to.be.an('object');
            expect(parameters.params.description).to.equal('');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    restApiId: 'RestApiId',
                    name: 'ModelName',
                    contentType: 'ContentType',
                    schema: { test: "Schema" },
                    description: 'ModelDesc'
                },
                old: {
                    restApiId: 'RestApiId2',
                    name: 'ModelName2',
                    contentType: 'ContentType2',
                    schema: { test: "Schema2" },
                    description: 'ModelDesc2'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an('Array');
            expect(patchOperations.length).to.equal(2);
            expect(patchOperations[0].path).to.equal('/schema');
            expect(patchOperations[1].path).to.equal('/description');
            done();
        });
    });
});
