#API Gateway for CloudFormation

[![Build Status](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation.svg?branch=master)](https://travis-ci.org/carlnordenfelt/aws-api-gateway-for-cloudformation)
[![Coverage Status](https://coveralls.io/repos/github/carlnordenfelt/aws-api-gateway-for-cloudformation/badge.svg?branch=master)](https://coveralls.io/github/carlnordenfelt/aws-api-gateway-for-cloudformation?branch=master)

API Gateway for CloudFormation is a set of Custom Resources that allows you to manage your API Gateway setup
with CloudFormation. Yes, you read that right! Finally a way to integrate your backend services that you
already create using CloudFormation with your APIs!

It's deployed via the CloudFormation Console and runs on AWS Lambda.

**Complete documentation is available at [the project website](https://apigatewaycloudformation.bynordenfelt.com/)**

##Overview


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
