#!/bin/sh

DIR=$(cd $(dirname "$0"); pwd)
PREFIX=$(npm prefix)
GLOBAL_PREFIX=$(npm -g prefix)

CURRENT=$DIR/../lib/main.js
LOCAL=$PREFIX/lib/main.js
GLOBAL=$GLOBAL_PREFIX/lib/node_modules/serialserver/lib/main.js

# Use the local copy if installed locally.
if [ -f "$CURRENT" ];
then
	TARGET=$CURRENT;
else
	if [ -f "$LOCAL" ];
	then
		TARGET=$LOCAL
	else
		TARGET=$GLOBAL
	fi
fi

node "$TARGET" $1 $2 $3 $4