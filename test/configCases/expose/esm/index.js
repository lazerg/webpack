import $, { jQuery } from "./jquery";

it("should not change what an ES module exports (#256)", () => {
	expect(typeof $).toBe("function");
	expect($()).toBe("jQuery");
	expect($).toBe(jQuery);
});

it("should expose exports of an ES module", () => {
	expect(globalThis.$).toBe($);
	expect(globalThis.jQuery).toBe($);
});

it("should expose the namespace of an ES module (#227)", () => {
	expect(globalThis.jQueryNamespace.default).toBe($);
	expect(globalThis.jQueryNamespace.jQuery).toBe($);
	expect(globalThis.jQueryNamespace.$).toBe($);
});
