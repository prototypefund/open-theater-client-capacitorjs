const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  entry: {
    app:'./src/app.js',
    trigger_client:'./src/trigger_client.js'
},
  output: {
    filename: '[name].js',
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