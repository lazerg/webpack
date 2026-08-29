const fs = require("fs");
const path = require("path");

it("should spell globalThis when the environment has it", () => {
	expect(require("./legacy").assigned).toBe("set");

	const source = fs.readFileSync(
		path.join(__STATS__.outputPath, "bundle0.js"),
		"utf8"
	);

	expect(source).toContain('globalThis.spelledGlobalThis = "set"');
	expect(source).not.toContain(`${"__webpack_require__"}.g`);
});
