'use strict';

var expect = require('chai').expect;

var testSubject = require('../../../../lib/service/api-import/api-import-event');

describe('ApiImportEvent', function () {
    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = {
                ResourceProperties: {
                    apiDefinition: { api: 'Api1' },
                    failOnWarnings: 'true',
                    parameters: { param: 'Param1' }
                },
                OldResourceProperties: {
                    apiDefinition: { api: 'Api2' },
                    failOnWarnings: 'false',
                    parameters: { param: 'Param2' }
                }
            };
        });

        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.apiDefinition.api).to.equal('Api1');
            expect(parameters.params.failOnWarnings).to.equal('true');
            expect(parameters.params.parameters.param).to.equal('Param1');
            expect(parameters.params.updateMode).to.equal('overwrite');

            expect(parameters.old.apiDefinition.api).to.equal('Api2');
            expect(parameters.old.failOnWarnings).to.equal('false');
            expect(parameters.old.parameters.param).to.equal('Param2');
            done();
        });
        it('should yield an error due to missing apiDefinition', function (done) {
            delete event.ResourceProperties.apiDefinition;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/apiDefinition/);
            done();
        });
        it('should get defaults', function (done) {
            delete event.ResourceProperties.failOnWarnings;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.apiDefinition.api).to.equal('Api1');
            expect(parameters.params.failOnWarnings).to.equal('false');
            expect(parameters.params.parameters.param).to.equal('Param1');
            expect(parameters.params.updateMode).to.equal('overwrite');
            done();
        });
        it('should get updateMode merge if restApiId is set', function (done) {
            event.ResourceProperties.restApiId = 'RestApiId';
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.apiDefinition.api).to.equal('Api1');
            expect(parameters.params.failOnWarnings).to.equal('true');
            expect(parameters.params.parameters.param).to.equal('Param1');
            expect(parameters.params.restApiId).to.equal('RestApiId');
            expect(parameters.params.updateMode).to.equal('merge');
            done();
        });
        it('should not validate parameters id RequestType is Delete', function (done) {
            delete event.ResourceProperties.apiDefinition;
            delete event.OldResourceProperties; // Coverage
            event.RequestType = 'Delete';
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.parameters.param).to.equal('Param1');
            done();
        });
    });
});
