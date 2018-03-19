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
	'css-loader',
	'postcss-loader',
	{
		loader : 'postcss-loader',
		options: {
			plugins: function() {
				return [require('autoprefixer')];
			}
		}
	},
	'sass-loader',
	{
		loader : 'sass-resources-loader',
		options: {
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
				plugins: function() {
					return [require('autoprefixer')];
				}
			}
		},	
		{
			loader : 'sass-resources-loader',
			options: {
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
const cssConfig    = isProd ? cssProd : cssDev;
const serverConfig = isProd ? servProd : servDev;

const devtoolConfig = isProd ? 'inline' : 'cheap-eval-source-map ';


const bootstrapConfig = isProd
	? bootstrapEntryPoints.prod
	:                   bootstrapEntryPoints.dev;

module.exports = {
	entry: {
		app             : appPaths.src + '/app.js',
		jqueryValidation: ['jquery-validation', 'jquery-validation-unobtrusive'],
		bootstrap       : bootstrapConfig
	},
	output: {
		path    : appPaths.dist,
		filename: 'js/[name].bundle.js'
	},
	devtool: devtoolConfig,
	// devtool  : devtoolConfig,
	devServer: serverConfig,
	module   : {
		rules: [
			{
				test: /\.scss$/,
				use : cssConfig
			},
			{
				test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
				use : [
					{
						loader : 'file-loader',
						options: {
							name      : '[name].[ext]',
							outputPath: 'fonts/',
							publicPath: '../fonts/'
						}
					}
				]
			},
			{
				test: /\.(jpe?g|png|gif|svg|ico)$/i,
				use : [
					{
						loader : 'file-loader',
						options: {
							name      : '[name].[ext]',
							outputPath: 'assets/',
							publicPath: '../assets/'
						}
					}
				]
			},

			// Bootstrap 4
			{
				test: /bootstrap[\\]dist[\\]js[\\]umd[\\]/,
				loader: 'imports-loader?jQuery=jquery'
			}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			names    : ['app', 'jqueryValidation'],
			minChunks: 2
		}),
		new webpack.ProvidePlugin({
			$              : 'jquery',
			jQuery         : 'jquery',
			'window.jQuery': 'jquery',
			Tether         : 'tether',
			'window.Tether': 'tether',
			Popper         : ['popper.js', 'default'],
			Alert          : 'exports-loader?Alert!bootstrap/js/dist/alert',
			Button         : 'exports-loader?Button!bootstrap/js/dist/button',
			Carousel       : 'exports-loader?Carousel!bootstrap/js/dist/carousel',
			Collapse       : 'exports-loader?Collapse!bootstrap/js/dist/collapse',
			Dropdown       : 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
			Modal          : 'exports-loader?Modal!bootstrap/js/dist/modal',
			Popover        : 'exports-loader?Popover!bootstrap/js/dist/popover',
			Scrollspy      : 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
			Tab            : 'exports-loader?Tab!bootstrap/js/dist/tab',
			Tooltip        : 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
			Util           : 'exports-loader?Util!bootstrap/js/dist/util'
		}),
		new HtmlWebpackPlugin({
			title   : 'Web template',
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
			filename : 'css/[name].css',
			disable  : !isProd,
			allChunks: true
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(),
		// Make sure this is after ExtractTextPlugin!
		new PurifyCSSPlugin({
			// Give paths to parse for rules. These should be absolute!
			paths        : glob.sync([path.join(__dirname, 'src/*.html')]),
			purifyOptions: {
				info     : true,
				minify   : isProd,
				whitelist: [ '*:not*' ]
			}
		})
	]
};
