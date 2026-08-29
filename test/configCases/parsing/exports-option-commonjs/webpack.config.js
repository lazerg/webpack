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
				test: /pure-single\.js$/,
				parser: { exports: "single Widget" }
			},
			{
				test: /pure\.js$/,
				parser: { exports: "multiple Lib" }
			},
			{
				test: /member\.js$/,
				parser: { exports: "multiple Foo.Image image" }
			},
			{
				test: /unused\.js$/,
				parser: { exports: ["multiple used", "multiple unused"] }
			}
		]
	}
};
