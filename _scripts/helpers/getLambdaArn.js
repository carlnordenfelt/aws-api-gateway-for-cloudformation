'use strict';
var LAMBDA_OUTPUT_KEY = 'LambdaFunction';

module.exports = function (stack) {
    for (var i = 0; i < stack.Outputs.length; i++) {
        if (stack.Outputs[i].OutputKey === LAMBDA_OUTPUT_KEY) {
            return stack.Outputs[i].OutputValue;
        }
    }
    return null;
};
