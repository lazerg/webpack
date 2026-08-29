globalThis.myScope = {};

it("should expose a module matched by 'test'", () => {
	const lib = require("./lib");

	expect(globalThis.myScope.libByTest).toBe(lib);
});

it("should expose a module matched by 'request' and 'include'", () => {
	const other = require("./other");

	expect(globalThis.myScope.otherByRule).toBe(other);
	expect(globalThis.otherByOwnGlobalObject).toBe(other);
});
