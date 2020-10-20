const Copy = require('copy-webpack-plugin')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

let plugins = [
  new Copy({
    patterns: [{ from: 'electron/preload.js', to: 'preload.js' }],
  }),
]

if (isDev) {
  const ElectronReloadPlugin = require('webpack-electron-reload')({
    path: path.join(__dirname, './public/electron.js'),
  })
  plugins.push(ElectronReloadPlugin())
}

// Electron config
module.exports = {
  mode: process.env.NODE_ENV,
  entry: './electron/main.ts',
  target: 'electron-main',
  resolve: {
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
    path: __dirname + '/public',
    filename: 'electron.js',
  },
  plugins,
}
