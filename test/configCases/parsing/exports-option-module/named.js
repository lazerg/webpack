const value = "shadowed";
const one = 1;

function two() {
	return value === "shadowed" ? "two" : "broken";
}
