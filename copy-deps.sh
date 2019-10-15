#!/bin/sh
# Hello.
#
# React Native doesn't properly support symlinks (or perhaps it does now?), so this
# script will recompile and copy everything over.  It's pretty lame.  But hey, it
# does the job.
#
# Another Awesome Note:  The packager should be stopped before running this script.

# first, nuke the deps ... whether they be folders (from npm) or symlinks (from lerna)
rm -rf node_modules/reactotron-core-ui
rm -f node_modules/reactotron-core-ui

# reactotron-core-client
cd ../../reactotron-core-ui
yarn run build:dev
cd ../flipper-plugins/flipper-plugin-reactotron
mkdir -p ./node_modules/reactotron-core-ui
cp -r ../../reactotron-core-ui/dist ./node_modules/reactotron-core-ui/dist
cp ../../reactotron-core-ui/package.json ./node_modules/reactotron-core-ui/package.json
