"use strict";

/** @type {import("../../../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /unknown-syntax\.js$/,
				parser: { exports: "unknown a" }
			},
			{
				test: /too-many-parts\.js$/,
				parser: { exports: "named a b c" }
			},
			{
				test: /empty-separator\.js$/,
				parser: { exports: "named  a" }
			},
			{
				test: /alias-on-default\.js$/,
				parser: { exports: "default a b" }
			},
			{
				test: /mixed-formats\.js$/,
				parser: { exports: ["named a", "multiple b"] }
			},
			{
				test: /single-and-multiple\.js$/,
				parser: { exports: ["single a", "multiple b"] }
			},
			{
				test: /multiple-defaults\.js$/,
				parser: { exports: ["default a", "default b"] }
			},
			{
				test: /duplicate\.js$/,
				parser: { exports: ["named a", "named b a"] }
			},
			{
				test: /missing\.js$/,
				parser: { exports: "named missing" }
			},
			{
				test: /imported\.js$/,
				parser: { exports: "named one" }
			},
			{
				test: /esm\.js$/,
				parser: { exports: "single x" }
			},
			{
				test: /comma\.js$/,
				parser: { exports: "multiple a,multiple b" }
			},
			{
				test: /pipe\.js$/,
				parser: { exports: "named|a|b" }
			},
			{
				test: /invalid-name\.js$/,
				parser: { exports: "multiple `a`" }
			},
			{
				test: /reserved-name\.js$/,
				parser: { exports: "multiple default" }
			}
		]
	}
};
