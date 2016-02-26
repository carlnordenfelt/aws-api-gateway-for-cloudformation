#!/bin/sh

if [ $# -ne 1 ]; then
    echo "Error: You have to specify a version number"
    exit 1;
fi

version=$1

aws s3api put-object --bucket apigatewaycloudformation --key builds/latest --website-redirect-location /builds/v${version}.zip --content-type text/html
aws s3api put-object --bucket apigatewaycloudformation --key install/latest --website-redirect-location /install/v${version}.zip --content-type text/html

echo "${version} published"