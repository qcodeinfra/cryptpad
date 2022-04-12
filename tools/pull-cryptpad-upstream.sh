#!/bin/sh
REPO="https://github.com/xwiki-labs/cryptpad.git"
PREFIX=cryptpad
REF="${1}"
if [ -z "${ref}" ]; then
    printf "usage: $0 <ref>\n" 1>&2
    printf "ref: main, tag, branch or commit hash\n" 1>&2
    exit 1
fi
cd $(dirname $0)/..
exec git subtree pull -P "${PREFIX}" "${REPO}" "${REF}"
