"use strict";

// Stands in for a real vendor library exposing a global.
module.exports = function $(selector) {
	return `element(${selector})`;
};
