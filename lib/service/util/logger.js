'use strict';

/* eslint no-console: 0 */
module.exports = {
    log: function (message, attachment) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'TEST') {
            if (attachment) {
                console.log(message, attachment);
            } else {
                console.log(message);
            }
        }
    }
};
