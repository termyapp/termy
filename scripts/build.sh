# Prerequirements

echo Node: $(node -v) || echo Node not found
echo Yarn: $(yarn -v) || echo Yarn not found
echo Cargo: $(cargo version) || echo Cargo not found


# Building

echo Building native module...
cd native || echo Failed to visit native. Current working directory: $(pwd). Are you in the root?
yarn || echo Failed to install yarn dependencies. Is yarn installed? && yarn build-release

cd ../electron

echo Bundling main...
yarn && yarn build-webpack

echo Building app...
cd ../app
yarn && yarn build

echo Building electron...
cd ../electron
yarn && yarn build
