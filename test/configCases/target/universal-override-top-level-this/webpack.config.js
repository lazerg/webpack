"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	target: ["web", "node"],
	mode: "development",
	devtool: false,
	output: { publicPath: "" },
	module: {
		rules: [
			{
				test: /legacy\.js$/,
				parser: { overrideTopLevelThis: "global" }
			}
		]
	}
};
