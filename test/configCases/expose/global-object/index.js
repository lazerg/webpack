globalThis.myScope = {};

it("should expose to the configured global object", () => {
	const lib = require("./lib");

	expect(globalThis.myScope.scopedLib).toBe(lib);
});
