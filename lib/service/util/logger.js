'use strict';

/* eslint no-console: 0 */
module.exports = {
    log: function (message, attachment) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'TEST') {
            console.log(message, attachment);
        }
    }
};
