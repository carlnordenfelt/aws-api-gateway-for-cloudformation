'use strict';

var expect = require('chai').expect;
var testSubject = require('../../../../lib/service/cors/header-helper');

describe('Cors::HeaderHelper', function () {

    describe('getAllowMethodsValue', function () {
        it('should give allowed methods as string without options set', function (done) {
            var headers = ['GET', 'POST'];
            var headersString = testSubject.getAllowMethodsValue(headers);
            expect(headersString).to.equal('\'GET,POST,OPTIONS\'');
            done();
        });
        it('should give allowed methods as string with options set', function (done) {
            var headers = ['GET', 'POST', 'OPTIONS'];
            var headersString = testSubject.getAllowMethodsValue(headers);
            expect(headersString).to.equal('\'GET,POST,OPTIONS\'');
            done();
        });
        it('should give allowed methods as string with no headers set', function (done) {
            var headersString = testSubject.getAllowMethodsValue();
            expect(headersString).to.equal('\'OPTIONS\'');
            done();
        });
    });

    describe('getAllowOriginValue', function () {
        it('should give provided origin', function (done) {
            var origin = 'http://example.com';
            var headersString = testSubject.getAllowOriginValue(origin);
            expect(headersString).to.equal('\'http://example.com\'');
            done();
        });
        it('should give default origin', function (done) {
            var origin = undefined;
            var headersString = testSubject.getAllowOriginValue(origin);
            expect(headersString).to.equal('\'*\'');
            done();
        });
    });

    describe('getAllowHeadersValue', function () {
        it('should give provided headers as string', function (done) {
            var headers = ['x-header-1', 'x-header-2'];
            var headersString = testSubject.getAllowHeadersValue(headers);
            expect(headersString).to.equal('\'x-header-1,x-header-2\'');
            done();
        });
    });

    describe('getExposeHeadersValue', function () {
        it('should give provided headers as string', function (done) {
            var headers = ['x-header-1', 'x-header-2'];
            var headersString = testSubject.getExposeHeadersValue(headers);
            expect(headersString).to.equal('\'x-header-1,x-header-2\'');
            done();
        });
    });

    describe('getMaxAgeValue', function () {
        it('should give provided max age as string', function (done) {
            var maxAge = 123;
            var headersString = testSubject.getMaxAgeValue(maxAge);
            expect(headersString).to.equal('\'123\'');
            done();
        });
    });

    describe('getAllowCredentialsValue', function () {
        it('should give true as string', function (done) {
            var allowCredentials = true;
            var headersString = testSubject.getAllowCredentialsValue(allowCredentials);
            expect(headersString).to.equal('\'true\'');
            done();
        });
        it('should give undefined', function (done) {
            var allowCredentials = 'anything';
            var headersString = testSubject.getAllowCredentialsValue(allowCredentials);
            expect(headersString).to.equal(undefined);
            done();
        });
    });

    describe('getCorsChanges', function () {
        it('should indicate all as changed', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin2',
                allowMethods: ['POST'],
                allowHeaders: ['x-header-2'],
                exposeHeaders: ['x-expose-2'],
                maxAge: 1234,
                allowCredentials: true
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(true);
            expect(changes.hasMethodsChanged).to.equal(true);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate all as changed without old config', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig);
            expect(changes.hasOriginChanged).to.equal(true);
            expect(changes.hasMethodsChanged).to.equal(true);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate origin as changed', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin2',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(true);
            expect(changes.hasMethodsChanged).to.equal(false);
            expect(changes.hasOtherChanges).to.equal(false);
            done();
        });
        it('should indicate methods as changed', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['POST'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(true);
            expect(changes.hasOtherChanges).to.equal(false);
            done();
        });
        it('should indicate other changes as changed (allowHeaders)', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-2'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(false);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate other changes as changed (exposeHeaders)', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-2'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(false);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate other changes as changed (maxAge)', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 1234,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(false);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate other changes as changed (allowCredentials)', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: true
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(false);
            expect(changes.hasOtherChanges).to.equal(true);
            done();
        });
        it('should indicate methods as changed when not in new config', function (done) {
            var newConfig = {
                allowOrigin: 'Origin1',
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var oldConfig = {
                allowOrigin: 'Origin1',
                allowMethods: ['GET'],
                allowHeaders: ['x-header-1'],
                exposeHeaders: ['x-expose-1'],
                maxAge: 123,
                allowCredentials: false
            };
            var changes = testSubject.getCorsChanges(newConfig, oldConfig);
            expect(changes.hasOriginChanged).to.equal(false);
            expect(changes.hasMethodsChanged).to.equal(true);
            expect(changes.hasOtherChanges).to.equal(false);
            done();
        });
    });
});
