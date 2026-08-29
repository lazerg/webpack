import { value } from "./lib";

export const reexported = value;

it("should expose a module in a module library", () => {
	expect(value).toBe("module-library");
	expect(globalThis.moduleLibrary.value).toBe("module-library");
	expect(globalThis.moduleLibraryValue).toBe("module-library");
});

it("should expose the entry module of a module library", () => {
	expect(globalThis.moduleLibraryEntry.reexported).toBe("module-library");
});
