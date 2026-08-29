"use strict";

it("should report every invalid exports option", () => {
	require("./unknown-syntax");
	require("./too-many-parts");
	require("./empty-separator");
	require("./alias-on-default");
	require("./mixed-formats");
	require("./single-and-multiple");
	require("./multiple-defaults");
	require("./duplicate");
	require("./missing");
	require("./imported");
	require("./esm");
	require("./comma");
	require("./pipe");
	require("./invalid-name");
	require("./reserved-name");
});
