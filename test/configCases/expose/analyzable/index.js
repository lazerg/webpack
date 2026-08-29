import fs from "fs";
import path from "path";
import { value } from "./lib";

const url = new URL("./asset.txt", import.meta.url);
// Needle built at runtime so it is not a source string literal here.
const baked = `${"/* asset"} import */ "`;

it("should keep the asset reference analyzable", () => {
	expect(fs.readFileSync(url, "utf8")).toContain("the asset content");
	expect(
		fs.readFileSync(path.join(__STATS__.outputPath, "bundle0.mjs"), "utf8")
	).toContain(baked);
});

it("should expose a module of an analyzable output", () => {
	expect(value).toBe("analyzable");
	expect(globalThis.analyzable.value).toBe("analyzable");
});

it("should not expose an asset that keeps no JavaScript module", () => {
	expect(globalThis.analyzableAsset).toBe(undefined);
});
