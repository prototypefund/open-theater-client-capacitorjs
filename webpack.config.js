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
      onBeforeBuild: {
        scripts: ['echo "Webpack WATCH"','npx cap copy'],
        blocking: true,
        parallel: false
      },
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