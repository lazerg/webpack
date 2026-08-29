# Adding exports to a module

Some files export nothing: a legacy script that only defines globals, a vendored file, a bundle that was never written as a module. `module.rules[].parser.exports` (`module.parser.javascript.exports` for every module) adds the exports webpack should see, without a loader and without touching the file.

`"single Legacy"` and `"multiple a b"` generate CommonJs exports, `"default Thing"` and `"named a b"` generate ES module exports — the latter take part in tree shaking, mangling and scope hoisting like an `export` written in the source.

# example.js

```javascript
import Legacy from "./legacy-global";
import { add, PI } from "./math";

console.log(new Legacy().version, add(PI, 1));
```

# legacy-global.js

```javascript
// A legacy script — it defines a constructor and exports nothing.
function Legacy() {
	this.version = "1.0.0";
}
```

# math.js

```javascript
// A vendored file — it defines values and exports nothing.
const PI = 3.14;

function add(first, second) {
	return first + second;
}
```

# webpack.config.js

```javascript
"use strict";

/** @type {import("../../").Configuration} */
module.exports = {
	module: {
		rules: [
			{
				test: /legacy-global\.js$/,
				// `module.exports = Legacy;`
				parser: { exports: "single Legacy" }
			},
			{
				test: /math\.js$/,
				// `export { add, PI };`
				parser: { exports: ["named add", "named PI"] }
			}
		]
	}
};
```

# dist/output.js

```javascript
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/*!**************************!*\
  !*** ./legacy-global.js ***!
  \**************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/***/ ((module) => {

// A legacy script — it defines a constructor and exports nothing.
function Legacy() {
	this.version = "1.0.0";
}

/* injected exports */
module.exports = Legacy;


/***/ }),
/* 2 */
/*!*****************!*\
  !*** ./math.js ***!
  \*****************/
/*! namespace exports */
/*! export PI [provided] [no usage info] [missing usage info prevents renaming] */
/*! export add [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PI: () => (/* binding */ PI),
/* harmony export */   add: () => (/* binding */ add)
/* harmony export */ });
// A vendored file — it defines values and exports nothing.
const PI = 3.14;

function add(first, second) {
	return first + second;
}


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
```

</details>

``` js
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!********************!*\
  !*** ./example.js ***!
  \********************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _legacy_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./legacy-global */ 1);
/* harmony import */ var _legacy_global__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_legacy_global__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./math */ 2);



console.log(new (_legacy_global__WEBPACK_IMPORTED_MODULE_0___default())().version, (0,_math__WEBPACK_IMPORTED_MODULE_1__.add)(_math__WEBPACK_IMPORTED_MODULE_1__.PI, 1));

})();

/******/ })()
;
```

# Info

## Unoptimized

```
asset output.js 4.8 KiB [emitted] (name: main)
chunk (runtime: main) output.js (main) 372 bytes (javascript) 883 bytes (runtime) [entry] [rendered]
  > ./example.js main
  runtime modules 883 bytes 4 modules
  dependent modules 252 bytes [dependent] 2 modules
  ./example.js 120 bytes [built] [code generated]
    [no exports]
    [used exports unknown]
    entry ./example.js main
webpack X.X.X compiled successfully
```

## Production mode

```
asset output.js 514 bytes [emitted] [minimized] (name: main)
chunk (runtime: main) output.js (main) 372 bytes (javascript) 672 bytes (runtime) [entry] [rendered]
  > ./example.js main
  runtime modules 672 bytes 3 modules
  dependent modules 116 bytes [dependent] 1 module
  ./example.js + 1 modules 256 bytes [built] [code generated]
    [no exports]
    [no exports used]
    entry ./example.js main
webpack X.X.X compiled successfully
```
