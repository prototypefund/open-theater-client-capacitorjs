const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'www'),
  },
  watch: true,
  plugins:[
    new WebpackShellPlugin({
      onBuildStart: ['npx cap open ios'],
      onBuildExit: ['echo BUILDSTART','npx cap copy'],
      dev:true
    })
  ]
};