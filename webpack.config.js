const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.join(__dirname, '/');
const PHASER_DIR = path.join(__dirname, '/node_modules/phaser');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CSSPlugin = new ExtractTextPlugin('app.css');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// global.console.log(process.env.NODE_ENV);
// const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
   entry: path.join(__dirname, './app'),
    output: {      
        path: path.join(__dirname, 'game'),
        filename:'build.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [APP_DIR, 'node_modules'],
        alias: {
            constants: `${APP_DIR}/constants`,
            phaser: path.join(PHASER_DIR, 'build/custom/phaser-split.js'),
            pixi: path.join(PHASER_DIR, 'build/custom/pixi.js'),
            p2: path.join(PHASER_DIR, 'build/custom/p2.js'),
        },
    },
    plugins: [
        new WriteFilePlugin(),
    // new ExtractTextPlugin('styles.css'), new HtmlWebpackPlugin({
    //     title: 'My App',
    //     filename: 'index.html',
    //     minify: {
    //         collapseWhitespace: true
    //     },
    //     hash: true
    // })
    //     CSSPlugin,
    // new webpack.DefinePlugin({
    //     NODE_ENV: JSON.stringify('production')
    // }),
    //     // new UglifyJsPlugin()
    ],
    module: {
    rules: [
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.css$/, loader: CSSPlugin.extract(['style-loader', 'css-loader']) }, // style-loader do not need, can cause error
        // {
        //     enforce: 'pre',
        //     test: /\.js$/,
        //     exclude: /node_modules/,
        //     loader: 'eslint-loader',
        //     options: {
        //         fix: true
        //     }
        // },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192
                    }
                }
            ]
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
            include: APP_DIR,
          },
          {
            test: /pixi\.js/,
            use: [{
              loader: 'expose-loader',
              options: 'PIXI',
            }],
          },
          {
            test: /phaser-split\.js$/,
            use: [{
              loader: 'expose-loader',
              options: 'Phaser',
            }],
          },
          {
            test: /p2\.js/,
            use: [{
              loader: 'expose-loader',
              options: 'p2',
            }],
          },
        ],
    },
};

module.exports = config;


