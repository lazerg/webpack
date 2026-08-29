globalThis.externalJQuery = function externalJQuery() {
	return "external";
};

it("should expose an external module", () => {
	const $ = require("jquery");

	expect(globalThis.exposedExternal).toBe($);
	expect(globalThis.exposedExternal()).toBe("external");
});
