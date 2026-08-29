import Thing from "./default";
import { one, twoAlias } from "./named";
import { value } from "./bare";

it("should add named exports with an alias", () => {
	expect(one).toBe(1);
	expect(twoAlias()).toBe("two");
});

it("should add a default export", () => {
	expect(new Thing().name).toBe("thing");
});

it("should default to a named export and survive concatenation renaming", () => {
	expect(value).toBe(42);
});
