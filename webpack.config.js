var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');
var Clean = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
var data = require('./app/data.js')

var pkg = require('./package.json');

var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'app');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

process.env.BABEL_ENV = TARGET;

var common = {
  entry: APP_PATH,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  output: {
    path: BUILD_PATH,
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },

  module: {
    preLoaders: [
      {
        test: /\.js?$/,
        loaders: ['eslint'],
        // define an include so we check just the files we need
        include: APP_PATH
      }
    ],

    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      }
    ]
  },

  plugins: [

    new HtmlwebpackPlugin({
      title: 'Static app'
    })//,

    //new StaticSiteGeneratorPlugin('bundle.js', data.routes, data)
  ]
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      port: 3000
    },

    module: {
      loaders: [
        {
          test: /\.scss$/,
          loaders: ['style', 'css', 'sass'],
          include: APP_PATH
        }
      ]
    },

    plugins: [

      new OpenBrowserPlugin({
        url: 'http://localhost:3000'
      }),

      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

if(TARGET === 'build' || TARGET === 'stats') {
  module.exports = merge(common, {
    entry: {
      app: APP_PATH,
      vendor: Object.keys(pkg.dependencies)
    },

    output: {
      path: BUILD_PATH,
      filename: '[name].[hash].js'
    },

    devtool: 'source-map',

    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract('style', 'css!sass'),
          include: APP_PATH
        }
      ]
    },

    plugins: [
      new Clean(['build']),

      new ExtractTextPlugin('styles.[hash].css'),

      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        '[name].[hash].js'
      ),

      new webpack.DefinePlugin({
        'process.env': {
          // This affects react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),

      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}