#!/bin/sh

DIR=$(cd $(dirname $0); pwd)
rm -Rf "$DIR"/target

pushd "$DIR"

mkdir target/
mkdir target/serialserver/
mkdir target/serialserver/bin/
mkdir target/serialserver/lib/

cp src/main/javascript/*.js target/serialserver/lib/
cp src/main/sh/* target/serialserver/bin/
cp src/main/resources/* target/serialserver/

chmod 750 target/serialserver/bin/*.sh


pushd target
pushd serialserver
npm install
popd

tar -cvzf serialserver.tar.gz serialserver/

popd
popd