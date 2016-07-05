'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiModelService', function () {
    var getModelStub;
    var createModelStub;
    var deleteModelStub;
    var updateModelStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        getModelStub = sinon.stub();
        createModelStub = sinon.stub();
        deleteModelStub = sinon.stub();
        updateModelStub = sinon.stub();

        var awsSdkStub = {
            APIGateway: function () {
                this.getModel = getModelStub;
                this.createModel = createModelStub;
                this.deleteModel = deleteModelStub;
                this.updateModel = updateModelStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        testSubject = require('../../../../lib/service/api-model/api-model-service');
    });
    beforeEach(function () {
        getModelStub.reset().resetBehavior();
        getModelStub.yields(undefined, {});
        createModelStub.reset().resetBehavior();
        createModelStub.yields(undefined, {});
        deleteModelStub.reset().resetBehavior();
        deleteModelStub.yields(undefined, {});
        updateModelStub.reset().resetBehavior();
        updateModelStub.yields(undefined, {});
    });

    describe('getForResponse', function () {
        it('should get an api model', function (done) {
            testSubject.getForResponse('ModelName', 'RestApiId', function (error, apiModel) {
                expect(error).to.be.undefined;
                expect(apiModel).to.be.an('object');
                done();
            });
        });
        it('should return an error when getting api model', function (done) {
            getModelStub.yields({});
            testSubject.getForResponse('ModelName', 'RestApiId', function (error, apiModel) {
                expect(error).to.be.an.Error;
                expect(apiModel).to.be.undefined;
                done();
            });
        });
    });

    describe('createModel', function () {
        var params;
        beforeEach(function () {
            params = {
                contentType: 'application/json',
                name: 'modelname',
                restApiId: '123',
                description: 'desc',
                schema: {}
            };
        });
        it('should create an api model without description', function (done) {
            testSubject.createModel(params, function (error, apiModel) {
                expect(error).to.be.undefined;
                expect(apiModel).to.be.an('object');
                done();
            });
        });
        it('should create a model with default schema', function (done) {
            delete params.schema;
            testSubject.createModel(params, function (error, apiModel) {
                expect(error).to.be.undefined;
                expect(apiModel).to.be.an('object');
                done();
            });
        });
        it('should return an error when creating api model', function (done) {
            createModelStub.yields({});
            testSubject.createModel(params, function (error, apiModel) {
                expect(error).to.be.an.Error;
                expect(apiModel).to.be.undefined;
                done();
            });
        });
    });

    describe('deleteModel', function () {
        it('should delete an api model', function (done) {
            testSubject.deleteModel('ModelName', 'RestApiId', function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should return an error when delete fails', function (done) {
            deleteModelStub.yields('deleteError');
            testSubject.deleteModel('ModelName','RestApiId', function (error) {
                expect(error).to.equal('deleteError');
                done();
            });
        });
    });

    describe('patchModel', function () {
        it('should patch an api model', function (done) {
            var event = {
                params: { description: 'ModelDesc', schema: { test: "Schema1" } },
                old: { description: 'ModelDesc2', schema: { test: "Schema2" } }
            };
            testSubject.patchModel('ModelName', 'RestApiId', event, function (error) {
                expect(error).to.be.undefined;
                done();
            });
        });
        it('should patch noting', function (done) {
            var event = {
                params: { name: 'ModelName' },
                old: { name: 'ModelName2', description: 'ModelDesc2' }
            };
            testSubject.patchModel('ModelName', 'RestApiId', event, function (error) {
                expect(error).to.be.undefined;
                expect(updateModelStub.called).to.be.false;
                done();
            });
        });
        it('should return error', function (done) {
            var event = {
                params: { description: 'ModelDesc' },
                old: { description: 'ModelDesc2' }
            };
            updateModelStub.yields({ code: 'NotFoundException' });
            testSubject.patchModel('ModelName', 'RestApiId', event, function (error) {
                expect(error.code).to.equal('NotFoundException');
                done();
            });
        });
    });
});
