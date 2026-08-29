it("should expose a module coming from a dll (#25)", () => {
	const lib = require("dll/lib");

	expect(globalThis.dllLib).toBe(lib);
	expect(globalThis.dllValue).toBe("dll-lib");
	expect(globalThis.dllLibFromDll).toBe(lib);
});
