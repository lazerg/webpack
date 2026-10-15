import { order } from "dep/order.js";
import { a, b } from "dep";

export { a };
export const e = () => b();
export { c, d } from "dep";

it("should concatenate re-exported side-effect-free modules in source order", () => {
	expect(order).toEqual(["b", "a", "c", "d"]);
});
