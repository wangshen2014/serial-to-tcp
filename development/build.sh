#!/bin/sh

DIR=$(cd $(dirname "$0"); pwd)
rm -Rf $DIR/target

mkdir $DIR/target
mkdir $DIR/target/serialserver
mkdir $DIR/target/serialserver/bin
mkdir $DIR/target/serialserver/javascript

cp $DIR/src/main/javascript/*.js $DIR/target/serialserver/javascript/
cp $DIR/src/main/sh/*.sh $DIR/target/serialserver/bin/
cp $DIR/src/main/resources/* $DIR/target/serialserver/

chmod 750 $DIR/target/serialserver/bin/*

tar -cvzf $DIR/target/serialserver.tar.gz $DIR/target/serialserver/