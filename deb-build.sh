#! /usr/bin/env bash

apt-get update

mk-build-deps --install --tool "apt-get --yes --no-install-recommends" debian/control
dpkg-buildpackage -b -rfakeroot -us -uc

mkdir -p artifacts/
mv ../*.build* ../*.changes ../*.deb artifacts/