---
layout: tutorial
title: Consuming modules: Locating modules in AMD
tags: ['modules', 'curl']
url: '/tutorials/modules/consuming-locating-modules-in-amd'
urls: ['/tutorials/modules/consuming-locating-modules-in-amd.html.md']
toc: true
ctime: 2013-04-11
mtime: 2013-06-04
order: 5
---

In [module ids](./consuming-modules-module-ids.html.md), we noted that
slashes delineate terms, which represent hierarchies of modules.  Ultimately,
though, AMD environments must locate modules.  The ids must somehow resolve
to uris.  It's possible that the uris resolve to records in a database
or values in localStorage, for example.  However, most of the time, the
uri resolves to a file path on the server or a url in the browser.

## Default module location and base url

For *extremely simple* applications, you could hypothetically put all of the
modules in one location. Call this location the "base url".  The method for
resolving module ids would simply be basic string concatenation:

```
module url = base url + module id + ".js"
```

By default, most AMD loaders set the base url to the location of the html
document.  For example, if the html document is at
//know.cujojs.com/index.html, then a module with the id "blog/controller"
resides at //know.cujojs.com/blog/controller.js.  The ".js"
extension is added automatically when the AMD environment resolves the url.

Keeping your modules in the same location as your html documents can be
inconvenient.  Therefore, essentially all AMD environments allow the base url
to be set via configuration.  For example, if you configure the base url to
be "client/", the module id "blog/controller" resolves to
//know.cujojs.com/client/blog/controller.js.

The `require` variable that you can inject into your module has a method,
`toUrl(id)` that can be used to convert a module id to a url.  You'll
probably never use this in application code, but it's a nice utility for
exploring the id-to-url conversion.

```js
// module app/billing/billTo/Customer
// base url is client/
//document is //know.cujojs.com/index.html
define(function (require) {

	// resolves to "//know.cujojs.com/client/app/billing/billTo/store"
	var url = require.toUrl('./store');

});
```

### Module ids != urls

It's very easy to get started by setting the base url and putting a few
modules in that folder, but don't be lured into thinking that module ids
are simply shortened urls!  This pattern fails to scale beyond smallish
apps.  Larger apps require organizational strategies.  In another tutorial,
we'll explore an organizational strategy called "packages".

### Sometimes id == url, no?

> What if my module requires a library on a CDN?

Most AMD loaders allow urls to be specified in place of ids.  This is perfectly
valid:

```js
define(function (require) {

	// attempt to get "moment" by url
	var moment = require('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js');

});
```

However, there are several problems with this code:

* Hard-coding urls in code limits maintainability. What if you want to update
	to the latest version?
* The ".js" extension can trigger some AMD environments to use legacy,
	non-module behavior.  RequireJS, for instance will do this.
3.	Some AMD-aware libraries have hard coded ids into their files,
	unfortunately.  Moment.js, for instance, hard-coded the id, "moment"
	into its file, essentially squatting on this name.  Even worse,
	this means that in the example above, the AMD environment fetched a
	module named
	"//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js", but
	received a module named "moment".  The AMD environment will probably
	throw an error because the ids didn't match.

> So how do I use modules on a cross-domain server such as a CDN?

We'll get back to this shortly!

## Configuring id-to-uri mappings

Ultimately, you have to tell the AMD environment how to map ids to uris.
This is called _path mapping_ or _package mapping_ and is done through
configuration.

_By specifying the urls in a central configuration, instead of inside your
modules, you decrease maintenance costs and increase the portability
of your code._

Here's what the configuration looks like in most AMD environments:

```js
var config = {
	baseUrl: "client/apps",
	paths: {
		"blog": "blog", // this is redundant, unnecessary
		"dont": "../dont"
	}
};
```

In curl.js, you set the configuration using the global `curl` variable.
Lots of other AMD environments use this API, too:

```js
// auto-sniff for an object literal:
curl(config);

// or, more explicitly:
curl.config(config);
```

The `baseUrl` config property tells the AMD environment that all module ids
are resolved relative to the given url path.  The path could be absolute
(starts with a protocol or `//`), relative to the host (starts with a `/`),
or relative to the page as show above.

The `paths` config object is a mapping of module ids to urls.  You don't have
to specify every module your app uses.  You can simply specify the top term
in the module's hierarchy, and deeper modules are resolved by appending
their corresponding id  hierarchies.  For example, here's how a typical
AMD environment might resolve the module "dont/even" given the configuration
above:

* Construct a full base url by appending baseUrl to the page location:
	* "//know.cujojs.com/" + "client/" => "//know.cujojs.com/client/".
* Look up "dont/even" in the paths config.
	* Because it's not found, remove one level and look up "dont".
	* Find "dont" which maps to "../dont".
* Resolve the full url by appending "../dont" to the full base url:
	"//know.cujojs.com/client/../dont/even".

The `packages` config property also maps ids to urls, but in a more structured
way.  In curl.js, it also provides more advanced features.  Consider using
`packages` instead of `paths` in more sophisticated applications.

## Why multiple `../` is a code smell

To the AMD environment, the base url determines the "root" or "top level" of
the location of the module hierarchy.  Attempting to *traverse* above the
root doesn't make much sense.  Consider the following scenario:

```js
// module blog/controller
// base url is //know.cujojs.com/client/
define(function (require) {

	var dont = require("../../dont/please");

});
```

In order to resolve this relative id ("../../dont/please"), the AMD
environment must traverse up two levels before traversing back
down to "dont" and "please".

1. Start at the current level: "blog/controller" is at the "blog/" level
2. Traverse up one level: "blog/" --> "" (the top level)
3. Traverse up a second level: ???? (we can't, we're already at the top!)

How AMD environments handle this situation is *not defined* in any spec.
curl.js resolves it by assuming the id is actually a url and keeps the `../` so
the url can be normalized against the base url.  The implication is that
curl.js will load the module as usual, but will not recognize that "dont/please"
and "../../dont/please" are the same module.  This could cause double-loading
of the "dont/please" module. Furthermore, the module's factory could execute
twice, causing all sorts of problems, such as making singletons no longer be
single, etc.

_Note:_ curl.js also assumes that ids that start with `/` or a protocol
(`http:`, `https:`, etc.) are urls.

If you need to reference other modules using multiple `../`,
be sure to read the tutorial about packages!  Packages solve everything.
Seriously.  They do.

## Configuring id-to-remote-url mappings

Returning to the moment.js example, moment.js resides on a CDN, which
-- to our sensibilities -- sure seems like a url.  However, as we noted earlier,
moment.js declares that it has a module id of "moment".  Here's how we
reconcile remote urls:

```js
var config = {
	baseUrl: "client/apps",
	paths: {
		"moment": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js",
		"blog": "blog", // this is redundant, unnecessary
		"dont": "../dont"
	}
};
curl.config(config);
```

Now, if you have a module that requires moment.js, you can reference it by id:

```js
define(function (require) {

	// "moment" will resolve to //cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js
	var moment = require('moment');

});
```
