/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',

    // monaco-editor
    'node_modules/monaco-editor/min/vs': {
      url: '/monaco-editor',
      static: true,
      resolve: false,
    },
  },
  plugins: [
    // '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-webpack',
  ],
  install: [
    /* ... */
  ],
  // installOptions: { https://github.com/snowpackjs/snowpack/discussions/1606
  //   namedExports: ['xterm'],
  // },
  devOptions: {
    port: 8080,
    open: 'none',
  },
  buildOptions: {
    // out: '../electron/build', has issues with babel-loader
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
}
