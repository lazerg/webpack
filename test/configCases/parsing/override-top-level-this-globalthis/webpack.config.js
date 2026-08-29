"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	target: "node",
	mode: "development",
	devtool: false,
	output: { environment: { globalThis: true } },
	module: {
		rules: [
			{
				test: /legacy\.js$/,
				parser: { overrideTopLevelThis: "global" }
			}
		]
	}
};
