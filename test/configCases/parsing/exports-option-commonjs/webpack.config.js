"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /single\.js$/,
				parser: { exports: "single Foo" }
			},
			{
				test: /multiple\.js$/,
				parser: { exports: ["multiple a", "multiple b renamed"] }
			},
			{
				test: /object\.js$/,
				parser: {
					exports: {
						syntax: "multiple",
						name: "value",
						alias: "renamedValue"
					}
				}
			},
			{
				test: /commas\.js$/,
				parser: { exports: "multiple first,multiple second" }
			},
			{
				test: /unused\.js$/,
				parser: { exports: ["multiple used", "multiple unused"] }
			}
		]
	}
};
