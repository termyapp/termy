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

module.exports = [electronConfiguration]
