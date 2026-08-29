import Thing from "./default";
import { one, twoAlias } from "./named";
import { value } from "./bare";
import create, { Lib } from "./pure";

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

it("should keep declarations only the injected exports read", () => {
	expect(Lib.greet()).toBe("hello");
	expect(create()).toBe("widget");
});
