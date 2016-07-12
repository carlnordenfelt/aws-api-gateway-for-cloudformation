'use strict';

var expect = require('chai').expect;
var Constants = require('../../../../lib/service/constants');
var testSubject = require('../../../../lib/service/rest-api/rest-api-event');

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
        it('should give all CORS methods without allowMethods', function (done) {
            delete event.ResourceProperties.corsConfiguration.allowMethods;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfiguration.allowMethods).be.an.Array;
            expect(parameters.params.corsConfiguration.allowMethods.length).to.equals(Constants.CORS_ALL_METHODS.length);
            done();
        });
        it('should give parameters without cors', function (done) {
            delete event.ResourceProperties.corsConfiguration;
            delete event.OldResourceProperties; // Coverage
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfiguration).to.be.undefined;
            done();
        });it('should get parameters with complete cors config', function (done) {
            event.ResourceProperties.corsConfiguration = {
                allowMethods: [],
                allowOrigin: 'Origin',
                allowHeaders: ['x-test-header'],
                allowDefaultHeaders: 'true',
                exposeHeaders: [],
                allowCredentials: 'true',
                maxAge: '123'
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.corsConfiguration.allowMethods).be.an('array');
            expect(parameters.params.corsConfiguration.allowOrigin).to.equal('Origin');
            expect(parameters.params.corsConfiguration.allowHeaders).be.an('array');
            expect(parameters.params.corsConfiguration.allowHeaders.length).to.equal(5);
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

    describe('isValidResourceId', function () {
        it('should return true', function (done) {
            expect(testSubject.isValidResourceId('abc123')).to.equal(true);
            done();
        });
        it('should return false', function (done) {
            expect(testSubject.isValidResourceId('2016/07/05/[$LATEST]5ade9ec0d70249e19e8f9e4cda6e58b7	')).to.equal(false);
            done();
        });
    });
});
