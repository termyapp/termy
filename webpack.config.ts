import Copy from 'copy-webpack-plugin'
import * as path from 'path'
import * as webpack from 'webpack'

// Electron Webpack Configuration
const electronConfiguration: webpack.Configuration = {
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
        use: [{ loader: 'ts-loader' }],
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
  ],
  node: {
    __dirname: true,
  },
}

module.exports = [electronConfiguration]
