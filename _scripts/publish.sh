#!/bin/bash

# Give a name to override the patch operation (for testing)
npm run clean
npm run test
if [ $? != 0 ]; then
    exit 1;
fi;

npm prune --production

version=""
if [ "$1" != "" ]; then
    version="${1}";
else
    version=$(npm version patch)
fi;


zip -r package.zip lib/* lib/*/** node_modules/*/** package.json > /dev/null 2>&1
aws s3 cp package.zip s3://apigatewaycloudformation/builds/${version}.zip