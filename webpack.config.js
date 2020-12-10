const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'www'),
  },
  watch: true,
  plugins: [
    new WebpackShellPluginNext({
      onBuildStart:{
        scripts: ['echo "Webpack Start"','npx cap copy'],
        blocking: true,
        parallel: false
      }, 
      onBuildEnd:{
        scripts: ['echo "Webpack End"'],
        blocking: false,
        parallel: true
      }
    })
  ]
};