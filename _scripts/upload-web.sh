#!/bin/sh

bucketPath='s3://apigatewaycloudformation.bynordenfelt.com';
cd web

# generate checksum for local assets and replace in index.html (cache busting)
jsMd5=$(md5 -q assets/apigatewaycloudformation.js)
cssMd5=$(md5 -q assets/apigatewaycloudformation.css)

sed -i.orig1 s/apigatewaycloudformation.js/${jsMd5}.js/ index.html
sed -i.orig2 s/apigatewaycloudformation.css/${cssMd5}.css/ index.html

cp assets/apigatewaycloudformation.js assets/${jsMd5}.js
cp assets/apigatewaycloudformation.css assets/${cssMd5}.css

## Upload assets with long cache time
aws s3 sync . ${bucketPath} --exclude "index.html*" --exclude "assets/apigatewaycloudformation.js" --exclude "assets/apigatewaycloudformation.css" --cache-control "max-age=7776000" --expires "Sat, 26 Jul 2050 05:00:00 GMT"

# upload index.html with no cache
aws s3 sync . ${bucketPath} --exclude "*" --include "index.html" --cache-control "max-age=0" --expires "Sat, 26 Jul 1997 05:00:00 GMT"

sleep 5 # Wait for 5 seconds in case there is a client request currently in-flight

# Clean up old assets
aws s3 sync . ${bucketPath} --delete --quiet --exclude "index.html*" --exclude "assets/apigatewaycloudformation.js" --exclude "assets/apigatewaycloudformation.css"

rm -f assets/${jsMd5}.js
rm -f assets/${cssMd5}.css
rm index.html
rm index.html.orig2
mv index.html.orig1 index.html

echo "Client updated. Public URL: ${bucketPath}"
