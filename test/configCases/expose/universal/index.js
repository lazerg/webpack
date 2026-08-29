import { value } from "./lib";

it("should expose a module for a universal target", () => {
	expect(value).toBe("universal");
	expect(globalThis.universal.value).toBe("universal");
	expect(globalThis.universalValue).toBe("universal");
});
