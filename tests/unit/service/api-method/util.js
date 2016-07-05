'use strict';

module.exports = {
    event: {
        ResourceProperties: {
            restApiId: 'RestApiId',
            resourceId: 'ResourceId',
            lastModified: "123",
            method: {
                httpMethod: 'GET',
                authorizationType: 'AWS_IAM',
                authorizerId: 'authorizerIdValue',
                apiKeyRequired: 'true',
                requestModels: {
                    'application/json': 'ModelName'
                },
                parameters: [
                    'header.test',
                    'path.test',
                    'querystring.test'
                ]
            },
            integration: {
                type: 'AWS',
                credentials: 'credentialsValue',
                cacheNamespace: 'cacheNamespaceValue',
                cacheKeyParameters: ['cacheKeyParameters1'],
                httpMethod: 'POST',
                uri: 'integration.uri',
                passthroughBehavior: 'WHEN_NO_MATCH',
                requestTemplates: {
                    'application/json': {},
                    'application/xml': ''
                },
                requestParameters: {
                    "integration.request.querystring.x": "'value'",
                    "integration.request.header.y": "'value'",
                    "integration.request.path.z": "'value'"
                }
            },
            responses: {
                'default': {
                    statusCode: "200",
                    headers: {
                        "x-static-header": "'test'",
                        "x-dynamic-header": "integration.response.header.xyz",
                        "x-dynamic-body-header": "integration.response.body.xyz"
                    },
                    responseTemplates: {
                        'application/json': {},
                        'application/xml': ''
                    },
                    responseModels: {
                        'application/json': 'ModelName'
                    }
                },
                selectionPattern1: {
                    statusCode: "400"
                },
                selectionPattern2: {
                    statusCode: "500"
                }
            }
        }
    }
};
