'use strict';

var pub = {};

pub.getParameters = function getParameters(event) {
    var eventParams = {
        params: extractParams(event.ResourceProperties),
        old: extractParams(event.OldResourceProperties)
    };

    // Validation
    if (event.RequestType !== 'Delete') {
        if (!eventParams.params.apiDefinition) {
            throw new Error('Missing parameter {apiDefinition} in input');
        }
    }

    // Set defaults
    if (!eventParams.params.failOnWarnings) {
        eventParams.params.failOnWarnings = false;
    }

    if (eventParams.params.restApiId) {
        eventParams.params.updateMode = 'merge';
    } else {
        eventParams.params.updateMode = 'overwrite';
    }
    return eventParams;
};

module.exports = pub;

function extractParams(resourceProperties) {
    if (!resourceProperties) {
        return undefined;
    }
    return {
        failOnWarnings: resourceProperties.failOnWarnings,
        apiDefinition: resourceProperties.apiDefinition,
        parameters: resourceProperties.parameters,
        restApiId: resourceProperties.restApiId
    };
}
