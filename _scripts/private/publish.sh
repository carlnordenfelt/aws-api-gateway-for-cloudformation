#!/bin/sh

version=$1

aws s3api put-object --bucket apigatewaycloudformation --key builds/latest --website-redirect-location /builds/v${version}.zip --content-type text/html
aws s3api put-object --bucket apigatewaycloudformation --key install/latest --website-redirect-location /install/v${version}.zip --content-type text/html

echo "${version} published"