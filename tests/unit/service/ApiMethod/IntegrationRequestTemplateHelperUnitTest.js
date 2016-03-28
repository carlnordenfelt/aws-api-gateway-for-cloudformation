'use strict';

var chai = require('chai');
var expect = chai.expect;

var testSubject = require('../../../../lib/service/ApiMethod/IntegrationRequestTemplateHelper');

describe('IntegrationRequestTemplateHelper', function () {
    describe('parse', function () {
        it('should give stringify object template and leave string as-is', function (done) {
            var requestTemplates = {
                'application/json': {
                    key: "value"
                },
                'application/xml': "a string \""
            };
            var processedRequestTemplates = testSubject.parse(requestTemplates);
            expect(processedRequestTemplates['application/json']).to.be.a('string');
            expect(processedRequestTemplates['application/json']).to.equal(JSON.stringify(requestTemplates['application/json']));
            expect(processedRequestTemplates['application/xml']).to.be.a('string');
            expect(processedRequestTemplates['application/xml']).to.equal(requestTemplates['application/xml']);
            done();
        });
        it('should give input-passthrough with params only or with full context', function (done) {
            var requestTemplates = {
                'application/json': 'input-pass-through',
                'application/xml': 'input-pass-through-full'
            };
            var processedRequestTemplates = testSubject.parse(requestTemplates);
            expect(processedRequestTemplates['application/json']).to.be.a('string');
            expect(processedRequestTemplates['application/json']).to.equal('#set($allParams = $input.params())\n{\n\t"body-json": $input.json(\'$\'),\n\t"params": {\n\t\t#foreach($type in $allParams.keySet())\n\t\t\t#set($params = $allParams.get($type))\n\t\t\t"$type": {\n\t\t\t\t#foreach($paramName in $params.keySet())\n\t\t\t\t\t"$paramName": "$util.escapeJavaScript($params.get($paramName))"\n\t\t\t\t\t#if($foreach.hasNext),#end\n\t\t\t\t#end\n\t\t\t}\n\t\t\t#if($foreach.hasNext),#end\n\t\t#end\n\t}\n}');
            expect(processedRequestTemplates['application/xml']).to.be.a('string');
            expect(processedRequestTemplates['application/xml']).to.equal('#set($allParams = $input.params())\n{\n\t"body-json": $input.json(\'$\'),\n\t"params": {\n\t\t#foreach($type in $allParams.keySet())\n\t\t\t#set($params = $allParams.get($type))\n\t\t\t"$type": {\n\t\t\t\t#foreach($paramName in $params.keySet())\n\t\t\t\t\t"$paramName": "$util.escapeJavaScript($params.get($paramName))"\n\t\t\t\t\t#if($foreach.hasNext),#end\n\t\t\t\t#end\n\t\t\t}\n\t\t\t#if($foreach.hasNext),#end\n\t\t#end\n\t}\n,\t"stage-variables": {\n\t\t#foreach($key in $stageVariables.keySet())\n\t\t\t"$key": "$util.escapeJavaScript($stageVariables.get($key))"\n\t\t\t#if($foreach.hasNext),#end\n\t\t#end\n\t},\n\t"context": {\n\t\t"account-id": "$context.identity.accountId",\n\t\t"api-id": "$context.apiId",\n\t\t"api-key": "$context.identity.apiKey",\n\t\t"authorizer-principal-id": "$context.authorizer.princialId",\n\t\t"caller": "$context.identity.caller",\n\t\t"cognito-authentication-provider": "$context.identity.cognitoAuthenticationProvider",\n\t\t"cognito-authentication-type": "$context.identity.cognitoAuthenticationType",\n\t\t"cognito-identity-id": "$context.identity.cognitoIdentityId",\n\t\t"cognito-identity-pool-id": "$context.identity.cognitoIdentityPoolId",\n\t\t"http-method": "$context.httpMethod",\n\t\t"stage": "$context.stage",\n\t\t"source-ip": "$context.identity.sourceIp",\n\t\t"user": "$context.identity.user",\n\t\t"user-agent": "$context.identity.userAgent",\n\t\t"user-arn": "$context.identity.userArn",\n\t\t"request-id": "$context.requestId",\n\t\t"resource-id": "$context.resourceId",\n\t\t"resource-path": "$context.resourcePath"\n\t}\n}');
            done();
        });
    });
});