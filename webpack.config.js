const path = require('path')
//is constantly reloading the browser...just turned it offf
//const HtmlWebpackPlugin = require('html-webpack-plugin')

//might get rid of this eventually, if I switch to a node server
//const devServer = require('@webpack-blocks/dev-server2')

//const splitVendor = require('webpack-blocks-split-vendor')
const Uglify = require("uglifyjs-webpack-plugin");
const webpack = require('webpack')

const sourceDir = process.env.SOURCE || 'src'
const sourcePath = path.join(process.cwd(), sourceDir)
/*const componentPaths = ['user', 'shared', 'admin'].map((s) => (
  path.join(sourcePath, s)
))
console.log(componentPaths);*/
//const baseSassPath = path.join(sourcePath, 'theme')
const outputPath = path.join(process.cwd(), 'dist')

// currently only using in client
const config = {
  entry: `${sourcePath}/index.js`,
  output: {
    filename: 'app.js',
    path: outputPath,
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]-[hash:base64:5]',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [sourcePath],
            },
          },
        ],
      },
      {
        //test: /^(?!style)+.*\.scss$/, //don't hash classes for everything else besides style.scss. doesn't seem to work though, potentially using getLocalIdent could work, but it seems like using multiple tests that use .scss just causes trouble
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [sourcePath],
            },
          },
        ],
      },
      {
        include: /\.json$/,
        loaders: ['json-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.(woff2|woff|ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
        loader: 'url-loader?limit=100000'
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': process.env.NODE_ENV,
      'process.env.API_URL': process.env.API_URL,
    }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: [".js"],
    mainFiles: ["index"],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    module: 'empty',
  },
}

//if (process.env.NODE_ENV === 'production') {
  //config.plugins.push(new Uglify());
//} else { //development
  config.plugins.push(new webpack.NamedModulesPlugin());
  config.devtool = "source-map"
//}


module.exports = config

