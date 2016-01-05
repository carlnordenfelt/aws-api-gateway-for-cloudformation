'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('CloudFormationResourceTracker', function () {
    var getItemStub;
    var putItemStub;
    var deleteItemStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getItemStub = sinon.stub();
        putItemStub = sinon.stub();
        deleteItemStub = sinon.stub();

        var awsSdkStub = {
            DynamoDB: function () {
                this.getItem = getItemStub;
                this.putItem = putItemStub;
                this.deleteItem = deleteItemStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../lib/service/CloudFormationResourceTracker.js');
    });
    beforeEach(function () {
        getItemStub.reset().resetBehavior();
        getItemStub.yields(undefined, { Item: {
                StackId: { S: 'StackId' },
                CloudFormationIdentifier: { S: 'CloudFormationIdentifier' },
                Type: { S: 'Type' },
                resourceIdentifier: { S: 'resourceIdentifier' }
        }});
        putItemStub.reset().resetBehavior();
        putItemStub.yields(undefined);
        deleteItemStub.reset().resetBehavior();
        deleteItemStub.yields(undefined);
    });

    describe('get', function () {
        it('should get a resource from dynamo', function (done) {
            testSubject.get({}, {}, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                done();
            });
        });
        it('should return nothing if item is not found in dynamo', function (done) {
            getItemStub.yields(undefined, {});
            testSubject.get({}, {}, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.undefined;
                done();
            });
        });
        it('should fail if dynamo fails', function (done) {
            getItemStub.yields('dynamoError');
            testSubject.get({}, {}, function (error, resource) {
                expect(error).to.equal('dynamoError');
                expect(resource).to.be.undefined;
                done();
            });
        });
    });

    describe('put', function () {
        it('should put a resource to dynamo', function (done) {
            testSubject.put({}, {}, 'ResourceIdentifier', function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should fail if dynamo fails', function (done) {
            putItemStub.yields('dynamoError');
            testSubject.put({}, {}, 'ResourceIdentifier', function (error) {
                expect(error).to.equal('dynamoError');
                done();
            });
        });
    });

    describe('delete', function () {
        it('should delete a resource from dynamo', function (done) {
            testSubject.delete({}, {}, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should fail if dynamo fails', function (done) {
            deleteItemStub.yields('dynamoError');
            testSubject.delete({}, {}, function (error) {
                expect(error).to.equal('dynamoError');
                done();
            });
        });
    });
});