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
aws s3api put-object --bucket apigatewaycloudformation --key builds/latest --website-redirect-location /builds/${version}.zip --content-type text/html

rm -rf package.zip

echo "Packaging installation files"
cd _scripts/public
rm -rf node_modules

if [ "${npmVersion}" != "" ]; then
    npm version ${npmVersion}
fi

zip -r install-package.zip ./* ./*/** > /dev/null 2>&1
aws s3 cp install-package.zip s3://apigatewaycloudformation/install/${version}.zip
aws s3api put-object --bucket apigatewaycloudformation --key install/latest --website-redirect-location /install/${version}.zip --content-type text/html
rm -rf install-package.zip

echo "Done installing version ${version}"