'use strict';

module.exports = {
    CORS_OPTIONS_METHOD: 'OPTIONS',
    CORS_DEFAULT_ORIGIN: '*',
    CORS_ALL_METHODS: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE'],
    CORS_STATUS_CODE: '200',
    AWS_HEADER_PATHS: {
        ALLOW_HEADERS: 'Access-Control-Allow-Headers',
        ALLOW_METHODS: 'Access-Control-Allow-Methods',
        ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
        EXPOSE_HEADERS: 'Access-Control-Allow-Expose-Headers',
        MAX_AGE: 'Access-Control-Allow-Max-Age',
        ALLOW_CREDENTIALS: 'Access-Control-Allow-Credentials'
    },
    LIST_RESOURCES_LIMIT: 500,
    GET_APIS_LIMIT: 500
};
