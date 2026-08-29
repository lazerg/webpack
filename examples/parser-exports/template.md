# Adding exports to a module

Some files export nothing: a legacy script that only defines globals, a vendored file, a bundle that was never written as a module. `module.rules[].parser.exports` (`module.parser.javascript.exports` for every module) adds the exports webpack should see, without a loader and without touching the file.

`"single Legacy"` and `"multiple a b"` generate CommonJs exports, `"default Thing"` and `"named a b"` generate ES module exports — the latter take part in tree shaking, mangling and scope hoisting like an `export` written in the source.

# example.js

```javascript
_{{example.js}}_
```

# legacy-global.js

```javascript
_{{legacy-global.js}}_
```

# math.js

```javascript
_{{math.js}}_
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
