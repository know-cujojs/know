---
layout: tutorial
title: Authoring AMD Modules
tags: ['modules', 'amd', 'curl']
url: '/tutorials/modules/authoring-amd-modules'
urls: ['/tutorials/modules/authoring-amd-modules.html.md']
toc: true
ctime: 2013-03-25
mtime: 2013-03-25
order: 1
---

Asynchronous Module Definition (AMD) is the most widely supported JavaScript module format.  It's used by cujo.js, jQuery, dojo, Mootools, and dozens of other libraries and frameworks.  AMD is optimal in any browser environment, but you can also use it in non-browser environments.  

Authoring AMD modules is super easy.  There are just three things to remember:

1. Wrap your code in a `define()`.
2. List your dependencies.
3. Return (or export) something!

## define()

The `define` function announces to the AMD environment that you want to declare a module.  The signature of this function is pretty flexible, but let's start by focusing on the most common usage.

  define(dependencyIds, factoryFunction);

As you can see from the first parameter, `dependencyIds`, you can pass an array of ids into `define`.  These are the ids of other modules that your module requires to do its work.  The second parameter, `factoryFunction`, creates your module and will be run *exactly once*.  The factory is called with the dependent modules as parameters.  Furthermore, it is guaranteed to run only after all of the dependencies are known to be available.  In practice, the factory typically runs just before it is needed.

Here's a very short example.  

```js
// module app/mime-client
define(['rest', 'rest/interceptor/mime'], function (rest, mime) {
	var client;

	client = rest.chain(mime);

	return client;
});
```

Our module, "app/mime-client", relies on two other modules, "rest" and "rest/interceptor/mime".  The two dependent modules are mapped onto the factory's parameter list as `rest` and `mime`.  You may name these however you wish, of course.  

Note that slashes in a module id do not indicate it is an URL.  AMD ids use slashes for *namespacing*.  In this example, the app/mime-client module depends on a module in the "rest/interceptor" namespace.  (You're getting a sneak preview of AMD "packages" here.  We'll cover those in more detail in another tutorial.)  

Inside the factory, we create the "app/mime-client" module *and return it*.  In this case, our module is a function since [rest.js](//github.com/cujojs/rest) is a suite of composable REST functions.  However, you can create modules that are *any valid Javascript type*.

## AMD-Wrapped CommonJS

AMD supports another `define` signature that helps bridge the gap between AMD and [CommonJS](./authoring-cjs-modules.html.md).  If your factory function accepts parameters, but you omit the dependency array, the AMD environment assumes you wish to emulate a CommonJS module environment.  The standard `require`, `exports`, and `module` variables are injected as parameters to the factory.  This variation is known as AMD-wrapped CommonJS.

Here's the previous example as AMD-wrapped CommonJS.

```js
// module app/mime-client
define(function (require, exports, module) {
	var rest, mime, client;

	rest = require('rest');
	mime = require('rest/interceptor/mime');

	client = rest.chain(mime);

	module.exports = client;
});
```

Notice that the factory receives *up to* three arguments that emulate the CommonJS `require`, `exports`, and `module` variables.  In CommonJS, dependencies are assigned to local variables using `require(id)`.  You should "export" your module, rather than return it.  You can export in one of two ways.  The simplest way, shown above, is to assign directly to `module.exports`. Note: `module.exports = ` is not strictly CommonJS.  However, it is a node.js extension to CommonJS that is widely supported.  

The second way is to set properties on the `exports` object.  There are use cases for each export mechanism, but that's a great topic for an upcoming tutorial.  

## Other Variations

There are many other variations of `define` parameters and even variations of the AMD-wrapped CommonJS format -- too many to cover in a simple tutorial.  However, as you're browsing other cujo.js tutorials, there's one more variation you'll see a lot.  We recommend the following variation when declaring [wire.js](//github.com/cujojs/wire) "spec" modules.  

```js
define({
    message: "I haz been wired",
    helloWired: {
        create: {
            module: 'hello-wired',
            args: { $ref: 'dom!hello' }
        },
        init: {
            sayHello: { $ref: 'message' }
        }
    },
    plugins: [
        { module: 'wire/dom' }
    ]
});
```

As you can see, the `factoryFunction` parameter does not have to be a function!  In the case above, the module is defined as an object literal.  The AMD environment detects non-functions in the last position and automatically wraps them in a factory function.    Also, because this module does not have explicit dependencies, we can skip the dependency array, too.  

Pretty simple, no?

For further reading on AMD modules, visit https://github.com/amdjs/amdjs-api/wiki/.
