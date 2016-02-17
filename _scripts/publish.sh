#!/bin/bash

npm run clean
npm run test

if [ $? != 0 ]; then
    exit 1;
fi;

npm prune --production
version=$(npm version patch)
zip -r package.zip lib/* lib/*/** node_modules/*/** package.json > /dev/null 2>&1
aws s3 cp package.zip s3://apigatewaycloudformation/builds/${version}.zip