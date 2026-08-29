import "pmodule";

it("should expose a module of a side effect free package (#120)", () => {
	expect(globalThis.pmodule.value).toBe("pmodule");
	expect(globalThis.pmoduleValue).toBe("pmodule");
});
