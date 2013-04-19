---
layout: tutorial
title: Authoring UMD Modules
tags: ['modules', 'umd', 'amd', 'commonjs', 'curl']
url: '/tutorials/modules/authoring-umd-modules'
urls: ['/tutorials/modules/authoring-umd-modules.html.md']
toc: true
ctime: 2013-03-25
mtime: 2013-03-25
order: 3
---

If you plan to run your code in a browser, [AMD modules](./authoring-amd-modules.html.md) are a great choice.  However, if your code will run in a server-side environment, such as RingoJS or node.js, [CommonJS modules](./authoring-cjs-modules.html.md) are probably the easiest option.  

What if you need your code to run in browsers and server-side environments?  

Furthermore, even if you never plan to use your code in a server-side environment, testing in node.js can be incredibly convenient.  Why not write it to work in both?

> Q: How do we write Javascript modules that will execute in multiple environments?

> *A: Universal Module Definition!*

UMD patterns are designed to provide compatibility with multiple environments.  Many, but not all, UMD patterns do this by wrapping your module code in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/).  The resulting environment inside the IIFE is normalized to the particular environment that your module code expects by mocking and/or injecting variables.  The code outside the function bridges the environment inside the IIFE to the outside environment.  The normalized environment inside the IIFE is typically very AMD-like or very CommonJS-like, depending on the specific UMD flavor.  

There are dozens of UMD variations in use in the wild.  There are several in this [UMD repo](https://github.com/umdjs/umd), as well as some other [robust onces](https://gist.github.com/unscriptable/4118495) around the web.

Many of these patterns also provide a way to expose your module as a global variable (or property on a global variable).  ***Don't do this!***  Your application code should never declare any globals.  **Globals will make your code harder to reuse and harder to test.**  Besides, [modules are the future of Javascript](http://wiki.ecmascript.org/doku.php?id=harmony:modules), so why fight it?

To help you decide which of the dozens of UMD patterns is best for your needs, we've picked our favorites.  These are very generic and should work great for your modules.  They work in virtually all environments, including browsers from the old Netscape 7.2 and IE6 days to cutting edge Firefox and Chromium releases, as well as server-side environments like RingoJS and node.js.

Here they are in no particular order.

---

If you haven't done so already, please review the tutorials on [Authoring AMD modules](./authoring-amd-modules.html.md) and [Authoring CommonJS modules](./authoring-cjs-modules.html.md) before proceeding.

---

## Normalize to classic AMD

If you're converting AMD modules with dependency lists, this pattern will require very little refactoring.

```js
// app/CachingStore
(function (define) {

// dependencies are listed in the dependency array
define(['./store', 'meld'], function (store, meld) {
"use strict";
  var cache = {};

	// create the module
	meld.around(store, 'get', function (jp) {
		var key = jp.args.join('|');
		return key in cache ? cache[key] : cache[key] = jp.proceed();
	};

	// return your module's exports
	return store;
});

}(
	typeof define == 'function' && define.amd 
		? define 
		: function (ids, factory) { 
			// note: the lambda function cannot be removed in some CJS environments
			var deps = ids.map(function (id) { return require(id); };
			module.exports = factory.apply(null, deps); 
		}
));
```

The entire module is wrapped in an IIFE and the `define` function is passed in as parameter.  At the bottom of the file, the code snippet, `typeof define == 'function' && define.amd`, is the standard "sniff" for an AMD environment.  If the sniff evaluates to `true`, then the environment is AMD and the global `define` is passed into the IIFE.  You "export" your module in the usual AMD way by returning something from the factory.  

If the AMD-sniff evaluates to `false`, the code assumes a node.js-like CommonJS environment.  To work with your AMD code, the IIFE injects a function that behaves similarly to AMD's `define`: it resolves all of the ids to modules and injects them into the factory function as arguments.  It then takes the return value from the factory and sets `module.exports` in typical node.js fashion.

## Normalize to an AMD factory with injected require()

If you're already specifying dependencies using AMD's "local require", this pattern won't feel like much of a change.  

```js
// app/CachingStore
(function (define) {

// using the define signature that triggers AMD-wrapped CommonJS
define(function (require) {
"use strict";
	var store, meld, cache = {};

	// use the injected require() to specify dependencies
	store = Object.create(require('./store'));
	meld = require('meld');

	// create the module
	meld.around(store, 'get', function (jp) {
		var key = jp.args.join('|');
		return key in cache ? cache[key] : cache[key] = jp.proceed();
	};

	// return your module's exports
	return store;
});
}(
	typeof define == 'function' && define.amd 
		? define 
		: function (factory) { module.exports = factory(require); }
));
```

Again, the entire module is wrapped in an IIFE and the `define` function is injected as parameter.  The code at the bottom of the IIFE is a bit simpler this time since we're more closely mimicking CommonJS than the previous pattern.  In fact, we're just injecting CommonJS's scoped `require` in place of AMD's "local require".  Finally, `module.exports` receives the the return value of the factory.

The cujo.js team uses this pattern quite often.

## Normalize to full AMD-wrapped CommonJS

If your module code is already in node.js or CommonJS format, here's a wrapper that let's you keep it that way.

```js
// app/CachingStore
(function (define) {

// note: we're injecting all three CommonJS scoped variables
define(function (require, exports, module) {
"use strict";
	var store, meld, cache = {};

	// use CommonJS patterns to require() dependencies
	store = Object.create(require('./store'));
	meld = require('meld');

	// create the module
	meld.around(store, 'get', function (jp) {
		var key = jp.args.join('|');
		return key in cache ? cache[key] : cache[key] = jp.proceed();
	};

	// you can use node.js and/or pure CommonJS export patterns!
	exports.store = store;
});
}(
	typeof define == 'function' && define.amd 
		? define 
		: function (factory) { factory(require, exports, module); }
));
```

This time, we're injecting all three of the CommonJS scoped variables.  The environment inside the IIFE is very CommonJS-like and will probably work for all modules that don't access environment-specific variables, such as node's `__dirname`.  

Note that the factory *does not return the exports* in this variation.  It expects that you'll decorate the provided `exports` object or assign to `module.exports`.

'Tis the season for wrapping!
