#!/bin/bash

NORMAL=$(tput sgr0)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)

function red() {
    echo "$RED$*$NORMAL"
}

function green() {
    echo "$GREEN$*$NORMAL"
}

function yellow() {
    echo "$YELLOW$*$NORMAL"
}

SRC_DIR=public/
DEP_DIR=deploy/

red 'Setting up deploy dir'
rm -rf $DEP_DIR
rsync -a $SRC_DIR $DEP_DIR

yellow 'Compressing js files'
find $DEP_DIR -name '*.js' -exec sed -i '' -e '/# sourceMappingURL=/d' {} \; -exec gzip -9 -n {} \; -exec mv {}.gz {} \;

green 'Uploading html files'
aws s3 sync --acl public-read --exclude '*.*' --include '*.html' $DEP_DIR s3://codekitchen.net

green 'Uploading assets'
aws s3 sync --acl public-read --exclude '*.*' --include '*.dae' $DEP_DIR s3://codekitchen.net
aws s3 sync --acl public-read $DEP_DIR/gallery/gallery/ s3://codekitchen.net/gallery/gallery/
aws s3 sync --acl public-read $DEP_DIR/images/ s3://codekitchen.net/images/

green 'Uploading js files'
aws s3 sync --acl public-read --exclude '*.*' --include '*.js' --content-type='application/javascript'  --content-encoding='gzip' --metadata-directive=REPLACE $DEP_DIR s3://codekitchen.net

red 'Removing deploy dir'
rm -rf $DEP_DIR
