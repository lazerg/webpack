const topLevelThis = this;

module.exports = {
	type: typeof topLevelThis,
	// a nested function's `this` is its own, so it must keep it
	nested: (function () {
		return typeof this;
	}).call({})
};
