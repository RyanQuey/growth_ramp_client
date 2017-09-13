const path = require('path')
//const HtmlWebpackPlugin = require('html-webpack-plugin')

//might get rid of this eventually
const devServer = require('@webpack-blocks/dev-server2')

const splitVendor = require('webpack-blocks-split-vendor')
const happypack = require('webpack-blocks-happypack')
const {
  addPlugins, createConfig, entryPoint, env, setOutput,
  sourceMaps, defineConstants, webpack,
} = require('@webpack-blocks/webpack2')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000
const clientSourceDir = process.env.SOURCE || 'srcClient'

//this is how client-side assets will be accessible in a browser
//path starts with a '/', so the path will be a path relative to the server, not the index.html
const publicPath = `/${process.env.PUBLIC_PATH || 'assets'}/`.replace('//', '/')
const clientSourcePath = path.join(process.cwd(), clientSourceDir)
const nodeModulesPath = path.join(process.cwd(), 'node_modules')

//currently taking advantage of the sails default, where the asset/index.html gets served if routes aren't set for the homepage
//maybe eventually separate the JavaScript from that index.HTML file
const clientOutputPath = path.join(process.cwd(), 'assets/js')

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
            includePaths: [clientSourcePath, nodeModulesPath],
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
    tls: 'empty'
  }
})

// currently only using an client
const clientConfig = createConfig([
  //default target is web, which is the case here
  entryPoint({
    app: clientSourcePath,
  }),
  setOutput({
    filename: '[name].js',
    path: clientOutputPath,
    publicPath,
  }),
  defineConstants({
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'process.env.PUBLIC_PATH': publicPath.replace(/\/$/, ''),
  }),
  addPlugins([
    new webpack.ProgressPlugin(),
    /*new HtmlWebpackPlugin({
      filename: 'index.html', //this will be the output, put in the output path set above
      template: path.join(process.cwd(), 'srcClient/index.html'), //the source index file
    }),*/
  ]),
  happypack([
    babel(),
  ]),
  assets(),
  sass(),
  css(),
  resolveModules(clientSourceDir),
  env('development', [
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

module.exports = clientConfig

