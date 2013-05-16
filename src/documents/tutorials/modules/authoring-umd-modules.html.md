---
layout: tutorial
title: Authoring UMD modules
tags: ['modules', 'umd', 'amd', 'commonjs', 'curl']
url: '/tutorials/modules/authoring-umd-modules'
urls: ['/tutorials/modules/authoring-umd-modules.html.md']
toc: true
ctime: 2013-03-25
mtime: 2013-03-25
order: 3
---

If you run your code in a browser, [AMD modules](./authoring-amd-modules.html.md) are a great choice.  If your code runs in a server-side environment, such as RingoJS or node.js, [CommonJS modules](./authoring-cjs-modules.html.md) are probably the easiest option. Even if you don't use the code on the server side, testing in node.js can be convenient.

So what if you need your code to run in both browsers and servers?

You use Universal Module Definition (UMD) to write Javascript modules that execute in multiple environments. 

##Understanding UMD patterns

UMD patterns provide compatibility with multiple environments.  Many but not all UMD patterns do this by wrapping your module code in an [Immediately Invoked Functional Expression (IIFE)](http://benalman.com/news/2010/11/immediately-invoked-function-expression/).  The resulting environment inside the IIFE is normalized to the particular environment that your module code expects by mocking and/or injecting variables.  The code outside the function bridges the environment inside the IIFE to the outside environment.  Typically, the normalized environment inside the IIFE is comparable to AMD or CommonJS, depending on the specific UMD flavor.  

Dozens of UMD variations are available.  You can find several in this [UMD repo](https://github.com/umdjs/umd), and [other robust UMD patterns](https://gist.github.com/unscriptable/4118495) around the web.

Many patterns also enable you to expose your module as a global variable or as a property on a global variable. Do not do this! ***Your application code should never declare globals. Globals make your code harder to reuse and harder to test.***  Besides, [modules are the future of Javascript](http://wiki.ecmascript.org/doku.php?id=harmony:modules), so why fight it?

To find the best UMD pattern for your environment, check out the generic patterns described in the following sections.  They work in essentially all environments, from Netscape 7.2 and IE6 to current Firefox and Chromium releases, as well as server-side environments like RingoJS and node.js.

---

If you have not done so, please review the tutorials on [Authoring AMD modules](./authoring-amd-modules.html.md) and [Authoring CommonJS modules](./authoring-cjs-modules.html.md) before proceeding.

---

## Normalize to classic AMD

If you are converting AMD modules with dependency lists, this pattern requires very little refactoring.

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

The entire module is wrapped in an IIFE, and the `define` function is passed in as a parameter.  At the bottom of the file, the code snippet, `typeof define == 'function' && define.amd`, is the standard "sniff" for an AMD environment.  If the sniff evaluates to `true`, then the environment is AMD and the global `define` is passed into the IIFE.  You "export" your module in the usual AMD way by returning something from the factory.  

If the AMD-sniff evaluates to `false`, the code mimics a node.js, CommonJS environment.  To work with your AMD code, the IIFE injects a function that behaves similarly to AMD's `define`: it resolves all ids to modules and injects them into the factory function as arguments.  It then takes the return value from the factory and sets `module.exports` in typical node.js fashion.

## Normalize to an AMD factory with injected require()

If you already specify dependencies using AMD's "local require", this pattern will be fairly familiar.  

```js
// app/CachingStore
(function (define) {

// using the define signature that triggers AMD-wrapped CommonJS
define(function (require) {


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

Again, the entire module is wrapped in an IIFE, and the `define` function is injected as parameter.  The code at the bottom of the IIFE is a bit simpler this time because it more closely mimics CommonJS than the previous pattern.  It injects CommonJS's scoped `require` in place of AMD's "local require".  Finally, `module.exports` receives the the return value of the factory.

The cujo.js team uses this pattern quite often.

## Normalize to full AMD-wrapped CommonJS

If your module code is already in node.js or CommonJS format, you can use this wrapper to keep it that way.

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

This time, all three CommonJS scoped variables (require, exports, module) are injected.  The environment inside the IIFE mimics CommonJS and probably works for all modules that do not access environment-specific variables, such as node's `__dirname`.  

Note that the factory *does not return the exports* in this variation.  It is expected that you will add properties and methods to the provided `exports` object or assign to `module.exports`.

'Tis the season for wrapping!
