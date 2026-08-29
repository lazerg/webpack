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

it("should add exports separated by a comma", () => {
	const lib = require("./commas");

	expect(lib.first).toBe(1);
	expect(lib.second).toBe(2);
});

it("should not generate an export nothing uses", () => {
	expect(require("./unused").used).toBe(1);
});
