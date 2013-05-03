---
layout: tutorial
title: Authoring CommonJS modules
tags: ['modules', 'commonjs', 'curl']
url: '/tutorials/modules/authoring-cjs-modules'
urls: ['/tutorials/modules/authoring-cjs-modules.html.md']
toc: true
ctime: 2013-03-25
mtime: 2013-03-26
order: 2
---

CommonJS modules were conceived during the early days of server-side JavaScript environments such as node.js and Narwhal.  Thus CommonJS modules are optimized for these environments, not browser environments.

In the browser, you typically minimize slow HTTP fetches.  You concatenate the bulk of your code into a handful of bundles.  Server-side engines can ignore these hassles because file access is nearly instantaneous, which allows them to limit each file to *exactly* one module.  This 1:1 file-to-module pattern is desirable for several reasons:

* Each module can be authored individually, which increases team scalability.
* Each module can be debugged independently, which decreases testing costs.
* Each module's scope and context can be controlled, which can be used to isolate the modules.

The last point is worth investigating further.  

Server-side environments are not encumbered by the shared global scope of browsers.  Rather than inject global variables, such as `document` and `window`, into the scope of the module, they can inject module-specific variables that can be used to help author the module.  

The CommonJS Modules 1.1 specification standardized these *scoped variables*: `require`, `exports`, and `module`.  Let's explore these by looking at the code of a very simple CommonJS module:

```js
// module app/mime-client
var rest, mime, client;

rest = require('rest');
mime = require('rest/interceptor/mime');

client = rest.chain(mime);

// debug
console.log(module.id); // should log "app/mime-client"

exports.client = client;
```

Note the absence of a wrapper around this code, such as an [Immediately Invoked Function Expression (IIFE)](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) or [AMD](./authoring-amd-modules.html.md)'s `define(factory)`.  It also appears as if we are working with global variables.  We are not!  Because each file executes in its own *module scope*, the `var` statements actually declare variables that are scoped to the module, just as if it were wrapped in a function.  

Of course, the three CommonJS variables, `require`, `exports`, and `module`, are also scoped to the module.  Let's investigate each one in detail.

## require

If your module requires other modules to do its work, you can declare references to the other modules into the current module's scope by using the `require` function.  Call `require(id)` for each module.  Typically, you assign each module to a local variable.  This example pulls in references to two modules: "rest" and "rest/interceptor/mime".  

Notice that "rest/interceptor/mime" has slashes in it much like a file path or a url.  However, it is neither!  Like AMD, CommonJS uses slashes to signify namespaces for modules.  The name before the first slash is the *package name*.  CommonJS modules are almost always grouped with related modules into a larger structure known as a *package*.  

## exports

The most critical CommonJS variable is `exports`.  This object becomes the public API of your module.  It is the only part of your module that is exposed to the rest of the environment.  All objects, functions, constructors, and so forth that your module provides must be declared as properties of the `exports` object.  The example assigns the `client` property to the `client` function that was returned from `rest.chain(mime)`.  The rest of the module is not exposed.

## module

The `module` variable was originally conceived to provide metadata about the module.  It holds the `id` and unique `uri` of each module.  However, to overcome an inconvenience with the `exports` pattern (see "Comparing exports and module.exports" below), node.js extended `module` to expose the `exports` object as a property.  Other environments follow this lead, so that you see many modules use `module.exports`.

### Comparing exports and module.exports

The `exports` variable is an object literal.  It holds all the functions and properties that your module provides.  This authoring pattern allows developers to *intentionally* create *resolvable* circular dependencies.  

However, what if your module is simply a function, a constructor, or a string template?  Many developers believe that a module should be able to export any object, *especially functions*, despite the risk of creating an unresolvable circular dependency.  Therefore, `module.exports` was born.

Let's contrast how the two different export patterns look. 

In the previous code sample, a dependent module would acquire the `client` function with the following code:

```js
// we have to require the client module and then access the client property
var client = require('app/mime-client').client;
```

If the module exports only the `client` function, then why dereference it at all?  Instead, you can rewrite the module using `module.exports`:

```js
// module app/mime-client
var rest, mime, client;

rest = require('rest');
mime = require('rest/interceptor/mime');

client = rest.chain(mime);

// debug
console.log(module.id); // should log "app/mime-client"

// here is the interesting bit:
module.exports = client;
```

Now we can consume `client` more intuitively:

```js
// this is much cleaner!
var client = require('app/mime-client');
```

## Limitations of CommonJS modules

Many developers view CommonJS as a clean authoring format for modules.  However, browsers cannot consume the modules directly because browsers do not create the CommonJS-scoped variables.  Performance also suffers dramatically when browsers must load dozens or hundreds of modules in any non-trivial application.  You resolve this problem by using tools that generate *transport formats* to allow CommonJS modules to be concatenated and wrapped so they can operate in browsers.  Many of these tools use AMD for the transport format because it does the job efficiently and is so widely supported.

For example, cujo.js's cram.js wraps CommonJS modules inside AMD modules and bundles all the modules together for efficient loading.

Unfortunately, most of these tools require a build step to convert from an authoring format to a transport format.  ujo.js's curl.js does *not* require a build step, in most cases.  The build step complicates the development process and makes it harder to get started on a new project.

*Why can't we just write in a module format that's friendly to both server and browser environments?*  Actually, we can!  It's called UMD, Universal Module Format, but that's a topic for our next lesson.

For further reading on CommonJS Modules, visit http://wiki.commonjs.org/wiki/Modules/1.1/.
