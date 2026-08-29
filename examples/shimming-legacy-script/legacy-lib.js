"use strict";

// A vendor script written for a `<script>` tag: it reads `$` as a global, assigns
// to the global through `this`, and expects the polyfill to have run already.
this.legacyLib = { version: "1.0.0" };

module.exports = {
	render() {
		return `${$(".app")} ${globalThis.legacySupport} v${globalThis.legacyLib.version}`;
	}
};
