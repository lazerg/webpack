# Shimming a legacy script

A script written for a `<script>` tag expects things a module does not get: a library
on a global, `this` as the window, and a polyfill evaluated before it. webpack shims
all three without a loader, which is what `imports-loader` was used for.

| `imports-loader` option                 | webpack                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| `imports: "default jquery $"`           | `ProvidePlugin`, which binds the name where it is read          |
| `imports: "side-effects ./polyfill"`    | a shim module `resolve.alias` points the request at             |
| `wrapper: "window"` / `this=>window`    | `module.rules[].parser.overrideTopLevelThis: "global"`          |
| `additionalCode: "var define = false;"` | `module.rules[].parser.amd: false` (or `browserify`/`commonjs`) |

`overrideTopLevelThis` takes `"global"` — `globalThis` where the target has it, and
`__webpack_require__.g` where it does not, so it holds on `node`, `webworker` and
neutral targets too — or `"undefined"`, which is what an ES module already answers.
An ES module keeps that answer whatever the option says.

# example.js

```javascript
const legacy = require("legacy-lib");

console.log(legacy.render());
```

# legacy-lib.js

```javascript
"use strict";

// A vendor script written for a `<script>` tag: it reads `$` as a global, assigns
// to the global through `this`, and expects the polyfill to have run already.
this.legacyLib = { version: "1.0.0" };

module.exports = {
	render() {
		return `${$(".app")} ${globalThis.legacySupport} v${globalThis.legacyLib.version}`;
	}
};
```

# shim.js

```javascript
"use strict";

// Runs before the vendor script, whether or not the script names it.
require("./polyfill");

// The exact-match (`$`) alias in the configuration does not match this request,
// so the real file is reached here rather than the shim itself.
module.exports = require("./legacy-lib.js");
```

# webpack.config.js

```javascript
"use strict";

const path = require("path");
const { ProvidePlugin } = require("webpack");

/** @type {import("../../").Configuration} */
module.exports = {
	mode: "none",
	resolve: {
		alias: {
			// `$` matches the request exactly, so `shim.js` can still reach the real file
			"legacy-lib$": path.resolve(__dirname, "shim.js")
		}
	},
	module: {
		rules: [
			{
				test: /legacy-lib\.js$/,
				parser: {
					// top-level `this` is the platform global, not `module.exports`
					overrideTopLevelThis: "global"
				}
			}
		]
	},
	plugins: [
		// binds `$` in every module that reads it without declaring it
		new ProvidePlugin({ $: path.resolve(__dirname, "jquery.js") })
	]
};
```

# dist/output.js

```javascript
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/*!*****************!*\
  !*** ./shim.js ***!
  \*****************/
/*! dynamic exports */
/*! export render [provided] [no usage info] [provision prevents renaming (no use info)] -> ./legacy-lib.js .render */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// Runs before the vendor script, whether or not the script names it.
__webpack_require__(/*! ./polyfill */ 2);

// The exact-match (`$`) alias in the configuration does not match this request,
// so the real file is reached here rather than the shim itself.
module.exports = __webpack_require__(/*! ./legacy-lib.js */ 3);


/***/ }),
/* 2 */
/*!*********************!*\
  !*** ./polyfill.js ***!
  \*********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

"use strict";


globalThis.legacySupport = "loaded";


/***/ }),
/* 3 */
/*!***********************!*\
  !*** ./legacy-lib.js ***!
  \***********************/
/*! default exports */
/*! export render [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.g, module, __webpack_require__.* */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var $ = __webpack_require__(/*! ./jquery.js */ 4);


// A vendor script written for a `<script>` tag: it reads `$` as a global, assigns
// to the global through `this`, and expects the polyfill to have run already.
__webpack_require__.g.legacyLib = { version: "1.0.0" };

module.exports = {
	render() {
		return `${$(".app")} ${globalThis.legacySupport} v${globalThis.legacyLib.version}`;
	}
};


/***/ }),
/* 4 */
/*!*******************!*\
  !*** ./jquery.js ***!
  \*******************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 4:0-14 */
/***/ ((module) => {

"use strict";


// Stands in for a real vendor library exposing a global.
module.exports = function $(selector) {
	return `element(${selector})`;
};


/***/ })
/******/ 	]);
```

<details><summary><code>/* webpack runtime code */</code></summary>

``` js
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ 	
/************************************************************************/
```

</details>

``` js
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./example.js ***!
  \********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__ */
const legacy = __webpack_require__(/*! legacy-lib */ 1);

console.log(legacy.render());

})();

/******/ })()
;
```

# Info

## Unoptimized

```
asset output.js 4.12 KiB [emitted] (name: main)
chunk (runtime: main) output.js (main) 909 bytes (javascript) 221 bytes (runtime) [entry] [rendered]
  > ./example.js main
  dependent modules 840 bytes [dependent] 4 modules
  runtime modules 221 bytes 1 module
  ./example.js 69 bytes [built] [code generated]
    [used exports unknown]
    entry ./example.js main
webpack X.X.X compiled successfully
```

## Production mode

```
asset output.js 692 bytes [emitted] [minimized] (name: main)
chunk (runtime: main) output.js (main) 909 bytes (javascript) 221 bytes (runtime) [entry] [rendered]
  > ./example.js main
  dependent modules 840 bytes [dependent] 4 modules
  runtime modules 221 bytes 1 module
  ./example.js 69 bytes [built] [code generated]
    [no exports used]
    entry ./example.js main
webpack X.X.X compiled successfully
```
