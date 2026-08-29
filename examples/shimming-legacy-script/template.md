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
_{{example.js}}_
```

# legacy-lib.js

```javascript
_{{legacy-lib.js}}_
```

# shim.js

```javascript
_{{shim.js}}_
```

# webpack.config.js

```javascript
_{{webpack.config.js}}_
```

# dist/output.js

```javascript
_{{dist/output.js}}_
```

# Info

## Unoptimized

```
_{{stdout}}_
```

## Production mode

```
_{{production:stdout}}_
```
