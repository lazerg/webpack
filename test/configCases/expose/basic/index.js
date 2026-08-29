globalThis.taken = "taken";
globalThis.overridden = "overridden";

it("should expose the module under multiple names", () => {
	const lib = require("./lib");

	expect(globalThis.myLib).toBe(lib);
	expect(globalThis.nested.deep.myLib).toBe(lib);
	expect(globalThis.libGlobal).toBe(lib);
});

it("should expose a single export of the module", () => {
	const lib = require("./lib");

	expect(globalThis.myMap).toBe(lib.map);
	expect(globalThis.myMap("a")).toBe("map:a");
});

it("should keep an existing value without the 'override' option", () => {
	require("./lib");

	expect(globalThis.taken).toBe("taken");
});

it("should overwrite an existing value with the 'override' option", () => {
	const lib = require("./lib");

	expect(globalThis.overridden).toBe(lib);
	expect(globalThis.overriddenMap).toBe(lib.map);
});

it("should expose a module matched by an absolute request", () => {
	const other = require("./other");

	expect(globalThis.myOther).toBe(other);
});
