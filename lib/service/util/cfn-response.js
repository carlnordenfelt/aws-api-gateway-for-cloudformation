'use strict';
/* Copyright 2015 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
 This file is licensed to you under the AWS Customer Agreement (the 'License').
 You may not use this file except in compliance with the License.
 A copy of the License is located at http://aws.amazon.com/agreement/.
 This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
 See the License for the specific language governing permissions and limitations under the License. */

/* istanbul ignore next */
var logger = require('./logger');
/* istanbul ignore next */
var https = require('https');
/* istanbul ignore next */
var url = require('url');

/* istanbul ignore next */
exports.SUCCESS = 'SUCCESS';
/* istanbul ignore next */
exports.FAILED = 'FAILED';
/* istanbul ignore next */
/* eslint max-params: 0 */
exports.send = function (event, context, responseStatus, responseData, physicalResourceId) {
    if (responseStatus === 'SUCCESS' && !responseData) {
        responseData = { success: true };
    }

    if (responseData instanceof Error) {
        responseData = {
            error: responseData.toString()
        };
    }

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
        PhysicalResourceId: responseData.physicalResourceId || physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });
    logger.log('Response body:\n', responseBody);

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'content-type': '',
            'content-length': responseBody.length
        }
    };

    var request = https.request(options, function (response) {
        logger.log('Status code: ' + response.statusCode);
        logger.log('Status message: ' + response.statusMessage);
        context.done();
    });

    request.on('error', function (error) {
        logger.log('send(..) failed executing https.request(..): ' + error);
        context.done();
    });

    request.write(responseBody);
    request.end();
};
