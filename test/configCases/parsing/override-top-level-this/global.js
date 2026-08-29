this.legacyGlobal = "set";
this.legacyMethod = () => "called";

module.exports = {
	read: this.legacyGlobal,
	called: this.legacyMethod(),
	onGlobal: globalThis.legacyGlobal
};
