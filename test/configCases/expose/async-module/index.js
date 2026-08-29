it("should expose the exports object of an async module", () =>
	import("./async").then((ns) => {
		expect(ns.value).toBe("async-value");
		expect(globalThis.asyncNamespace.value).toBe("async-value");
	}));

it("should not expose a single export of an async module", () => {
	expect(globalThis.asyncValue).toBe(undefined);
});
