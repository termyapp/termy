# Contributing

## Things you'll need

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Rust nightly](https://www.rust-lang.org/tools/install)
- Clang

## Start developing

1. Go into the native folder: `cd native`
2. Install dependencies: `yarn`
3. Build a the native package: `yarn build`
4. Go to the electron folder: `cd ../electron`
5. Install electron dependencies: `yarn`
6. Start electron: `yarn dev`
7. In a separate console go to the app directory: `cd app`
8. Install dependencies: `yarn`
9. Start the app: `yarn dev`
10. Download [monaco-editor](https://microsoft.github.io/monaco-editor) and put it inside (https://github.com/snowpackjs/snowpack/issues/1286)

### Windows

#### error: linking with `link.exe` failed: exit code: 1181

https://stackoverflow.com/a/57843860

# Building

1. /native: yarn build-release
2. /electron: yarn build-webpack
3. /app: yarn build
4. /electron: yarn build
