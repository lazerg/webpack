"use strict";

// Runs before the vendor script, whether or not the script names it.
require("./polyfill");

// The exact-match (`$`) alias in the configuration does not match this request,
// so the real file is reached here rather than the shim itself.
module.exports = require("./legacy-lib.js");
