const path = require('path')
//is constantly reloading the browser...just turned it offf
//const HtmlWebpackPlugin = require('html-webpack-plugin')

//might get rid of this eventually, if I switch to a node server
const devServer = require('@webpack-blocks/dev-server2')

const splitVendor = require('webpack-blocks-split-vendor')
const happypack = require('webpack-blocks-happypack')
const {
  addPlugins, createConfig, entryPoint, env, setOutput,
  sourceMaps, defineConstants, webpack,
} = require('@webpack-blocks/webpack2')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000
const sourceDir = process.env.SOURCE || 'src'
const apiUrl = process.env.API_URL || 'http://localhost:1337'

//this is how client-side assets will be accessible in a browser
//path starts with a '/', so the path will be a path relative to the server, and the outputPath, not the index.html
const publicPath = `/${process.env.PUBLIC_PATH || ''}/`.replace('//', '/')
const sourcePath = path.join(process.cwd(), sourceDir)
const nodeModulesPath = path.join(process.cwd(), 'node_modules')

//note that this sets point of reference eg for the public path
const outputPath = path.join(process.cwd(), 'dist')

const babel = () => () => ({
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
    ],
  },
})

const sass = () => () => ({
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]-[hash:base64:5]',
          },
        }, {
          loader: 'sass-loader',
          options: {
            includePaths: [sourcePath, nodeModulesPath],
          },
        }],
      },
    ],
  },
})

const css = () => () => ({
  module: {
    rules: [
      { test: /\.css$/, exclude: /node_modules\/normalize.css/, loader: 'style-loader!css-loader' },
    ],
  },
})

const assets = () => () => ({
  module: {
    rules: [
      { test: /\.(png|jpe?g|svg|woff2?|ttf|eot)$/, loader: 'url-loader?limit=8000' },
    ],
  },
})

const resolveModules = modules => () => ({
  resolve: {
    modules: [].concat(modules, ['node_modules']),
  },
})

const node = () => ({
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    module: 'empty',
  }
})

// currently only using an client
const config = createConfig([
  //default target is web, which is the case here
  entryPoint({
    app: sourcePath,
  }),
  setOutput({
    filename: '[name].js',
    path: outputPath,
    publicPath,
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json'
  }),
  defineConstants({
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'process.env.PUBLIC_PATH': publicPath.replace(/\/$/, ''),
    'process.env.API_URL': apiUrl,
  }),
  addPlugins([
    new webpack.ProgressPlugin(),
  ]),
  happypack([
    babel(),
  ]),
  assets(),
  sass(),
  css(),
  resolveModules(sourceDir),
  env('development', [ //probably thewebpack dev server; so can probably remove
    devServer({
      contentBase: 'public',
      stats: 'errors-only',
      historyApiFallback: { index: publicPath },
      headers: { 'Access-Control-Allow-Origin': '*' },
      host,
      port,
    }),
    sourceMaps(),
    addPlugins([
      new webpack.NamedModulesPlugin(),
    ]),
  ]),

  env('production', [
    splitVendor(),
    addPlugins([
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    ]),
  ]),
  node,
])

module.exports = config

