"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /(global|esm)\.js$/,
				parser: { overrideTopLevelThis: "global" }
			},
			{
				test: /undefined\.js$/,
				parser: { overrideTopLevelThis: "undefined" }
			}
		]
	}
};
