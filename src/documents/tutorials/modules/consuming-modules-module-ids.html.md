---
layout: tutorial
title: Consuming modules: Module ids
tags: ['modules', 'curl']
url: '/tutorials/modules/consuming-modules-module-ids'
urls: ['/tutorials/modules/consuming-modules-module-ids.html.md']
toc: true
ctime: 2013-04-11
mtime: 2013-06-04
order: 4
---

As we discussed briefly in
[Authoring AMD Modules](./authoring-amd-modules.html.md), some modules require
other modules to do their work.  The module author specifies these other
modules by listing each module's *id* in the dependency list or in a
"local require".

## Module ids

AMD and CommonJS both specify module ids that look very much like file paths or
urls: ids consist of *terms* separated by slashes.  The definition of "terms"
is fairly loose.  The CommonJS
[spec](http://wiki.commonjs.org/wiki/Modules/1.1#Module_Identifiers) further
restricts "terms" to be camelCase Javascript identifiers, but in practice,
other popular file name characters, such as `-` are acceptable.  The
proposed ES6 modules
[spec](http://wiki.ecmascript.org/doku.php?id=harmony:modules) is much more
flexible, but, realistically, ids should be compatible with file systems
and urls.

AMD reserves the `!` character to indicate that a
[Loader Plugin](https://github.com/amdjs/amdjs-api/wiki/Loader-Plugins) should
be used to load the module or other type of resource.

Some examples of acceptable module ids:

```
"wire/lib/functional"
"poly/es5-strict"
"app/billing/billTo/Customer"
"jquery"
```

As with file systems and urls, the slashes delineate organizational
hierarchies.  Typically, these hierarchies are mirrored by identical
directory structures in the underlying file system, but this mirroring is not guaranteed.
For example, curl.js exposes some extensibility API modules.  These modules
have ids of the form "curl/<submodule>", but they don't actually exist as
files.

Be careful to capitalize correctly.  Because most modules typically map
to files, spell and capitalize the module name exactly the
same as the file name.  For example, "jQuery" is almost always *not*
the correct module id (capital "Q")!  Here's how you would require jQuery
in a module:

```js
define(function (require) {

	var $ = require('jquery');
	$('body').text('Hello world!');

});
```

## Reserved ids

Most AMD environments reserve a few special module ids to refer to built-in
modules and utilities.  For example, most AMD environments reserve the
"require", "exports", and "module" ids to gain access to pseudo-modules that
simulate the *free variables* of CommonJS.  AMD environments may reserve
a few other ids, as well.  For example, a proposed feature of
curl.js 0.8 is a `global` pseudo-module to help devs create code that works
on the server and the browser.

```js
define(function (require) {

	// inspect the CommonJS "module" var
	var module = require('module');
	console.log(module.uri, module.id);

});
```

Check your AMD environment's documentation for more information about
reserved module ids.

## Relative Ids

AMD and CommonJS also support the notion of *relative* module identifiers.
Modules that reside in the same hierarchical level can be referenced by using
 `./` at the beginning of the id.  Modules that reside one level up
from the current level can be referenced using `../`.

At run time or build time, the AMD environment must translate relative ids
to *absolute* ids.  Absolute ids are rooted at the top level of the module
hierarchy and contain no `..` or `.`.  The process of removing the leading
`..` or `.` is called "normalization".  For example, assuming
app/billing/billTo/Customer is the id of the current module, the environment
normalizes required ids as follows:

```js
// module app/billing/billTo/Customer
define(function (require) {

	// normalizes to "app/billing/billTo/store"
	var store = require("./store");

	// normalizes to "app/billing/payee/Payee"
	var Payee = require("../payee/Payee");

});
```

AMD and CommonJS also recognize bare `.` and `..` as module identifiers.  `.`
normalizes to the module whose name is the same as the current level. `..`
normalizes to the module whose name is the same as the level that is one
level up from the current level.  _Yes, that is confusing!_  Perhaps that's
why you don't see these used often.  Hopefully, some examples might help.
For example, given that the current module is "app/billing/billTo/Customer", 
the environment normalizes these ids as follows:

```js
// module app/billing/billTo/Customer
define(function (require) {

	// normalizes to "app/billing/billTo" (a module, not a folder!)
	var billTo = require(".");

	// normalizes to "app/billing" (a module, not a folder!)
	var billing = require("..");

});
```

_Hint:_ Never use relative module ids to reference unrelated modules!  Relative
modules are meant to be used *within* a "package" (defined later).  Also,
more than one set of `../` may be a code smell that you need to organize
your modules better.  The relative id may also be interpreted as a url, rather
than an id by an AMD environment.

```js
// module app/billing/billTo/Customer
define(function (require) {

	// questionable: normalizes to "common/payee/Payee"
	var Payee = require("../../common/payee/Payee");

	// BAD: normalizes to "../util/date" -- a URL, not an ID!
	var Date = require("../../../util/Date");

	// GOOD: use an absolute id to reference a different package
	var Date = require("util/Date"); // "Date" module in the "util" package

});
```

> So, how does the AMD environment know where to find modules if I specify
ids and not urls?

That's the topic of [Consuming modules: locating modules in AMD](./consuming-locating-modules-in-amd.html.md).
