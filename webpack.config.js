'use strict';

// VARIABLES CONFIG
const path   = require('path');
const glob   = require('glob-all');
const isProd = process.env.NODE_ENV === 'production';

const webpack           = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin   = require('purifycss-webpack');

const bootstrapEntryPoints = require('./webpack.bootstrap.config');

const appPaths = {
	src : path.join(__dirname, 'src'),
	dist: path.join(__dirname, 'dist')
};

console.log(process.env.NODE_ENV);
console.log(appPaths.src);

const cssDev = [
	'style-loader',
	'css-loader?sourceMap',
	'postcss-loader',
	'sass-loader',
	{
		loader : 'sass-resources-loader',
		options: {
			// Provide path to the file with resources
			resources: ['./src/resources.scss']
		}
	}
];
const cssProd = ExtractTextPlugin.extract({
	fallback: 'style-loader',
	use     : [
		'css-loader',
		'sass-loader',
		{
			loader : 'postcss-loader',
			options: {
				sourceMap: 'inline'
			}
		},
		{
			loader : 'sass-resources-loader',
			options: {
				// Provide path to the file with resources
				resources: ['./src/resources.scss']
			}
		}
	],
	publicPath: '/dist'
});

// SERVER CONFIG

const servDev = {
	progress   : true,
	compress   : false,
	contentBase: '.',
	host       : 'localhost',
	port       : 9000,
	open       : true,
	stats      : 'errors-only',
	hot        : true
};

const servProd = {
	progress   : true,
	compress   : true,
	contentBase: '.'
};

// SET CONFIG
const cssConfig     = isProd ? cssProd : cssDev;
const serverConfig  = isProd ? servProd : servDev;
const devtoolConfig = isProd ? 'inline' : 'cheap-eval-source-map';

const bootstrapConfig = isProd
	? bootstrapEntryPoints.prod
	:   bootstrapEntryPoints.dev;

module.exports = {
	entry: {
		app      : appPaths.src + '\\app.js',
		bootstrap: bootstrapConfig
	},
	output: {
		path    : appPaths.dist,
		filename: 'js/[name].bundle.js'
	},
	devtool  : devtoolConfig,
	devServer: serverConfig,
	module   : {
		rules: [
			{
				test: /\.scss$/,
				use : cssConfig
			},
			{
				test   : /\.js$/,
				exclude: /node_modules/,
				use    : 'babel-loader'
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use : [
					'file-loader?name=images/[name].[ext]',
					'image-webpack-loader?bypassOnDebug'
				]
			},
			{
				test: /\.(woff2?)$/,
				use : 'url-loader?limit=10000&name=fonts/[name].[ext]'
			},
			{
				test: /\.(ttf|eot)$/,
				use : 'file-loader?name=fonts/[name].[ext]'
			},
			// Bootstrap 4
			{
				test: /bootstrap[\\]dist[\\]js[\\]umd[\\]/,
				loader: 'imports-loader?jQuery=jquery'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title   : 'BxlCare',
			template: appPaths.src + '\\index.html',
			favicon : appPaths.src + '\\images\\favicon.ico',
			minify  : {
				collapseWhitespace: isProd,
				minifyJS          : isProd,
				minifyCSS         : isProd
			},
			hash      : isProd,
			showErrors: !isProd
		}),
		new ExtractTextPlugin({
			filename : '/css/[name].css',
			disable  : !isProd,
			allChunks: true
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(),
		// Make sure this is after ExtractTextPlugin!
		new PurifyCSSPlugin({
			// Give paths to parse for rules. These should be absolute!
			paths: glob.sync(path.join(__dirname, 'src/*.html'))
		})
	]
};
