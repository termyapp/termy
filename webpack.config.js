const HtmlWebpackPlugin = require('html-webpack-plugin')

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
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js',
  },
}

const reactConfiguration = {
  mode: 'development',
  entry: './src/index.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  resolve: {
    // alias: {
    //   ['@']: path.resolve(__dirname, 'src'),
    // },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: 'renderer.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}

module.exports = [electronConfiguration, reactConfiguration]
