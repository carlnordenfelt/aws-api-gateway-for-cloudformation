# !Removal notice!
The downloadable artifacts will be **removed on August 31st 2019**.
This mean that the following pacakges will no longer be available:

* https://s3-{AWS-Region}.amazonaws.com/apigatewaycloudformation.{AWS-Region}/{VERSION}/ApiGatewayCloudFormation.template
* https://s3-{AWS-Region}.amazonaws.com/apigatewaycloudformation.{AWS-Region}/{VERSION}/source.zip

It will still be possible to build these packages using the source from GiHub.

# !Project Discontinued!
This project is no longer actively maintained. Critical bug fixes may be released but no new features can be expected.
Cloudformation has a decent set of native resources for API Gateway and where there is a gap in CloudFormation, I recommend using [Lulo](https://www.npmjs.com/package/lulo) to bridge it. 
[Lulo](https://www.npmjs.com/package/lulo) is a plugin engine for Custom Resources and is much more extendible and versatile than this project as the plugins can cover any AWS Service (and anything else for that matter) and not just API Gateway.


# API Gateway for CloudFormation

[![Build Status](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation.svg?branch=master)](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation)
[![Coverage Status](https://coveralls.io/repos/github/carlnordenfelt/aws-api-gateway-for-cloudformation/badge.svg?branch=master)](https://coveralls.io/github/carlnordenfelt/aws-api-gateway-for-cloudformation?branch=master)

API Gateway for CloudFormation is a set of Custom Resources that allows you to manage your API Gateway setup
with CloudFormation. Yes, you read that right! Finally a way to integrate your backend services that you
already create using CloudFormation with your APIs!

It's deployed via the CloudFormation Console and runs on AWS Lambda.

It supports API Definitions in Swagger as well as individual Cloud Formation resources depending on which flavour you prefer.

**Complete documentation is available at [the project website](https://apigatewaycloudformation.bynordenfelt.com/)**

## Overview

This setup allows you to manage the majority of the API Gateway related resources.
The installation will create a Lambda function in the region corresponding to the template location in your
AWS account. This Lambda function is a CloudFormation Custom Resource and acts as a liaison between
CloudFormation and API Gateway.
Once the Lambda function has been installed you can start writing your CloudFormation templates.

If you want to learn more about CloudFormation, Custom Resources or API Gateway I suggest the following links:
* [AWS CloudFormation](https://aws.amazon.com/cloudformation/)
* [Custom Resources](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html)
* [CloudFormation Template Reference](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-reference.html)
* [API Gateway](https://aws.amazon.com/api-gateway/)
* [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
