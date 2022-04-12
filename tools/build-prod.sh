#!/bin/sh -e
PODMAN=podman
if ! type podman > /dev/null; then
    printf "$0 requires podman; see https://podman.io\n" 1>&2
    exit 1
fi
cd $(dirname $0)/..

# all build artifacts are stored with this version suffix
VERSION=$(git rev-parse --short HEAD)
mkdir -p build

# cryptpad's node server needs a couple files from www/common.
# it also needs 404.html and 500.html from customize[.dist], otherwise
# the express server hogs CPU at 100% if a request hits a nonexistent file.
# the customize dir must be mounted in read-only at container start.
tar -cf build/bootstrap.tar \
    -C cryptpad \
    .bowerrc \
    bower.json \
    lib \
    package-lock.json \
    package.json \
    scripts \
    server.js \
    LICENSE
mkdir -p cryptpad/www/bower_components
$PODMAN build --rm --squash --net=host \
    -v $PWD/cryptpad/www/bower_components:/build/www/bower_components \
    -t cryptpad .
$PODMAN save cryptpad | gzip > build/cryptpad-container-img-$VERSION.tar.gz

# static files served by an HTTP frontend, as well as the customize dir
# required by the node server run in a container image.
STATIC_TAR_OUT=build/cryptpad-static-$VERSION.tar
tar -cf $STATIC_TAR_OUT \
    -C cryptpad \
    customize.dist \
    www \
    LICENSE
# append custom files, in a separate step to preserve desired file
# tree structure.
tar -rf $STATIC_TAR_OUT customize
printf "${VERSION}" > build/commit.txt
tar -rf $STATIC_TAR_OUT -C build commit.txt
# finally, gzip the archive for faster transfer/deployment.
gzip -f $STATIC_TAR_OUT
