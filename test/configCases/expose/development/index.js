globalThis.taken = "taken";

it("should throw when the value exists in development mode", () => {
	expect(() => require("./lib")).toThrow(
		/it may not be safe to overwrite it, use the "override" option/
	);
});
