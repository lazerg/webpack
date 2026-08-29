"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /named\.js$/,
				parser: { exports: ["named one", "named two twoAlias"] }
			},
			{
				test: /default\.js$/,
				parser: { exports: "default Thing" }
			},
			{
				test: /bare\.js$/,
				parser: { exports: "value" }
			},
			{
				test: /pure\.js$/,
				parser: { exports: ["named Lib", "default Widget.create"] }
			}
		]
	},
	optimization: {
		concatenateModules: true
	}
};
