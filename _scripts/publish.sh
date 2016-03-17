#!/bin/sh


# Regions where AWS Lambda is available
regions=( eu-west-1 us-west-1 us-east-1 ap-northeast-1 )
npmActions=( patch minor major )
# Local path to the CFN template file
templatePath="_scripts"
# Template file name
templateName="ApiGatewayCloudFormation.template"

# S3 bucket name prefix (.region is appended to the name)
s3BucketName="apigatewaycloudformation"
# Source file name
sourceFileName="source.zip"

action=""
version=""
while getopts ":a:v:" opt; do
  case ${opt} in
    a)
        action="${OPTARG}"
    ;;
    v)
        version="${OPTARG}"
    ;;
    \?)
        echo "Invalid argument: -$OPTARG" >&2
        exit 1;
    ;;
  esac
done

# Parse version from version string.
# Will run npm version methods if version is not provided or one of patch, minor or major.
# All other values will be used as is but prefixed by test/.
function parseVersion() {
    if [[ " ${npmActions[@]} " =~ " ${1} " ]]; then
        npmVersionCommand=${1}
    fi

    if [ "${npmVersionCommand}" != "" ]; then
        version=$(npm version ${npmVersionCommand})
        if [ -z ${version} ]; then
            exit 1;
        fi
        version=${version:1}
    else
        version=test/${1}
    fi

    echo ${version}
}

# Packages the source code to a zip file (source.zip)
function package() {
    npm run clean
    npm run test
    if [ $? != 0 ]; then
        exit 1;
    fi;

    npm prune --production

    echo "Packaging source code"
    rm -rf ${sourceFileName}
    zip -r ${sourceFileName} lib/* lib/*/** node_modules/*/** > /dev/null 2>&1
    echo "Local file ${sourceFileName} created."
}

# Publishes the source file and CFN template to S3.
# It will publish to all Lambda regions. If the bucket does not exist it is created.
function publish() {
    echo "Publishing version: ${version}"

    if [[ " ${version} " != *"test/"* ]]; then
        sed -i '.original' "s/{VERSION}/${version}/g" ${templatePath}/${templateName}
        for region in "${regions[@]}"; do
            bucketName="${s3BucketName}.${region}"
            aws s3api head-bucket --bucket ${bucketName} --region ${region}

            if [ $? -ne 0 ]; then
                if [ "${region}" == "us-east-1" ]; then
                    aws s3api create-bucket --bucket ${bucketName} --region ${region}
                else
                    aws s3api create-bucket --bucket ${bucketName} --region ${region} --create-bucket-configuration LocationConstraint=${region}
                fi
                sleep 3
                aws s3api put-bucket-policy --bucket ${bucketName} --region ${region} --policy "{ \"Statement\": [ { \"Effect\": \"Allow\", \"Principal\": \"*\", \"Action\": \"s3:GetObject\", \"Resource\": \"arn:aws:s3:::${bucketName}/*\" } ] }"
            fi

            aws s3 cp ${sourceFileName} s3://${bucketName}/${version}/${sourceFileName} --region ${region}
            aws s3 cp ${templatePath}/${templateName} s3://${bucketName}/${version}/${templateName} --region ${region}
            echo "* <a href=\"https://s3.amazonaws.com/${bucketName}/${version}/${templateName}\">${region} template</a>"
        done
    else
        sed -i '.original' "s:{VERSION}:test/${version}:g" ${templatePath}/${templateName}
        aws s3 cp ${sourceFileName} s3://${s3BucketName}.eu-west-1/${version}/${sourceFileName} --region eu-west-1
        aws s3 cp ${templatePath}/${templateName} s3://${s3BucketName}.eu-west-1/${version}/${templateName} --region eu-west-1
        echo "https://s3.amazonaws.com/${s3BucketName}.eu-west-1/${version}/${templateName}"
    fi

    rm -f ${sourceFileName}
    rm -f ${templatePath}/${templateName}
    mv ${templatePath}/${templateName}.original ${templatePath}/${templateName}

    echo "Version ${version} published to AWS"
}

function usage() {
    echo "Usage: publish.sh -a [package|publish] -v version"
    echo "-v is required if -a is publish"
    exit 1;
}

if [ -z "${action}" ]; then
    usage
fi

if [[ "${action}" == "publish" && -z "${version}" ]]; then
    usage
fi

package || exit 1;

if [ "${action}" == "publish" ]; then
    version=$(parseVersion ${version}) || exit 1;
    publish ${version}
fi
