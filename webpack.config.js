'use strict';

// VARIABLES CONFIG
const path = require('path');
const glob = require('glob-all');
const isProd = process.env.NODE_ENV === 'production';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const PurifyCSSPlugin = require('purifycss-webpack');
const GoogleFontsPlugin = require('google-fonts-webpack-plugin');

const bootstrapEntryPoints = require('./webpack.bootstrap.config');

const srcPaths = {
	root: path.join(__dirname, 'src'),
	img: path.join(__dirname, 'src/images'),
	templates: path.join(__dirname, 'src/templates'),
	bootstrap: path.join(__dirname, 'src/bootstrap')
};

const distPaths = {
	root: path.join(__dirname, 'dist'),
	fonts: path.join(__dirname, 'dist/fonts'),
	css: path.join(__dirname, 'dist/css')
};

const fileNames = {
	index: 'index.html',
	registration: 'registration.html',
	login: 'login.html',
	consent: 'consent.html'
};

console.log(process.env.NODE_ENV);
console.log(srcPaths.root);
console.log(srcPaths.root);

const cssDev = [
	'style-loader',
	'css-loader?sourceMap',
	'postcss-loader',
	{
		loader: 'postcss-loader',
		options: {
			plugins: function() {
				return [require('autoprefixer')];
			}
		}
	},
	'sass-loader',
	{
		loader: 'sass-resources-loader',
		options: {
			resources: ['./src/resources.scss']
		}
	}
];

const cssProd = ExtractTextPlugin.extract({
	fallback: 'style-loader',
	use: [
		'css-loader',
		'sass-loader',
		'postcss-loader',
		{
			loader: 'postcss-loader',
			options: {
				plugins: function() {
					return [require('autoprefixer')];
				}
			}
		},
		{
			loader: 'sass-resources-loader',
			options: {
				resources: ['./src/resources.scss']
			}
		}
	],
	publicPath: '/dist'
});

// SERVER CONFIG
const servDev = {
	progress: true,
	contentBase: '.',
	host: 'localhost',
	port: 9000,
	open: true,
	stats: 'errors-only',
	// hot: true,
	openPage: fileNames.consent
};

const servProd = {
	progress: true,
	compress: true,
	contentBase: '.'
};

// SET CONFIG
const cssConfig = isProd ? cssProd : cssDev;
const serverConfig = isProd ? servProd : servDev;
const devtoolConfig = isProd ? 'source-map' : 'eval';
const bootstrapConfig = isProd
	? bootstrapEntryPoints.prod
	: bootstrapEntryPoints.dev;

module.exports = {
	entry: {
		app: srcPaths.root + '/app.js',
		// fa: '@fortawesome/fontawesome-free-webfonts/scss/fontawesome.scss',
		// fa: srcPaths.src + '/fa.js',
		jqueryValidation: [
			'jquery-validation',
			'jquery-validation-unobtrusive'
		],
		bootstrap: bootstrapConfig
	},
	output: {
		path: distPaths.root,
		filename: 'js/[name].bundle.js'
	},
	devtool: devtoolConfig,
	devServer: serverConfig,
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: cssConfig
			},
			{
				test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts/',
							publicPath: '../fonts/'
						}
					}
				]
			},
			{
				test: /\.(jpe?g|png|gif|svg|ico)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'assets/',
							publicPath: '../assets/'
						}
					}
				]
			},

			// // font-awesome
			// {
			// 	test: /font-awesome\.config\.js/,
			// 	use: [{ loader: 'style-loader' }, { loader: 'font-awesome-loader' }]
			// },

			// fa
			// {
			// 	test: /\.js$/,
			// 	exclude: /node_modules/,
			// 	use: {
			// 		loader: 'babel-loader',
			// 		options: {
			// 			presets: ['env'],
			// 			babelrc: false,
			// 			cacheDirectory: true,
			// 			plugins: [
			// 				'transform-runtime']
			// 		}
			// 	}
			// },

			// Bootstrap 4
			{
				test: /bootstrap\/dist\/js\/umd\//,
				loader: 'imports-loader?jQuery=jquery'
			}
		]
	},
	resolve: {
		extensions: ['.js'],
		modules: [path.resolve(__dirname, 'scripts'), 'node_modules'],
		alias: {
			'@fortawesome/fontawesome-free-solid$':
				'@fortawesome/fontawesome-free-solid/shakable.es.js',
			'@fortawesome/fontawesome-free-regular$':
				'@fortawesome/fontawesome-free-regular/shakable.es.js'
		}
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			names: ['app', 'jqueryValidation'],
			minChunks: 2
		}),

		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			Tether: 'tether',
			'window.Tether': 'tether',
			Popper: ['popper.js', 'default'],
			Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
			Button: 'exports-loader?Button!bootstrap/js/dist/button',
			Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
			Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
			Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
			Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
			Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
			Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
			Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
			Tooltip: 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
			Util: 'exports-loader?Util!bootstrap/js/dist/util'
		}),

		new GoogleFontsPlugin({
			fonts: [
				{
					family: 'Source Sans Pro'
				},
				{
					family: 'Roboto'
				},
				{
					family: 'Roboto Condensed'
				},
				{
					family: 'Ubuntu'
				}
			],
			path: 'fonts/',
			minify: true,
			filename: 'css/fonts.css'
		}),

		new HtmlWebpackPlugin({
			title: 'Welcome',
			template: srcPaths.templates + '/' + fileNames.index,
			filename: fileNames.index,
			favicon: srcPaths.root + '/images/favicon.ico',
			minify: {
				collapseWhitespace: false,
				minifyJS: isProd,
				minifyCSS: isProd
			},
			// hash      : isProd,
			showErrors: !isProd
		}),

		new HtmlWebpackPlugin({
			title: 'Login',
			template: srcPaths.templates + '\\' + fileNames.login,
			filename: fileNames.login,
			minify: {
				collapseWhitespace: false,
				minifyJS: isProd,
				minifyCSS: isProd
			},
			// hash      : isProd,
			showErrors: !isProd
		}),

		new HtmlWebpackPlugin({
			title: 'Registration',
			template: srcPaths.templates + '\\' + fileNames.registration,
			filename: fileNames.registration,
			minify: {
				collapseWhitespace: false,
				minifyJS: isProd,
				minifyCSS: isProd
			},
			// hash      : isProd,
			showErrors: !isProd
		}),

		new HtmlWebpackPlugin({
			title: 'Consent',
			template: srcPaths.templates + '\\' + fileNames.consent,
			filename: fileNames.consent,
			minify: {
				collapseWhitespace: false,
				minifyJS: isProd,
				minifyCSS: isProd
			},
			// hash      : isProd,
			showErrors: !isProd
		}),

		new ExtractTextPlugin({
			filename: 'css/[name].css',
			disable: !isProd,
			allChunks: true
		}),

/* 		// Make sure this is after ExtractTextPlugin!
		new PurifyCSSPlugin({
			// Give paths to parse for rules. These should be absolute!
			paths: glob.sync([path.join(__dirname, 'src/*.html')]),
			purifyOptions: {
				info: true,
				minify: isProd,
				whitelist: ['*purify*']
			}
		}),
 */
		new webpack.HotModuleReplacementPlugin(),

		new webpack.NamedModulesPlugin()
	]
};
