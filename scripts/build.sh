# Prerequirements

echo Node: $(node -v) || echo Node not found
echo Yarn: $(yarn -v) || echo Yarn not found
# Rust check is missing

# Setup everything

cd native || echo Failed to visit native. Current working directory: $(pwd). Are you in the root?
yarn || echo Failed to install yarn dependencies. Is yarn installed? && yarn build

cd ../electron

yarn && yarn build-webpack & yarn build

cd ../app
yarn && yarn build
