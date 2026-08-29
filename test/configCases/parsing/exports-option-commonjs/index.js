"use strict";

it("should add a single CommonJs export", () => {
	expect(require("./single")()).toBe("foo");
});

it("should add multiple CommonJs exports with an alias", () => {
	const lib = require("./multiple");

	expect(lib.a).toBe(1);
	expect(lib.renamed()).toBe("b");
	expect(lib.b).toBe(undefined);
});

it("should add an export described by an object", () => {
	expect(require("./object").renamedValue).toBe("value");
});

it("should add an export of a member expression", () => {
	expect(require("./member").image()).toBe("image");
});

it("should not generate an export nothing uses", () => {
	expect(require("./unused").used).toBe(1);
});

it("should keep a declaration only the injected export reads", () => {
	expect(require("./pure").Lib.greet()).toBe("hello");
});

it("should keep a declaration only the single injected export reads", () => {
	expect(require("./pure-single").create()).toBe("widget");
});
