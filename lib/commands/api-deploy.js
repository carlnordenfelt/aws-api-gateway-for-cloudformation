'use strict';

var ApiDeployService = require('../service/api-deploy/api-deploy-service');
var ApiDeployEvent = require('../service/api-deploy/api-deploy-event');

var pub = {};

pub.getParameters = function (event) {
    return ApiDeployEvent.getParameters(event);
};

pub.createResource = function createResource(event, context, eventParams, callback) {
    ApiDeployService.deployApi(eventParams, function (error) {
        if (error) {
            return callback(error);
        }
        getForResponse(event, context, eventParams.params.stageName, eventParams.params.restApiId, callback);
    });
};

pub.deleteResource = function deleteResource(_event, _context, _eventParams, callback) {
    callback();
};

pub.updateResource = function updateResource(event, context, eventParams, callback) {
    pub.createResource(event, context, eventParams, callback);
};

module.exports = pub;

/* eslint max-params: 0 */
function getForResponse(_event, _context, stageName, restApiId, callback) {
    ApiDeployService.getForResponse(stageName, restApiId, function (error, apiStage) {
        if (error) {
            return callback(error);
        }
        apiStage.physicalResourceId = restApiId + '/' + stageName;
        return callback(null, apiStage);
    });
}
