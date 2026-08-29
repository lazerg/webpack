"use strict";

const path = require("path");
const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	entry: ["./lib"],
	output: {
		filename: "dll.js",
		libraryTarget: "commonjs2"
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": { globalName: "dllLibFromDll", override: true }
			}
		}),
		new webpack.DllPlugin({
			path: path.resolve(__dirname, "../../../js/config/expose/manifest.json"),
			entryOnly: false
		})
	]
};
