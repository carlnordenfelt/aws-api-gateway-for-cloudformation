'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/RestApi/RestApiEvent');

describe('RestAPiEvent', function () {

    describe('getParameters', function () {
        it('should give both old and new parameters', function (done) {
            var event = {
                ResourceProperties: {
                    name: "ApiName",
                    description: "ApiDesc"
                },
                OldResourceProperties: {
                    name: "ApiName2",
                    description: "ApiDesc2"
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.name).to.equal('ApiName');
            expect(parameters.params.description).to.equal('ApiDesc');
            expect(parameters.old.name).to.equal('ApiName2');
            expect(parameters.old.description).to.equal('ApiDesc2');
            done();
        });
        it('should yield an error', function (done) {
            var event = {
                ResourceProperties: {
                    description: "ApiDesc"
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters).to.be.an.Error;
            expect(parameters.message).to.contain('{name}');
            done();
        });
        it('should not validate parameters if RequestType is Delete', function (done) {
            var event = {
                RequestType: 'Delete',
                ResourceProperties: {
                    description: "ApiDesc"
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.description).to.equal('ApiDesc');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    name: "ApiName",
                    description: "ApiDesc"
                },
                old: {
                    name: "ApiName2",
                    description: "ApiDesc2"
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an.Array;
            expect(patchOperations.length).to.equal(2);
            expect(patchOperations[0].path).to.equal('/name');
            expect(patchOperations[0].op).to.equal('replace');
            expect(patchOperations[1].path).to.equal('/description');
            expect(patchOperations[1].op).to.equal('replace');
            done();
        });
    });
});