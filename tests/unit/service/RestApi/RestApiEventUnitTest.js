'use strict';

var chai = require('chai');
var expect = chai.expect;

var Constants = require('../../../../lib/service/Constants');
var testSubject = require('../../../../lib/service/RestApi/RestApiEvent');

describe('RestAPiEvent', function () {
    describe('getParameters', function () {
        var event;

        beforeEach(function () {
            event = {
                ResourceProperties: {
                    name: "ApiName",
                    description: "ApiDesc",
                    corsConfiguration: {
                        allowMethods: []
                    }
                },
                OldResourceProperties: {
                    name: "ApiName2",
                    description: "ApiDesc2",
                    corsConfiguration: {
                        allowMethods: []
                    }
                }
            };
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.name).to.equal('ApiName');
            expect(parameters.params.description).to.equal('ApiDesc');
            expect(parameters.old.name).to.equal('ApiName2');
            expect(parameters.old.description).to.equal('ApiDesc2');
            done();
        });
        it('should yield an error', function (done) {
            delete event.ResourceProperties.name;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/name/);
            done();
        });
        it('should not validate parameters if RequestType is Delete', function (done) {
            event.RequestType = 'Delete';
            delete event.ResourceProperties.name;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.description).to.equal('ApiDesc');
            done();
        });
        it('should give all CORS methods with wildcard', function (done) {
            event.ResourceProperties.corsConfiguration.allowMethods = '*';
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfig.allowMethods).be.an.Array;
            expect(parameters.params.corsConfig.allowMethods.length).to.equals(Constants.CORS_ALL_METHODS.length);
            done();
        });
        it('should give parameters without cors', function (done) {
            delete event.ResourceProperties.corsConfiguration;
            delete event.OldResourceProperties; // Coverage
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfig).to.be.undefined;
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