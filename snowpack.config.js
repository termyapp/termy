/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    // '@snowpack/plugin-webpack',
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    namedExports: ['xterm'],
  },
  devOptions: {
    port: 8080,
    open: 'none',
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
}
