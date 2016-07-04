'use strict';

var expect = require('chai').expect;
var _ = require('lodash');

describe('validator', function () {
    var subject = require('../../../../lib/service/util/validator');

    var event;
    var schema;
    beforeEach(function () {
        schema = {
            '$schema': 'http://json-schema.org/draft-04/schema#',
            title: 'ApiDeploy Request',
            type: 'object',
            properties: {
                requiredProperty: {
                    description: 'Id of the Rest API you want to deploy.',
                    type: 'string',
                    required: true
                },
                standardProperty: {
                    type: 'string'
                },
                defaultValueProperty: {
                    type: 'string',
                    'default': 'Testing default'
                },
                nestedProperty: {
                    type: 'object',
                    properties: {
                        standardProperty: {
                            type: 'string'
                        },
                        defaultValueProperty: {
                            type: 'string',
                            'default': 'Testing nested default'
                        }
                    }
                }
            }
        };
        event = {
            ResourceProperties: {
                requiredProperty: 'RequiredProperty',
                standardProperty: 'StandardProperty',
                defaultValueProperty: 'DefaultValueProperty',
                nestedProperty: {
                    standardProperty: 'StandardProperty',
                    defaultValueProperty: 'DefaultValueProperty'
                }
            },
            OldResourceProperties: {
                requiredProperty: 'RequiredProperty2',
                standardProperty: 'StandardProperty2',
                defaultValueProperty: 'DefaultValueProperty2',
                nestedProperty: {
                    standardProperty: 'StandardProperty2',
                    defaultValueProperty: 'DefaultValueProperty2'
                }
            }
        };
    });
    describe('Validate', function () {
        it('should yield no errors', function (done) {
            var result = subject.validate(event, schema);
            expect(result.params.requiredProperty).to.equal('RequiredProperty');
            expect(result.params.standardProperty).to.equal('StandardProperty');
            expect(result.params.defaultValueProperty).to.equal('DefaultValueProperty');
            expect(result.params.nestedProperty.standardProperty).to.equal('StandardProperty');
            expect(result.params.nestedProperty.defaultValueProperty).to.equal('DefaultValueProperty');

            expect(result.old.requiredProperty).to.equal('RequiredProperty2');
            expect(result.old.standardProperty).to.equal('StandardProperty2');
            expect(result.old.defaultValueProperty).to.equal('DefaultValueProperty2');
            expect(result.old.nestedProperty.standardProperty).to.equal('StandardProperty2');
            expect(result.old.nestedProperty.defaultValueProperty).to.equal('DefaultValueProperty2');

            done();
        });
        it('should give default values', function (done) {
            delete event.ResourceProperties.defaultValueProperty;
            delete event.ResourceProperties.nestedProperty.defaultValueProperty;
            var result = subject.validate(event, schema);
            expect(result.params.defaultValueProperty).to.equal('Testing default');
            expect(result.params.nestedProperty.defaultValueProperty).to.equal('Testing nested default');
            done();
        });
        it('should yield one error', function (done) {
            delete event.ResourceProperties.requiredProperty;
            var fn = function () { subject.validate(event, schema); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/input.requiredProperty/);
            done();
        });
        it('should not yield error if RequestType === Delete', function (done) {
            event.RequestType = 'Delete';
            delete event.ResourceProperties.requiredProperty;
            subject.validate(event, schema);
            done();
        });
        it('should not yield error if OldResourceProperties is invalid', function (done) {
            event.RequestType = 'Delete';
            delete event.OldResourceProperties.requiredProperty;
            var result = subject.validate(event, schema);
            expect(event.OldResourceProperties.standardProperty).to.equal('StandardProperty2');
            done();
        });
        it('should not yield old result if there are no OldResourceProperties', function (done) {
            delete event.OldResourceProperties;
            var result = subject.validate(event, schema);
            expect(result.old).to.equal(null);
            done();
        });
        it('should not yield nestedProperty with defaults if nested property is not given', function (done) {
            delete event.ResourceProperties.nestedProperty;
            var result = subject.validate(event, schema);
            expect(result.params.nestedProperty).to.equal(undefined);
            done();
        });
    });
});
