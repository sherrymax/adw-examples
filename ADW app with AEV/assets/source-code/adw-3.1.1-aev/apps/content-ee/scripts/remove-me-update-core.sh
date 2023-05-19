#!/usr/bin/env bash

# CONTENT_CE_MERGE: Remove this file when content-ce has been merged into monorepo
# DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
# DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
# DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

if [ -f "./.env" ]; then
    if grep -q ACA_BRANCH .env; then
        export $(cat .env | grep ACA_BRANCH | xargs)
    fi
fi

BRANCH=${ACA_BRANCH:-develop}

echo "Getting ACA: ${BRANCH}"

###### IMP ######
# Make sure to run command : git clone https://github.com/sherrymax/alfresco-content-app --depth=1 --branch sherrymathews_3.0.0 "./apps/content-ce"


# rm -rf "./apps/content-ce"
# git clone https://github.com/Alfresco/alfresco-content-app --depth=1 --branch ${BRANCH} "./apps/content-ce"
