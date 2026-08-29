import { doubled, topLevelThis } from "./esm";

it("should replace the top-level this with the global object", () => {
	const result = require("./global");

	expect(result.read).toBe("set");
	expect(result.called).toBe("called");
	expect(result.onGlobal).toBe("set");
});

it("should replace the top-level this with undefined", () => {
	const result = require("./undefined");

	expect(result.type).toBe("undefined");
	expect(result.nested).toBe("object");
});

it("should leave esm modules alone", () => {
	expect(topLevelThis).toBe("undefined");
	expect(doubled).toEqual([4]);
});
