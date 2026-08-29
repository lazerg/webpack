import { value } from "./lib";

it("should warn about an export that does not exist", () => {
	expect(value).toBe("lib");
	expect(globalThis.missing).toBe(undefined);
});
