'use strict';

var chai = require('chai');
var expect = chai.expect;
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

        mockery.registerMock('./commands/validCommand', commandStub);
    });
    beforeEach(function () {
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
                ResourceType: 'Custom::validCommand',
                ResourceProperties: {}
            }
        });

        it('should clean bad properties from logging', function (done) {
            event.RequestType = 'Create';
            event.ResourceProperties = {
                certificatePrivateKey: 'xyz'
            };
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an.Error;
                expect(createResourceStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
            testSubject.handler(event, context);
        });

        it('should successfully invoke createResource on a command', function (done) {
            event.RequestType = 'Create';
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an.Error;
                expect(createResourceStub.called).to.be.true;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
            testSubject.handler(event, context);
        });
        it('should successfully invoke updateResource on a command', function (done) {
            event.RequestType = 'Update';
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an.Error;
                expect(createResourceStub.called).to.be.false;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.true;
                done();
            });
            testSubject.handler(event, context);
        });
        it('should successfully invoke deleteResource on a command', function (done) {
            event.RequestType = 'Delete';
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an.Error;
                expect(createResourceStub.called).to.be.false;
                expect(deleteResourceStub.called).to.be.true;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
            testSubject.handler(event, context);
        });

        it('should fail if getParameters returns an error', function (done) {
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('FAILED');
                expect(responseData).to.be.an.Error;
                expect(responseData.message).to.equal('Validation error');
                expect(createResourceStub.called).to.be.false;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
            commandGetParametersStub.returns(new Error('Validation error'));
            testSubject.handler(event, context);
        });

        it('should fail due to invalid command', function (done) {
            event.ResourceType = 'INVALID';
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('FAILED');
                expect(responseData).to.be.an.Error;
                expect(responseData.message).to.contain('Unknown resource type:');
                expect(createResourceStub.called).to.be.false;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.false;
                done();
            });
            testSubject.handler(event, context);
        });

        it('should succeed invalid command if RequestType is Delete', function (done) {
            event.ResourceType = 'INVALID';
            event.RequestType = 'Delete';
            registerCfnResponseMock(function (event, context, responseStatus, responseData, physicalResourceId) {
                expect(responseStatus).to.equal('SUCCESS');
                expect(responseData).not.to.be.an.Error;
                expect(createResourceStub.called).to.be.false;
                expect(deleteResourceStub.called).to.be.false;
                expect(updateResourceStub.called).to.be.false;
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

