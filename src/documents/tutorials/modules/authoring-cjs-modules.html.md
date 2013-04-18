---
layout: tutorial
title: Authoring CommonJS Modules
tags: ['modules', 'commonjs', 'curl']
url: '/tutorials/modules/authoring-cjs-modules'
urls: ['/tutorials/modules/authoring-cjs-modules.html.md']
ctime: 2013-03-25
mtime: 2013-03-26
order: 2
---

CommonJS modules were conceived during the early days of server-side JavaScript environments such as node.js and Narwhal.  As a result, CommonJS modules are optimized for these environments, not browser environments.

In the browser, we've been conditioned to minimize slow HTTP fetches.  We typically concatenate the bulk of our code into a handful of bundles.  Server-side engines could ignore these hassles since file access is nearly instantaneous.  This allowed them to limit each file to *exactly* one module.  This 1:1 file-to-module pattern is desirable for several reasons:

1. Each module can be authored individually, which increases team scalability.
2. Each module can be debugged independently, which decreases testing costs.
3. Each module's scope and context can be controlled, which can be used to isolate the modules.

The last point is worth investigating further.  

Server-side environments weren't encumbered by the shared global scope of browsers.  So, rather than inject "global" variables, such as `document` and `window`, into the scope of the module, they could inject module-specific variables that could be used to help author the module.  

The CommonJS Modules/1.1 spec standardized these *scoped variables*: `require`, `exports`, and `module`.  Let's explore these by looking at the code of a very simple CommonJS module:

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

The first thing you might notice is that there's no wrapper around this code, such as an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) or [AMD](./authoring-amd-modules.html.md)'s `define(factory)`.  It also appears as if we are working with global variables.  We are not!  Since each file executes in its own *module scope*, the `var` statements actually declare variables that are scoped to the module, just as if it were wrapped in a function.  

Of course, the three CommonJS variables, `require`, `exports`, and `module`, are also scoped to the module.  Let's investigate each one in detail.

## require

If your module requires other modules to do its work, you can declare references to the other modules into the current module's scope by using the `require` function.  Call `require(id)` for each of the modules needed.  Typically, you'll want to assign each module to a local variable.  In our example, we have pulled in references to two modules: "rest" and "rest/interceptor/mime".  

Notice that "rest/interceptor/mime" has slashes in it much like a file path or a URL.  However, it is neither!  Like AMD, CommonJS uses slashes to namespace modules.  The name before the first slash is the *package name*.  CommonJS modules are almost always grouped with related modules into a larger structure, called a "package".  

## exports

The most critical of CommonJS's variables is `exports`.  This object becomes the public API of your module.  It is the only part of your module that will be exposed to the rest of the environment.  All objects, functions, constructors, etc. that your module will provide must be declared as properties of the `exports` object.  In the sample, we have assigned the `client` property to the `client` function that was returned from `rest.chain(mime)`.  The rest of the module is not exposed.

## module

The `module` variable was originally conceived to provide meta-data about the module.  It holds the `id` and unique `uri` of each module.  However, to overcome an inconvenience with the `exports` pattern (see below), node.js extended `module` to expose the `exports` object as a property.  Many other environments have followed node.js's lead, so you'll see many modules use `module.exports`.

### exports vs. module.exports

You may have noticed that `exports` is an object literal.  It's basically a "bag of functions and properties".  It's a bit involved to discuss here, but this authoring pattern allows developers to *intentionally* create *resolvable* circular dependencies.  

However, what if your module is simply a function, a constructor, or a string template?  Enough developers felt strongly that a module should be able to export any object, *especially functions*, despite the chance that a developer could create an unresolvable circular dependency.  Therefore, `module.exports` was born.

Let's contrast how the two different export patterns look. 

In the previous code sample, a dependent module would acquire the `client` function with the following code:

```js
// we have to require the client module and then access the client property
var client = require('app/mime-client').client;
```

If the only thing that the module exports is the `client` function, then why dereference it at all?  Let's rewrite the module using `module.exports` so we don't have to:

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

## Limitations of CommonJS Modules

Many developers view CommonJS as a very clean *authoring format* for modules.  However, browsers can't consume them directly because browsers don't create the CommonJS scoped variables.  Performance also suffers dramatically when browsers must load dozens or hundreds of modules in any non-trivial application.  Therefore, developers have devised tools that generate *transport formats* to allow CommonJS modules to be concatenated and wrapped so they can operate in browsers.  Many of these tools just use AMD for the transport format since it does the job efficiently and is so widely supported.

For instance, cujo.js's cram.js will wrap CommonJS modules inside AMD modules and bundle all the modules together for efficient loading.

Unfortunately, most of these tools require a build step to convert from an authoring format to a transport format.  (cujo.js's curl.js does not require a build step, in most cases.)  The build step complicates the development process and makes it harder to get started on a new project.

*Why can't we just write in a module format that's friendly to both server and browser environments?*  Actually, we can!  It's called UMD, Universal Module Format, but that's a topic for our next lesson.

For further reading on CommonJS Modules, visit http://wiki.commonjs.org/wiki/Modules/1.1/.
