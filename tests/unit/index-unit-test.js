'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('Index', function () {
    var commandStub;
    var commandGetParametersStub;
    var createResourceStub;
    var deleteResourceStub;
    var updateResourceStub;

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    beforeEach(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        commandGetParametersStub = sinon.stub();
        createResourceStub = sinon.stub();
        deleteResourceStub = sinon.stub();
        updateResourceStub = sinon.stub();

        commandStub = {
            getParameters: commandGetParametersStub,
            createResource: createResourceStub,
            deleteResource: deleteResourceStub,
            updateResource: updateResourceStub
        };

        mockery.registerMock('./commands/api-resource', commandStub);
    });
    beforeEach(function () {
        commandGetParametersStub.reset().resetBehavior();
        commandGetParametersStub.returns({});
        createResourceStub.reset().resetBehavior();
        createResourceStub.yields();
        deleteResourceStub.reset().resetBehavior();
        deleteResourceStub.yields();
        updateResourceStub.reset().resetBehavior();
        updateResourceStub.yields();
    });

    describe('handler', function () {
        var event, context;
        beforeEach(function () {
            context = {};
            event = {
                ResourceType: 'Custom::ApiResource',
                RequestType: 'Create',
                ResourceProperties: {}
            };
        });

        it('should clean bad properties from logging', function (done) {
            event.ResourceProperties = {
                certificatePrivateKey: 'xyz'
            };
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an('Error');
                expect(createResourceStub.called).to.equal(true);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });

        it('should successfully invoke createResource on a command', function (done) {
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an('Error');
                expect(createResourceStub.called).to.equal(true);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });
        it('should successfully invoke updateResource on a command', function (done) {
            event.RequestType = 'Update';
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an('Error');
                expect(createResourceStub.called).to.equal(false);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(true);
                done();
            });
            testSubject.handler(event, context);
        });
        it('should successfully invoke deleteResource on a command', function (done) {
            event.RequestType = 'Delete';
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an('Error');
                expect(createResourceStub.called).to.equal(false);
                expect(deleteResourceStub.called).to.equal(true);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });

        it('should fail due to invalid command', function (done) {
            event.ResourceType = 'INVALID';
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('FAILED');
                expect(responseData).to.be.an('Error');
                expect(responseData.message).to.contain('Unknown resource type:');
                expect(createResourceStub.called).to.equal(false);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });

        it('should succeed invalid command if RequestType is Delete', function (done) {
            event.ResourceType = 'INVALID';
            event.RequestType = 'Delete';
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an('Error');
                expect(createResourceStub.called).to.equal(false);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });

        it('should fail is command throws an error', function (done) {
            createResourceStub.throws('Error');
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('FAILED');
                expect(responseData).to.be.an('object');
                expect(createResourceStub.called).to.equal(true);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });
        it('should fail is getParameter throws an error', function (done) {
            commandGetParametersStub.throws('Error');
            registerCfnResponseMock(function (_event, _context, responseStatus, responseData, _physicalResourceId) {
                expect(responseStatus).to.equal('FAILED');
                expect(responseData).to.be.an('Error');
                expect(createResourceStub.called).to.equal(false);
                expect(deleteResourceStub.called).to.equal(false);
                expect(updateResourceStub.called).to.equal(false);
                done();
            });
            testSubject.handler(event, context);
        });
    });
});

var cfnResponseStub;
function registerCfnResponseMock(responseFunction) {
    cfnResponseStub = {
        send: responseFunction,
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED'
    };
    mockery.registerMock('./service/util/cfn-response', cfnResponseStub);
    testSubject = require('../../lib/index');

}

