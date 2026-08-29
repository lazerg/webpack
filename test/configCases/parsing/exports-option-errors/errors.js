"use strict";

module.exports = [
	{ message: /Unknown "unknown" syntax export in "unknown a" value/ },
	{ message: /Invalid "named a b c" value for export/ },
	{
		message:
			/Invalid "named {2}a" value for export, there must be only one separator/
	},
	{ message: /The "default" syntax can't have "b" alias in "default a b"/ },
	{
		message:
			/The "multiple" syntax export in "multiple b" value can't be mixed with "module" exports/
	},
	{
		message: /The "single" syntax export can't be mixed with "multiple" exports/
	},
	{ message: /The "module" format can't have multiple "default" exports/ },
	{ message: /Duplicate "a" identifiers found/ },
	{
		message:
			/Can't export "missing", the module has no top-level declaration with this name/
	},
	{ message: /Can't export "one", it is an imported binding/ },
	{ message: /Can't add CommonJs exports to an ES module/ }
];
