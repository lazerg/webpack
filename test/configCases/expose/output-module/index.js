import { value } from "./lib";

it("should expose a module with ESM output", () => {
	expect(value).toBe("esm-output");
	expect(globalThis.esmOutput.value).toBe("esm-output");
	expect(globalThis.esmOutputValue).toBe("esm-output");
});
