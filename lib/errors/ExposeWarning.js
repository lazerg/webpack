/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Alexander Akait @alexander-akait
*/

"use strict";

const WebpackError = require("./WebpackError");

/** @import Module from "../Module" */

class ExposeWarning extends WebpackError {
	/**
	 * Creates an instance of ExposeWarning.
	 * @param {string} message the warning message
	 * @param {Module} module the module that should be exposed
	 */
	constructor(message, module) {
		super(message);

		/** @type {string} */
		this.name = "ExposeWarning";
		this.module = module;
		this.hideStack = true;
	}
}

module.exports = ExposeWarning;
