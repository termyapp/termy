#!/usr/bin/env bash

# Prerequirements
echo Node: "$(node -v)" || echo Node not found
echo Yarn: "$(yarn -v)" || echo Yarn not found
echo Cargo: "$(cargo version)" || echo Cargo not found

# Update submodules
echo Updating submodules...
git submodule update --recursive

# Building
echo Building native module...
rm app/public/*.node
cd native || echo Failed to visit native. Current working directory: "$(pwd)". Are you in the root?
yarn || echo Failed to install yarn dependencies. Is yarn installed? && yarn build-release

echo Bundling main...
cd ../electron || exit
yarn && yarn build-webpack

echo Building app...
cd ../app || exit
yarn && yarn build

echo Building electron...
cd ../electron || exit
yarn && yarn build
