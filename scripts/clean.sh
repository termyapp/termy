#!/usr/bin/env bash

cd electron || exit
rm -rf node_modules
rm -rf build
rm -rf dist

cd ../app || exit
rm -rf node_modules

cd ../native || exit
rm -rf node_modules
rm -rf target
