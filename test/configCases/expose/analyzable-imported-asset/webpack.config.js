"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	target: "node",
	mode: "development",
	devtool: false,
	experiments: {
		outputModule: true
	},
	output: {
		module: true,
		filename: "bundle0.mjs",
		publicPath: "auto",
		assetModuleFilename: "[name][ext]"
	},
	module: {
		rules: [{ test: /\.txt$/, type: "asset/resource" }]
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./asset.txt": { globalName: "importedAsset", override: true }
			}
		})
	]
};
