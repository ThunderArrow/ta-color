const webpack = require('webpack');
const path = require('path');

process.env.NODE_ENV = process.env.ENV = 'production';
module.exports = {
	devtool: 'source-map',

	entry: {
		index: path.join(__dirname, 'src', 'index.ts')
	},

	output: {
		path: path.join(__dirname, 'dist'),
		libraryTarget: "commonjs2",
		filename: 'index.min.js'
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: ['node_workbench', 'node_modules']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loaders: [
					'awesome-typescript-loader?configFileName=' + path.resolve(__dirname, 'tsconfig.json')
				]
			}
		]
	},

	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: {
				keep_fnames: true
			},
			sourceMap: true
		}),
		new webpack.DefinePlugin({
			'process.env': {
				'ENV': 'production'
			}
		})
	]
};