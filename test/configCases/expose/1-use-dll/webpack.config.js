"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	optimization: {
		moduleIds: "named"
	},
	plugins: [
		new webpack.DllReferencePlugin({
			manifest: require("../../../js/config/expose/manifest.json"),
			name: "../0-create-dll/dll.js",
			scope: "dll",
			sourceType: "commonjs2"
		}),
		new webpack.ExposePlugin({
			exposes: {
				"dll/lib.js": [
					{ globalName: "dllLib", override: true },
					"dllValue|value|true"
				]
			}
		})
	]
};
