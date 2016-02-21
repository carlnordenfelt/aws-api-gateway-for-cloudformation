#!/bin/sh

version=$1

aws s3api put-object --bucket apigatewaycloudformation --key builds/latest --website-redirect-location /builds/${version}.zip --content-type text/html
aws s3api put-object --bucket apigatewaycloudformation --key install/latest --website-redirect-location /install/${version}.zip --content-type text/html

echo "${version} published"