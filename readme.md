A custom self-hosted instance of [CryptPad](https://cryptpad.fr/) for qcode
infra, accessible at https://cryptpad.qcode.ch.

The upstream code lives in the [cryptpad](cryptpad/) sub directory. This
is placed as a git subtree, not to be confused with submodule. To customize
functionality or look&feel, copy a file from
[cryptpad/customize.dist](cryptpad/customize.dist/) into
[customize](customize/) and change it. The file will be served in place of
the original dist.

See [upstream docs](https://docs.cryptpad.fr/en/admin_guide/customization.html)
for customization details.

## Updating from upstream

To update local copy with upstream changes, use
[tools/pull-cryptpad-upstream.sh](tools/pull-cryptpad-upstream.sh) script.
For example, to pull up to an imaginary release tag xyz, execute:

    ./tools/pull-cryptpad-upstream.sh xyz

It'll fetch from upstream and add new commits as if they were part of this repo.
Finally, `git push` to update this repo's remote.

If instead you want to make a pull request, first create a branch. Something like
`git checkout -b upstream-update-xyz master` should do. Then execute the above
script and send the branch as a pull request.

Then, check whether there were any changes to config files between the last deployed
release and the newly pulled version. Most important files to check are the following.

    # config.js
    git diff v4.14.1..v5.0.0 -- cryptpad/config/config.example.js
    # nginx.conf
    git diff v4.14.1..v5.0.0 -- cryptpad/docs/example.nginx.conf
    # customize/application_config.js
    git diff v4.14.1..v5.0.0 -- cryptpad/www/common/application_config_internal.js

Obviously, replace v4.14.1 and v5.0.0 with the appropriate tags.

For the record, initial subtree merge from upstream was done with the following
command:

    git subtree add -P cryptpad https://github.com/xwiki-labs/cryptpad.git 4.14.0

## Contributing to upstream

You'll probably want to have a separate repository, cloned directly from the
upstream `https://github.com/xwiki-labs/cryptpad.git`. Since this repo's
cryptpad dir is a copy of the upstream repo, it should be very easy to apply
changes to both using patch files and `git apply` or `patch` commands.

See details on [how to contribute](https://docs.cryptpad.fr/en/how_to_contribute.html)
in the upstream docs.

## Dev environment

To start a local dev instance, forget about the files in the root of this repo
and simply work in the [cryptpad](cryptpad/) sub directory. In other words,
follow [upstream dev guide](https://docs.cryptpad.fr/en/dev_guide/setup.html).

When done, a `git diff` will show some changes. Those in the `cryptpad/` sub
directory should go to upstream. Anything else, notably the [customize](customize/)
directory, lives in this repo.

## Production instance

To build for prod deployment, you'll need [podman](https://podman.io).
Create prod build artifacts manually with:

    ./tools/build-prod.sh

The script creates few files in the `build` directory. Notably, the two files
required for prod deployment are:

- `cryptpad-container-img-<git-commit-hash>.tar.gz`: container file with
the nodejs server
- `cryptpad-static-<git-commit-hash>.tar.gz`: static files served by
nginx frontend

Copy both files to production machines. The `cryptpad-container-img.tar.gz` can
be loaded on the machine with:

    gunzip -c path/to/cryptpad-container-img.tar.gz | podman load

Unpack the static files into a temp dir and sync with the prod dir:

    mkdir tmpstatic
    tar -C tmpstatic -xf cryptpad-static-xxx.tar.gz
    rsync -rl --chown root:root --delete-after tmpstatic/ static/

There are also a couple of config files, `config.js` and `nginx.conf`, in the root
of this repo. These are production configs and will eventually move to
another location with all the other prod infra configs.

All the manual steps described above will disappear once a central prod infra
is in place.
