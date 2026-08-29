import legacy from "./legacy";

it("should reach the platform global on a neutral target", () => {
	expect(legacy.assigned).toBe("set");
});
