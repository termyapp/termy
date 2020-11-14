const Copy = require('copy-webpack-plugin')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

let plugins = [
  new Copy({
    patterns: [
      {
        from: 'src/preload.js',
        to: path.resolve(__dirname + '../../app/public/preload.js'),
      },
    ],
  }),
]

if (isDev) {
  const ElectronReloadPlugin = require('webpack-electron-reload')({
    path: path.resolve(__dirname, '../app/public/electron.js'),
  })
  plugins.push(ElectronReloadPlugin())
}

// Electron config
module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.ts',
  target: 'electron-main',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { configFile: 'tsconfig.json' },
          },
        ],
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: false, // can't mock dirname because of node-loader
  },
  output: {
    // putting them in public, so it gets copied along with the other static files
    path: path.resolve(__dirname + '../../app/public'),
    filename: 'electron.js',
  },
  plugins,
}
