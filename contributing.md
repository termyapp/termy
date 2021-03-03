# Requirements

## General

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Cargo](https://www.rust-lang.org/tools/install)

## Windows

To avoid the [linking issue](https://stackoverflow.com/a/57843860):

```
error: linking with `link.exe` failed: exit code: 1181
```

Install [Windows C++ build tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16).

# Developing

1. Install dependencies in `electron`, `app` and `native` using yarn:

```
yarn
```

2. Build the native module:

```
cd native
yarn build
```

3. Download [monaco-editor](https://microsoft.github.io/monaco-editor), unzip it and move the package to the external folder

```
mv path/to/downloaded/package external/monaco-editor
```

4. Start the electron server:

```
cd electron
yarn dev
```

5. In a separate cell, start the app server:

```
cd app
yarn dev
```

6. If a window pops up now that means that you've done everything right!

# Building

From the project root directory, run:

```
bash ./scripts/build.sh
```

# Known Issues

## Electron Warnings

```
WARNING in ./node_modules/electron-debug/index.js 110:61-74
Critical dependency: the request of a dependency is an expression
```

```
2021-02-23 17:44:00.479 Electron Helper (Renderer)[42898:7935862] CoreText note: Client requested name ".NewYork-Regular", it will get Times-Roman rather than the intended font. All system UI font access should be through proper APIs such as CTFontCreateUIFontForLanguage() or +[NSFont systemFontOfSize:].
```

## App Warnings

### Dev Tools not working

To hide the messages in the console, filter them using `-devtools` flag.

### Source maps not loading

To hide them, disable source maps in electron's chrome settings.

### Insecure Content-Security-Policy

Only an issue in `dev` because we are loading the content using the `http` protocol.

To hide it, use this filter in the console:

```
-url:electron/js2c/renderer_init.js
```
