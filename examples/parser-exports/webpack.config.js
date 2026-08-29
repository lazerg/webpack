"use strict";

/** @type {import("../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /legacy-global\.js$/,
				// `module.exports = Legacy;`
				parser: { exports: "single Legacy" }
			},
			{
				test: /math\.js$/,
				// `export { add, PI };`
				parser: { exports: ["named add", "named PI"] }
			}
		]
	}
};
