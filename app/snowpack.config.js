/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  alias: {
    '@app': './src',
  },
  mount: {
    public: { url: '/', static: true, resolve: false },
    src: '/dist',

    // monaco-editor
    '../external/monaco-editor/min/vs': {
      url: '/monaco-editor',
      static: true,
      resolve: false,
    },

    // https://github.com/suren-atoyan/monaco-react/issues/12
    // '../external/monaco-editor/min-maps': {
    //   url: '/min-maps',
    //   static: true,
    //   resolve: false,
    // },
  },
  plugins: [
    // '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-webpack',
  ],
  devOptions: {
    port: 8080,
    open: 'none',
  },
  buildOptions: {
    out: '../electron/build',
  },
}
