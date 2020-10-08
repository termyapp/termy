const Copy = require('copy-webpack-plugin')
const path = require('path')
const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, './dist/main.js'),
})

// Electron Webpack Configuration
const electronConfiguration = {
  // Build mode
  mode: 'development',
  entry: './electron/main.ts',
  target: 'electron-main',
  resolve: {
    // alias: {
    //   ['@']: path.resolve(__dirname, 'src')
    // },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /electron/,
        use: [
          {
            loader: 'ts-loader',
            options: { configFile: 'tsconfig.electron.json' },
          },
        ],
      },
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js',
  },
  plugins: [
    new Copy({
      patterns: [{ from: 'electron/preload.js', to: 'preload.js' }],
    }),
    ElectronReloadPlugin(),
  ],
  node: {
    __dirname: true,
  },
}

module.exports = [electronConfiguration]
