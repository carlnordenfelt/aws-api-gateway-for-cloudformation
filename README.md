**Important Notice!**
If you installed this prior to February 17 2016 you have to uninstall everything, including any APIs created using 
these resources, before you upgrade. There has been a lot of changes made and they are not backward compatible!

#API Gateway for CloudFormation
API Gateway for CloudFormation is a set of Custom Resources that allows you to manage your API Gateway setup
with CloudFormation. It is deployed with CloudFormation and runs on AWS Lambda.

The project is inspired by [AWS Labs API Gateway Swagger Importer](https://github.com/awslabs/aws-apigateway-importer) so you will see a lot of familiar syntax in the setup.

[![Build Status](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation.svg?branch=master)](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation)

##Contents
1. <a href="#a-note-on-terminology-before-we-begin">A note on terminology before we begin</a>
1. <a href="#installation">Installation</a>
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
1. <a href="#todo">TODO</a>
1. <a href="#contribute">Contribute</a>

##A note on terminology before we begin
Throughout this document there are references to *resources* and *API Resources*.
It is very important to distinguish between the two:

* A *resource* is a CloudFormation term and can refer to any AWS resource.
* An *API Resource* is a specific type of AWS resource (Custom::ApiResource) which is called "Resource" in API Gateway.

##Installation
###Prerequisites
* You need an [Amazon AWS Account](http://aws.amazon.com).
* You need an IAM user with access/secret key, see required permissions below.
* You have to install & configure the [AWS-CLI](http://docs.aws.amazon.com/cli/latest/userguide)

###Setup IAM permissions
To be able to install the Custom Resource library you require a set of permissions.
Configure your IAM user with the following policy and make sure that you have configured your aws-cli with access and secret key. 

**Note:** This Role contains delete permissions. If you do not want to give these permissions you can omit the last 6 permissions in the policy. If you do so, uninstallation cannot be done via the provided scripts.

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

###Download the installation package

<a href="http://apigatewaycloudformation.s3-website-eu-west-1.amazonaws.com/install/latest">Download the installation package</a>, unzip it and follow the OS specific instructions below.

####Unix
Install the infrastructure:

    unix/install.sh

Installation takes a couple of minutes and when it completes it will output the Custom Resource Lambda function ARN.
Save this value, it is the value of the ServiceToken parameter that each Custom Resource requires in your CloudFormation templates. 

Once installation is done, run the following command to deploy the code:

    unix/deploy.sh

#####Options

**-n NAME**<br/>
Sets a custom name for your installation (the default is ApiGatewayCloudFormation). 
Note that the custom name has to be provided to all scripts.

**-v VERSION**<br/>
If you don't want to deploy the latest version you can supply another version name by passing it as an argument with -v.
Available versions follow this naming convention: v{versionNumber}.zip
-v is only supported by the deploy script.

For a list of available versions, please see the <a href="#change-log">Change Log</a>.

#####Uninstall
If you want to uninstall the setup you simply run:

    unix/uninstall.sh

If you provided a custom name during installation you have to provide the same name during un-installation with the -n argument

**Note:** If you reinstall the setup you have to update the ServiceToken in your CloudFormation templates. 

####Windows

Install the infrastructure:

    windows\install.ps1

Installation takes a couple of minutes and when it completes it will output the Custom Resource Lambda function ARN.
Save this value, it is the value of the ServiceToken parameter that each Custom Resource requires in your CloudFormation templates. 

Once installation is done, run the following command to deploy the code:

    windows\deploy.ps1

#####Options

**-name NAME**<br/>
Sets a custom name for your installation (the default is ApiGatewayCloudFormation). 
Note that the custom name has to be provided to all scripts.

**-version VERSION**<br/>
If you don't want to deploy the latest version you can supply another version name by passing it as an argument with -version.
Available versions follow this naming convention: v{versionNumber}.zip
-version is only supported by the deploy script.

For a list of available versions, please see the <a href="#change-log">Change Log</a>.

#####Uninstall
If you want to uninstall the setup you simply run:

    windows\uninstall.ps1

If you provided a custom name during installation you have to provide the same name during un-installation with the -name argument

**Note:** If you reinstall the setup you have to update the ServiceToken in your CloudFormation templates. 


#Usage   

##Overview
This setup allows you to manage the majority of the API Gateway related resources. Below you'll find (hopefully) exhaustive documentation on how to use each resource type.

One thing that is not currently supported are API deployments. There is a bit of a catch-22 thing happening with the SDK and deployments where I can't create a stage without a deployment and I can't create a deployment without a stage. I have this on the TODO list but for now you'll have to manage API deployment outside of this project.

Also note that some resources may be flagged as experimental which means that they haven't been tested thoroughly.

That said, on to what you can do.

##Create an API

Creates a new Api Gateway REST API
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createRestApi-property

**Note:** The Custom Resource does not support API cloning. This is intentional.

###Parameters
**name:**
Name of the REST API.

* Required: *yes*
* Type: String
* Update: No interruption

**description:**
Name of the REST API. 
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
This may create certain data inconsistencies between the actual API and what is believed to be setup from the Custom Resource perspective.
I therefore recommend that if you remove an API Resource from a template, remove all child resources at the same time to ensure a consistent data model.

###Parameters
**restApiId:**
Reference to the REST API in which you want to create this API Resource.

* Required: *yes*
* Type: String
* Update: Not supported

**parentId** 
Id of the parent API Resource under which you want to place this API Resource.

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
For more information on CORS, please refer to http://www.w3.org/TR/cors/

* Required: no
* Type: Object
* Update: No interruption

**corsConfiguration.allowMethods**
A list of HTTP methods that allow CORS requests under this API Resource.
 
* Required: *yes*
* Type: String array
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

* Required: no
* Type: Boolean
* Update: No interruption

**corsConfiguration.allowOrigin**
If you supply cors configuration this API Resource will enable CORS requests.

* Required: no, default is *
* Type: Object
* Update: No interruption

**corsConfiguration.exposeHeaders**
A list of headers that are exposed to the client in the response, if present.

* Required: no, default is none
* Type: String array
* Update: No interruption

**corsConfiguration.maxAge**
Max age in seconds that a pre-flight check should be cached on the client.
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
Basic method configuration object.

* Required: *yes*
* Type: Object
* Update: Not available

**method.httpMethod**
The HTTP verb that this method adheres to.

* Required: *yes*
* Type: String
* Update: No interruption

**method.authorizationType**
API Method authorization type.
Set to CUSTOM if you want to use an Api Authorizer.

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

* Required: no
* Type: Map[String{content-type},String{template}] or Map[String{content-type},Object{template}] 
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

**This resource is experimental**

Creates a new Api Gateway Domain Name
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createDomainName-property

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

**certificateBody:**
The body of the server certificate provided by your certificate authority.

* Required: *yes*
* Type: String
* Update: Not supported

**certificatePrivateKey:**
Your certificate's private key.

* Required: *yes*
* Type: String
* Update: Not supported

**certificateChain:**
The intermediate certificates and optionally the root certificate, one after the other without any blank lines. 
If you include the root certificate, your certificate chain must start with intermediate certificates and end with 
the root certificate. Use the intermediate certificates that were provided by your certificate authority. 
Do not include any intermediaries that are not in the chain of trust path.

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
            "certificateBody": "...",
            "certificatePrivateKey": "...",
            "certificateChain": "..."
        }
    }

##Create a Base Path Mapping

**This resource is experimental**

Creates a new Api Gateway Base Path Mapping
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createBasePathMapping-property

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
* Update: Not supported

**basePath:**
The base path name that callers of the API must provide as part of the URL after the domain name. 
This value must be unique for all of the mappings across a single API. 
Exclude this if you do not want callers to specify a base path name after the domain name.

* Required: no
* Type: String
* Update: Not supported

**stage:**
The name of the API stage that you want to use for this mapping. 
Exclude this if you do not want callers to explicitly specify the stage name after any base path name.

* Required: no
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

Creates a new Api Gateway Authorizer
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#createAuthorizer-property

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

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.1.4.zip">1.1.6</a> (2016-02-26)
* Added error logging to deploy script.

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.1.4.zip">1.1.4</a> (2016-02-21)
* Added installation scripts for windows (powershell).

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.1.3.zip">1.1.3</a> (2016-02-21)
* Added installation scripts for unix that do not require npm or node to be installed.

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.1.0.zip">1.1.0</a> (2016-02-19)
* Introduced installation package so that you no longer have to clone the repo to install and deploy.

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.0.4.zip">1.0.4</a>  (2016-02-18)
* Introducing API Authorizers (http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html)

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/v1.0.2.zip">1.0.2</a>  (2016-02-18)
* Fix: Ensure that moving an API Method to another resource cleans up the old method.

## <a href="https://s3-eu-west-1.amazonaws.com/apigatewaycloudformation/builds/1.0.1.zip">1.0.1</a> (2016-02-17)
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
**Note:** This version is no longer available and cannot be installed.
* Initial release


#TODO

* Enable deployment management
* Test installation on linux & windows
* Create packages for installation so repo no longer has to be cloned to install.

#Contribute
I gladly accepts PRs, issues and comments. Anything that will help improve stability, reduce complexity or add more 
functionality is appreciated. Please make sure that npm test does not fail before you push your PR. 
There are strict requirements on es-lint and 100% unit test coverage for builds to succeed before they can be published.
