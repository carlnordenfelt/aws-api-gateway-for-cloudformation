#API Gateway for CloudFormation
API Gateway for CloudFormation is a set of Custom Resources that allows you to manage your API Gateway setup
with CloudFormation. Yes, you read that right! Finally a way to integrate your backend services that you already create using CloudFormation with your APIs!

It's deployed via the CloudFormation Console and runs on AWS Lambda.

The project is inspired by [AWS Labs API Gateway Swagger Importer](https://github.com/awslabs/aws-apigateway-importer) so you will see a lot of familiar syntax in the setup.

[![Build Status](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation.svg?branch=master)](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation)
[![Coverage Status](https://coveralls.io/repos/github/carlnordenfelt/aws-api-gateway-for-cloudformation/badge.svg?branch=master)](https://coveralls.io/github/carlnordenfelt/aws-api-gateway-for-cloudformation?branch=master)

##Contents
1. <a href="#a-note-on-terminology-before-we-begin">A note on terminology before we begin</a>
1. <a href="#setup">Setup</a>
1. <a href="#usage">Usage</a>
    1. <a href="#overview">Overview</a>
    1. <a href="#create-an-api">Create an API</a>
    1. <a href="#create-an-api-resource">Create an API Resource</a>
    1. <a href="#create-an-api-method">Create an API Method</a>
    1. <a href="#create-a-model">Create a Model</a>
    1. <a href="#create-a-domain-name">Create a Domain Name</a>
    1. <a href="#create-a-base-path-mapping">Create a Base Path Mapping</a>
    1. <a href="#create-an-authorizer">Create an Authorizer</a>
1. <a href="#change-log">Change log</a>
1. <a href="#contribute">Contribute</a>

##A note on terminology before we begin
Throughout this document there are references to *resources* and *API Resources*.
It is very important to distinguish between the two:

* A *resource* is a CloudFormation term and can refer to any AWS resource.
* An *API Resource* is a specific type of AWS resource (Custom::ApiResource) which is called "Resource" in API Gateway.

##Setup
###Prerequisites
* You need an [Amazon AWS Account](http://aws.amazon.com).
* You need an IAM user with access/secret key, see required permissions below.
* You have to install & configure the [AWS-CLI](http://docs.aws.amazon.com/cli/latest/userguide)

####Setup IAM permissions
To be able to install the Custom Resource library you require a set of permissions.
Configure your IAM user with the following policy and make sure that you have configured your aws-cli with access and secret key. 

**Note:** This Role contains delete permissions. If you do not want to give these permissions you can omit the last 6 permissions in the policy. If you do so, you won't be able to delete the installation.

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "cloudformation:CreateStack",
                    "cloudformation:DescribeStacks",
                    "iam:CreateRole",
                    "iam:CreatePolicy",
                    "iam:AttachRolePolicy",
                    "iam:GetRole",
                    "iam:PassRole",
                    "lambda:CreateFunction",
                    "lambda:UpdateFunctionCode",
                    "lambda:GetFunctionConfiguration",
                    
                    "cloudformation:DeleteStack",
                    "lambda:DeleteFunction",
                    "iam:ListPolicyVersions",
                    "iam:DetachRolePolicy",
                    "iam:DeletePolicy",
                    "iam:DeleteRole"
                ],
                "Resource": [
                    "*"
                ]
            }
        ]
    }

###Install

1. Pick which version you want from the <a href="#change-log">Change log</a>. The latest is usually the one you want.
1. Copy the template link that corresponds to the region you want to deploy your Lambda in (all Lambda supported regions are available).
1. Open your AWS CloudFormation Console and choose "Create stack".
1. Select "Specify an Amazon S3 template URL" and paste the template link.
1. Select the Lambda memory allocation and execution timeout. The defaults should suffice.
1. Approve the IAM resource creation and create the stack.

###Update
Follow the steps above but instead of creating a new stack you update your existing stack. Note that you need to change the template URL when updating.

###Uninstall
Simply delete the stack from your AWS CloudFormation Console. Don't forget to revoke any unecessary IAM permissions you may have added during setup.

#Usage   

##Overview
This setup allows you to manage the majority of the API Gateway related resources. Below you'll find exhaustive (hopefully) documentation on how to use each resource type.

Note that some resources may be flagged as experimental which means that they haven't been tested thoroughly, it doesn't necessarily mean that they don't work.

That said, on to what you can do.

##Create an API

Creates a new API Gateway REST API
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createRestApi-property

**Note:** API cloning. is not supported. This is intentional.

###Type
Custom:RestApi

###Parameters
**name:**
Name of the REST API.

* Required: *yes*
* Type: String
* Update: No interruption

**description:**
An optional description of your REST API.

* Required: no
* Type: String
* Update: No interruption, partial. You may add/change this property but not remove it. 

###CloudFormation example
    "TestRestApi" : {
        "Type" : "Custom::RestApi",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "name": "Test API",
            "description": "This is a test API"
        }
    }

Outputs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createRestApi-property
In addition the parent resource id is also returned in the response:

    Fn::GetAtt: ["TestRestApi", "parentResourceId"]

##Create an API Resource

Creates a new API Resource in an existing API
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createResource-property

**Note:** If you delete an API Resource from your CloudFormation template, all child resources are deleted by API Gateway.
This may create certain data inconsistencies between the actual API and what is believed to be setup from the Custom Resource perspective. It's therefore recommend to remove any child resources associated with the API Resource you delete.

###Type
Custom:ApiResource

###Parameters
**restApiId:**
Reference to the REST API in which you want to create this API Resource.

* Required: *yes*
* Type: String
* Update: Not supported

**parentId** 
Id of the parent API Resource under which you want to place this API Resource. If you are creating a top level resource, use the parentResourceId output from Custom::RestApi.

* Required: *yes*
* Type: String
* Update: No interruption, partial. You may add/change this property but not remove it. 

**pathPart** 
The path suffix of this API Resource, appended to the full path of the parent API Resource.

* Required: *yes*
* Type: String
* Update: No interruption, partial. You may add/change this property but not remove it. 

**corsConfiguration**
If you supply cors configuration this API Resource will enable CORS requests.
For more information on CORS, please refer to http://www.w3.org/TR/cors/.
Changes made to the CORS configuraiton will have direct impact on the methods you list (or remove) in the CORS config.
It will also create an OPTIONS method for you.

* Required: no
* Type: Object
* Update: No interruption

**corsConfiguration.allowMethods**
A list of HTTP methods that allow CORS requests under this API Resource or a wildcard string "*" which will allow all methods.
 
* Required: *yes*
* Type: String array or String "*"
* Update: No interruption

**corsConfiguration.allowHeaders**
List of headers that the server allows the user-agent to send in requests.
If this property is not set it will default to the headers that Amazon recommends: Content-Type,X-Amz-Date,Authorization,X-Api-Key.
If it is set it will override the default headers and exclude them. See *corsConfiguration.allowDefaultHeaders* for further details.
 
* Required: no
* Type: String array
* Update: No interruption

**corsConfiguration.allowDefaultHeaders**
If you set *corsConfiguration.allowHeaders* and still want to include the default set of headers you can set this property
to true and the default headers will be appended to the headers you specified in *corsConfiguration.allowHeaders*
The default headers are: Content-Type,X-Amz-Date,Authorization,X-Api-Key.

* Required: no
* Type: Boolean
* Update: No interruption

**corsConfiguration.allowOrigin**
Origin from which CORS requests are allowed. If you omit it the origin will be set to * which means that any origin is allowed to call the Resource.

* Required: no, default is *
* Type: Object
* Update: No interruption

**corsConfiguration.exposeHeaders**
A list of headers that are exposed to the client in the response, if present.

* Required: no, default is none
* Type: String array
* Update: No interruption

**corsConfiguration.maxAge**
Max age in seconds that a pre-flight check (OPTIONS) should be cached on the client.
If not supplied, the time that pre-flight requests are stored is at the discretion of the user agent.

* Required: no
* Type: Integer
* Update: No interruption

**corsConfiguration.allowCredentials**
Sets the Access-Control-Allow-Credentials header to true if this configuration is set to true.

* Required: no, default value is false
* Type: Boolean
* Update: No interruption

###CloudFormation example
    "TestApiResource" : {
        "Type" : "Custom::ApiResource",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "restApiId": "xyz123",
            "parentId": "abc456",
            "pathPart": "test",
            "corsConfiguration": {
                "allowMethods": ["GET", "POST"],
                "allowHeaders": ["x-my-header", "some-other-header"],
                "allowDefaultHeaders": true,
                "allowOrigin": "http://example.com",
                "exposeHeaders": ["some-header", "x-another-header"],
                "maxAge": 1800,
                "allowCredentials": true
             }
        }
    }

Outputs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createResource-property

##Create an API Method

Creates a new Api Gateway Method including response, request and integration.
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#putMethod-property

###Type
Custom:ApiMethod

###Parameters
**restApiId:**
Reference id to the Rest API.

* Required: *yes*
* Type: String
* Update: Not supported

**resourceId** 
Id of the API Resource on which the API Method should be applied.

* Required: *yes*
* Type: String
* Update: No interruption

**method**
Method configuration container.

* Required: *yes*
* Type: Object
* Update: Child properties may be changed according to documentation.

**method.httpMethod**
The HTTP verb that this method adheres to. E.g POST, GET etc.

* Required: *yes*
* Type: String
* Update: No interruption

**method.authorizationType**
API Method authorization type.
Set to CUSTOM if you want to use an <a href="#create-an-authorizer">API Authorizer</a>.

* Required: no, default is NONE
* Type: String
* Update: No interruption

**method.authorizerId**
Authorizer Id if method.authorizationType is set to CUSTOM

* Required: no
* Type: String
* Update: No interruption

**method.apiKeyRequired**
Set to true if this API Method requires an API Key.

* Required: no, default is false
* Type: Boolean
* Update: No interruption

**method.requestModels**
Specifies the Model resources used for the request's content type. 
Request models are represented as a key/value map, with a content type as the key and a Model name as the value.

* Required: no
* Type: Map<String{content-type},String{model-name}>
* Update: No interruption

**method.parameters**
Represents request parameters that are sent with the backend request. 
Request parameters are represented as a string array of parameter destinations. 
The destination must match the pattern {location}.{name}, where location is either querystring, 
path, or header. name must be a valid, unique parameter name.

* Required: no
* Type: String Array
* Update: No interruption

**integration**
Backend integration configuration
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#putIntegration-property

* Required: *yes*
* Type: Object, *required*
* Update: Not available

**integration.type**
Backend type

* Required: *yes*
* Type: String
* Update: No interruption

**integration.credentials**
AWS credentials used to invoke the (AWS) backend.

* Required: no
* Type: String
* Update: No interruption

**integration.cacheNamespace**
Integration input cache namespace

* Required: no
* Type: String
* Update: No interruption

**integration.cacheKeyParameters**
Integration input cache keys

* Required: no
* Type: String array
* Update: No interruption

**integration.httpMethod**
HTTP method of the backend integration request.

* Required: conditional, must be set if *integration.type* is not set to MOCK.
* Type: String
* Update: No Interruption

**integration.requestTemplates**
Specifies the templates used to transform the method request body. 
Request templates are represented as a key/value map, with a content-type as the key and a template as the value.

For simple mapping the template can be expressed as a JSON object.
More complex templates can be expressed as a string.

*Introduced in version 1.4.0*
From version 1.4.0 you can specify the literal string 'input-pass-through' or 'input-pass-through-full' as the value
for your request templates. 'input-pass-through' will give you the request body (if present) and path, query and header parameters.
'input-pass-through-full' will give you all of the above but also includes all stageVariables and everything available in $context.
See http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html for more information.

*Addendum in version 1.4.1*
From version 1.4.1 you may specify input-pass-through as an array where the first position is the literal string 'input-pass-through' or 'input-pass-through-full'
and the second position is a custom JSON object or valid JSON string that you want to append to the backend request.
A common use case is when you want to inject configuration from your CFN template in your backend requests.
This JSON object is appended to the pass through request as the value of the key "custom".

*An example of a full pass through request as it is sent to the backend:*

    {
        "body-json": {},
        "params": {
            "path": {
                "myPathParam": "..."
            },
            "querystring": {
                "myQueryParam": "..."
            },
            "header": {
                "myHeaderParam": "..."
            }
        },
        "custom": {
            "myCustom": "configVariable"
        },
        "stage-variables": {
            "myStageVar": "...",
        },
        "context": {
            "account-id": "$context.identity.accountId",
            "api-id": "$context.apiId",
            "api-key": "$context.identity.apiKey",
            "authorizer-principal-id": "$context.authorizer.princialId",
            "caller": "$context.identity.caller",
            "cognito-authentication-provider": "$context.identity.cognitoAuthenticationProvider",
            "cognito-authentication-type": "$context.identity.cognitoAuthenticationType",
            "cognito-identity-id": "$context.identity.cognitoIdentityId",
            "cognito-identity-pool-id": "$context.identity.cognitoIdentityPoolId",
            "http-method": "$context.httpMethod",
            "stage": "$context.stage",
            "source-ip": "$context.identity.sourceIp",
            "user": "$context.identity.user",
            "user-agent": "$context.identity.userAgent",
            "user-arn": "$context.identity.userArn",
            "request-id": "$context.requestId",
            "resource-id": "$context.resourceId",
            "resource-path": "$context.resourcePath
        }
    }

* Required: no
* Type: 
    * Map[String{content-type},String{template}] or
    * Map[String{content-type},Object{template}] or 
    * String 'input-pass-through|input-pass-through-full' or
    * Array where the first position is String 'input-pass-through|input-pass-through-full' and the second is a custom JSON object or valid JSON string that is appended to the backend request.
* Update: No interruption

**integration.requestParameters**: 
Represents request parameters that are sent with the backend request. 
Request parameters are represented as a key/value map, with a destination as the key and a source as the value. 
A source must match an existing method request parameter, or a static value. 
Static values must be enclosed with single quotes, and be pre-encoded based on their destination in the request. 
The destination must match the pattern integration.request.{location}.{name}, where location is either querystring, 
path, or header. name must be a valid, unique parameter name.

* Required: no
* Type: Map<String{destination},String{source}>
* Update: No interruption

**integration.uri**
URI to the backend service. Can be a url to another service, a Lambda ARN etc.

* Required: conditional, must be set if *integration.type* is not set to MOCK.
* Type: String
* Update: No interruption

**responses** 
Configurations for both the IntegrationResponses and the MethodResponses.
The key is the selection pattern used to map the response to a status code.
There should be one selection pattern with the value "default" which acts as the default response.
The value is a response configuration object.

http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#putIntegrationResponse-property
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#putMethodResponse-property

* Required: no
* Type: Map{String,Object}
* Update: Not available 

**response.statusCode**
The HTTP Status Code that this response configuration maps to.
Must be unique within the scope of each API Method definition.

* Required: *yes*
* Type: Integer
* Update: No interruptions

**response.headers** 
Map of headers where the key is the header name and value is the source, or static value of the header.
Static values are specified using enclosing single quotes, and backend response headers can be read 
using the pattern integration.response.header.{name}.
CORS headers should not be specified as they are added automatically.

Note that the key should only be the name of the header that will be exposed to the client.

* Required: no,
* Type Map{String,String}
* Update: No interruptions

**response.responseTemplates** 
Specifies the templates used to transform the integration response body. 
Response templates are represented as a key/value map, with a content-type as the key and a template as the value.
The template can be represented as a JSON string or a JSON object.
A template represented by an empty string is the equivalent of output pass-through.

**Note:** If no responseTemplates are provided a default pass-through template is created for application/json.

* Required: no
* Type: Map{String,String} or Map{String,Object}
* Update: No interruptions

**response.responseModels** 
Specifies the Model resources used for the response's content type. 
Response models are represented as a key/value map, with a content type as the key and a Model name as the value.

* Required: no
* Type: Map<String{content-type},String{model-name}>
* Update: No interruption

###CloudFormation example:
    "TestApiMethod" : {
        "Type" : "Custom::ApiMethod",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "restApiId": "q1w2e3r4t5y6",
            "resourceId": "Resource Id",
            "method": {
                "authorizationType": "NONE",
                "httpMethod": "GET",
                "apiKeyRequired": "true",
                "requestModels": {
                    "application/json": { "Fn::GetAtt": ["TestModel", "name"] }
                },
                "parameters": [
                    "querystring.sortBy",
                    "header.x-test-header",
                    "path.entityType"
                ]
            },
            "integration": {
                "type": "MOCK",
                "requestTemplates": {
                    "application/json": "{\"statusCode\": 200}"
                },
                "requestParameters": {
                    "integration.request.querystring.sortBy": "'hardcodedValue'"
                }
            },
            "responses": {
                "default": {
                    "statusCode": "200",
                    "headers": {
                        "X-Custom-Header": "'hardcodedValue'"
                    }
                },
                ".*NotFound.*": {
                    "statusCode": "404"
                }
            }
        }
    }

Outputs:
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#putMethod-property

##Create a Model

Creates a new Api Gateway Model
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createModel-property

###Type
Custom:ApiModel

###Parameters
**restApiId:**
Reference id to the Rest API.

* Required: *yes*
* Type: String
* Update: Not supported

**name:**
Name of the model

* Required: *yes*
* Type: String
* Update: Not supported 

**contentType:**
The content-type for the model.

* Required: no, default is application/json
* Type: String
* Update: Not supported

**description:**
Description of the model.

* Required: no, default is an empty string
* Type: String
* Update: No interruption

**schema:**
The model schema. This can be represented by either a JSON object or a valid JSON string. 

* Required: no, default is an empty object
* Type: String or object
* Update: No interruption

###Outputs
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createModel-property

###CloudFormation example
    "TestApiModel" : {
        "Type" : "Custom::ApiModel",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "restApiId": "xyz123",
            "name": "TestModelName",
            "contentType": "application/json",
            "description": "This is my model",
            "schema": "..."
        }
    }

##Create a Domain Name

Creates a new Api Gateway Domain Name
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createDomainName-property

Once the domain name has been created you have to create a Route53 alias record that points to 
{ "Fn::GetAtt": ["TestApiDomainName", "distributionDomainName"] }

###Type
Custom:ApiDomainName

###Parameters
**domainName:**
The name of the DomainName resource.

* Required: *yes*
* Type: String
* Update: Not supported

**certificateName:**
The name of the certificate.

* Required: *yes*
* Type: String
* Update: Not supported

**iamServerCertificateName:**
A name reference to an existing certificate that ahs already been uploaded to IAM.

* Required: *conditional*, you have to specify the iamServerCertificateName or the certificateBody and certificateChain
* Type: String
* Update: Not supported

**certificateBody:**
The body of the server certificate provided by your certificate authority.
You can provide it in two different of formats:
* As a single line where " " (space) denotes a new line (header/footer are excepted). E.g: -----BEGIN CERT-----line1 line2 ... -----END CERT-----
* As a single line where "\n" denotes a new line. E.g: -----BEGIN CERT-----line1\nline2\n...\n-----END CERT-----

* Required: *conditional*, you have to specify the the certificateBody and certificateChain or an iamServerCertificateName
* Type: String
* Update: Not supported

**certificatePrivateKey:**
Your certificate's private key.
* As a single line where " " (space) denotes a new line (header/footer are excepted). E.g: -----BEGIN RSA PRIVATE KEY-----line1 line2 ... -----END RSA PRIVATE KEY-----
* As a single line where "\n" denotes a new line. E.g: -----BEGIN RSA PRIVATE KEY-----line1\nline2\n...\n-----END RSA PRIVATE KEY-----

* Required: *conditional*, you have to specify the the certificateBody and certificateChain or an iamServerCertificateName
* Type: String
* Update: Not supported

**certificateChain:**
The certificate chain provided by your certificate authority.
You can provide it in two different of formats:
* As a single line where " " (space) denotes a new line (header/footer are excepted). E.g: -----BEGIN CERTIFICATE-----line1 line2 ... -----END CERTIFICATE-----
* As a single line where "\n" denotes a new line. E.g: -----BEGIN CERTIFICATE-----line1\nline2\n...\n-----END CERTIFICATE-----

* Required: *yes*
* Type: String
* Update: Not supported

###Outputs
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createDomainName-property

###CloudFormation example
    "TestApiDomainName" : {
        "Type" : "Custom::ApiDomainName",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "domainName": "example.com",
            "certificateName": "testCertificate",
            "certificateBody": "-----BEGIN CERTIFICATE-----line1 line2 ... -----END CERTIFICATE-----",
            "certificateChain": "-----BEGIN CERTIFICATE-----line1 line2 ... -----END CERTIFICATE-----",
            "certificatePrivateKey": "-----BEGIN RSA PRIVATE KEY-----line1 line2 ... -----END RSA PRIVATE KEY-----"
        }
    }

##Create a Base Path Mapping

Creates a new Api Gateway Base Path Mapping
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createBasePathMapping-property

**Note:** When you create an ApiBasePathMapping your API will be automatically deployed to the stage you've provided.
If the stage does not exist it will be created for you. However, if you delete the ApiBasePathMapping the stage will 
not be deleted and your API will remain deployed at the given stage.

**Note:** Since creating a BasePathMapping will automatically deploy your API you have to ensure that it DependsOn all methods created in the API.

###Type
Custom:ApiBasePathMapping

###Parameters
**domainName:**
The domain name of the BasePathMapping resource to create.

* Required: *yes*
* Type: String
* Update: Not supported

**restApiId:**
Reference to the REST API in which you want to create this API Base Path Mapping.

* Required: *yes*
* Type: String
* Update: No interruption

**basePath:**
The base path name that callers of the API must provide as part of the URL after the domain name. 
This value must be unique for all of the mappings across a single API. 
Exclude this if you do not want callers to specify a base path name after the domain name.

* *Note:* The basePath replaces the stage name the ApiBasePathMapping is connected to, even if you leave it empty.
* *Note:* If you exclude this parameter, or leave it empty, you can only create one base path mapping for the given Rest API.

* Required: no, default is empty string
* Type: String
* Update: No interruption

**stage:**
The name of the API stage that you want to use for this mapping. 

* Required: *yes*
* Type: String
* Update: No interruption

###Outputs
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createBasePathMapping-property

###CloudFormation example
    "TestApiBasePathMapping" : {
        "Type" : "Custom::ApiBasePathMapping",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "restApiId": "xyz123",
            "domainName": "example.com",
            "basePath": "test",
            "stage": "beta"
        }
    }

##Create an Authorizer

**This resource is experimental**

Creates a new Api Gateway Authorizer
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createAuthorizer-property

###Type
Custom:ApiAuthorizer

###Parameters
**authorizerUri:**
Authorizer Api Gateway Lambda function invocation ARN.
Example: arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:1234:function:LambdaName/invocations

* Required: *yes*
* Type: String
* Update: No interruption

**identitySource:**
Source header from where the token can be read.
Must match the regexp 'method.request.header.[a-zA-Z0-9._-]+'

* Required: *yes*
* Type: String
* Update: No interruption

**name:**
The base path name that callers of the API must provide as part of the URL after the domain name. 
This value must be unique for all of the mappings across a single API. 
Exclude this if you do not want callers to specify a base path name after the domain name.

* Required: *yes*
* Type: String
* Update: No interruption

**restApiId:**
The domain name of the BasePathMapping resource to create.

* Required: *yes*
* Type: String
* Update: Not supported

**authorizerCredentials:**
IAM role that API Gateway will use to invoke the Lambda function.

* Required: *yes*
* Type: String
* Update: No interruption

**authorizerResultTtlInSeconds:**
The TTL of cached authorizer results.

* Required: no, default is 300
* Type: Integer
* Update: No interruption

**identityValidationExpression:**
Optional RegEx statement for API Gateway to validate the input token before calling the custom authorizer Lambda function.
This helps you avoid or reduce the chances of being charged for processing invalid tokens.

* Required: no
* Type: String
* Update: No interruption

###Outputs
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createAuthorizer-property

###CloudFormation example
    "TestAuthorizer" : {
        "Type" : "Custom::ApiAuthorizer",
        "Properties" : {
            "ServiceToken": "{Lambda_Function_ARN}",
            "restApiId": "xyz123",
            "authorizerUri": "{Authorizer_Lambda_ARN}",
            "identitySource": "x-auth-header",
            "name": "TestAuthorizer",
            "authorizerCredentials": "beta",
            "authorizerResultTtlInSeconds": 3600,
            "identityValidationExpression": "$[a-z]*"
        }
    }

#Change Log

## 1.4.1 (2016-03-29)
* New: Added custom configuration object to be passed along with input-pass-through request templates
* Fix: Changed default Lambda timeout to 30 seconds from previous 10
* Clean up: Parameter validation throws errors rather than returning them

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-central-1.s3.amazonaws.com/1.4.1/ApiGatewayCloudFormation.template">eu-central-1</a>
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.4.1/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.4.1/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.us-west-2.s3.amazonaws.com/1.4.1/ApiGatewayCloudFormation.template">us-west-2</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.4.1/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.4.0 (2016-03-24)
* New: Introducing ready-made pass-through templates for method integration request templates. @See <a href="#create-an-api-method">Create an API Method</a>
* Fix: Improved CloudFormation error messages to give a direct indication to what went wrong in the AWS Console

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-central-1.s3.amazonaws.com/1.4.0/ApiGatewayCloudFormation.template">eu-central-1</a>
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.4.0/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.4.0/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.us-west-2.s3.amazonaws.com/1.4.0/ApiGatewayCloudFormation.template">us-west-2</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.4.0/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.3.4 (2016-03-22)
* New: Allow CORS wildcard methods

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-central-1.s3.amazonaws.com/1.3.4/ApiGatewayCloudFormation.template">eu-central-1</a>
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.3.4/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.3.4/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.us-west-2.s3.amazonaws.com/1.3.4/ApiGatewayCloudFormation.template">us-west-2</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.3.4/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.3.3 (2016-03-18)
* New: Added support for eu-central-1

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-central-1.s3.amazonaws.com/1.3.3/ApiGatewayCloudFormation.template">eu-central-1</a>
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.3.3/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.3.3/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.us-west-2.s3.amazonaws.com/1.3.3/ApiGatewayCloudFormation.template">us-west-2</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.3.3/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.3.2 (2016-03-18)
* Fix: Moved support from us-west-1 to us-west-2

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.3.2/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.3.2/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.us-west-2.s3.amazonaws.com/1.3.2/ApiGatewayCloudFormation.template">us-west-2</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.3.2/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.3.1 (2016-03-17)
* Fix: TooManyRequestsException not caught properly

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.3.1/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.3.1/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.3.1/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.3.0 (2016-03-17)
* New: Allow Api Domain name creation by specifying an IAM Server Certificate Name instead of the certificateBody & certificateChain.

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.3.0/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.3.0/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.3.0/ApiGatewayCloudFormation.template">ap-northeast-1</a>


## 1.2.1 (2016-03-14)
* Fix: Allow deletion of Api Resources that failed to create.

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.2.1/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.2.1/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.2.1/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.2.0 (2016-03-13)
* New deploy procedure via CFN insteadof bash/powershell
* Improved error logging when AWS calls fails
* API BasePathMappings and Custom Domain Names

**Regional Templates** 
* <a href="http://apigatewaycloudformation.eu-west-1.s3.amazonaws.com/1.2.0/ApiGatewayCloudFormation.template">eu-west-1</a>
* <a href="http://apigatewaycloudformation.us-east-1.s3.amazonaws.com/1.2.0/ApiGatewayCloudFormation.template">us-east-1</a>
* <a href="http://apigatewaycloudformation.ap-northeast-1.s3.amazonaws.com/1.2.0/ApiGatewayCloudFormation.template">ap-northeast-1</a>

## 1.1.6 (2016-02-26)
**Note:** This version is no longer supported

* Added error logging to deploy script.

## 1.1.4 (2016-02-21)
**Note:** This version is no longer supported

* Added installation scripts for windows (powershell).

## 1.1.3 (2016-02-21)
**Note:** This version is no longer supported

* Added installation scripts for unix that do not require npm or node to be installed.

## 1.1.0 (2016-02-19)
**Note:** This version is no longer supported

* Introduced installation package so that you no longer have to clone the repo to install and deploy.

## 1.0.4 (2016-02-18)
**Note:** This version is no longer supported

* Introducing API Authorizers (http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html)

## 1.0.2 (2016-02-18)
**Note:** This version is no longer supported

* Fix: Ensure that moving an API Method to another resource cleans up the old method.

## 1.0.1 (2016-02-17)
**Note:** This version is no longer supported

* Added backoff and retries if failure due to concurrent modifications. <a href="https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation/pull/5">PR #5</a>
* Rewrote installation and deploy scripts in nodejs and npm.
* Removed Dynamo table for tracking resources, now tracked via the PhysicalResourceId. <a href="https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation/pull/4">PR #4</a>
* No longer validating parameters on delete. <a href="https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation/pull/3">PR #3</a>
* Improved the README
* Added sample template for testing
* Installation packages and installation template is hosted on S3.

**Update notes**
If you are updating from 0.0.1 you have to delete all your APIs and your existing installation of Api Gateway for CloudFormation.
This update is not backward compatible.

## 0.0.1 (2016-01-04)
**Note:** This version is no longer supported

* Initial release

#Contribute
I gladly accepts PRs, issues and comments. Anything that will help improve stability, reduce complexity or add more 
functionality is appreciated. Please make sure that npm test does not fail before you push your PR. 
There are strict requirements on es-lint and 100% unit test coverage for builds to succeed before they can be published.

##Testing
I highly recommend that you deploy your changes and test them "live" before submitting the PR.
To package and deploy your changes manually, follow these steps:

    npm install --production
    zip -r source.zip lib/* lib/*/** node_modules/*/**

Go to the AWS Console -> Lambda -> {Your API Gateway function} -> Code -> Upload a .ZIP file (select source.zip)


 
