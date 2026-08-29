import assetUrl from "./asset.txt";

it("should expose an asset that is read from JavaScript", () => {
	expect(assetUrl).toContain("asset.txt");
	expect(globalThis.importedAsset).toBe(assetUrl);
});
