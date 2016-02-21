#!/bin/sh

npm run clean
npm run test
if [ $? != 0 ]; then
    exit 1;
fi;

npm prune --production

npmVersion=""
if [ "$1" == "" ]; then
    npmVersion="patch"
elif [ "$1" = "patch" ] || [ "$1" = "minor" ] || [ "$1" = "major" ]; then
    npmVersion=$1
fi

if [ "${npmVersion}" != "" ]; then
    version=$(npm version ${npmVersion})
else
    version=$1
fi

echo "Packaging version: ${version}"

echo "Packaging source code"
zip -r package.zip lib/* lib/*/** node_modules/*/** package.json > /dev/null 2>&1
aws s3 cp package.zip s3://apigatewaycloudformation/builds/${version}.zip

rm -rf package.zip

echo "Packaging installation files"
cd _scripts/public

zip -r install-package.zip ./* ./*/** > /dev/null 2>&1
aws s3 cp install-package.zip s3://apigatewaycloudformation/install/${version}.zip
rm -rf install-package.zip

echo "Done packaging version ${version}. Don't forget to publish!"