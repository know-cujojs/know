---
layout: post
title: New cram.js and curl.js releases!
author: unscriptable
tags: ['modules', 'amd', 'commonjs', 'curl', 'es6', 'cram']
toc: true
ctime: 2013-08-27
mtime: 2013-08-27
---

Five releases in one week!  So, what’s new?

* More compatibility, including support for dojo 1.8/1.9, lodash, and Windows
  command-line
* Improved and updated documentation
* New features, including a “legacy script” loader similar to RequireJS’s
  “shim config” ...

<a name="jump"></a>

## cram.js: almost ready for "beta" status

cram.js 0.7.6 is ready for download.  cram.js now runs on windows without
the need for a Unix-like command utility and now correctly parses all flavors
of [lodash](https://github.com/bestiejs/lodash).  I'm pretty confident that if
cram can correctly parse John-David Dalton's crazy-smart code, it'll parse
yours.  Version 0.7.5 also fixes several issues when using i18n and CommonJS
modules (i.e. using curl.js's cjsm11 module loader).  Many thanks to
[Gehan Gonsalkorale](https://github.com/gehan) for helping to isolate and fix
the issues in curl.js's plugins!

We plan to offer a bower installation, but for now, cram.js is best installed
or updated via npm:

`npm install --global cram@~0.7` or `npm install --save cram@~0.7`

Read more about the new cram.js
[releases](https://github.com/cujojs/cram/releases/).

## What's next for cram.js?  

It feels like it's time to elevate cram.js's
"official" status to "beta", but we'll need more unit tests before that.
We're also prototyping a JavaScript API so cram.js could be used as a grunt
plugin, for instance.  Outputting multiple, coordinated bundles would be 
nice to have, too.

## curl.js gets some much-needed updates

curl.js 0.7.6, 0.8, and 0.8.1 have been released almost back-to-back.  Version
0.7.6 re-introduces dojo compatibility with support for dojo 1.8 and 1.9,
including the ability to specify a "has profile" via `curl.config()`.  It also
contains the i18n and cjsm11 fixes needed by cram.js 0.7.5.

curl.js's i18n plugin
[code docs](https://github.com/cujojs/curl/blob/0.8.0/src/curl/plugin/i18n.js)
have been updated to better clarify how it works as a run-time plugin or a
build-time (cram) plugin.  In fact, there are lots of new or updated docs and
READMEs in the curl.js source.

curl.js 0.8 makes dojo compatibility "official" by adding a new dojo 1.8/1.9
distribution and replacing the dojo 1.6 shim from the "kitchen sink"
distribution with the dojo 1.8/1.9 shim.

0.8.1 completes a new *legacy* module loader that provides functionality
similar to RequireJS's "shim config" for loading old fashioned, non-modular
scripts.  The legacy loader makes the tricky js! plugin obsolete, but we'll
keep it around and just document that it is deprecated.

Unlike the "global" way to configure legacy scripts in RequireJS, the preferred
way to use the legacy loader is to scope it to specific packages or paths:

```js
curl.config({
    // curl.js supports packages as a “hash map” as well as an array:
    packages: {
        backbone: {
            location: 'components/backbone',
            main: 'backbone.js',
            config: {
                loader: 'curl/loader/legacy',
                exports: 'Backbone.noConflict()',
                requires: ['jquery', 'lodash']
            }
        },
        // these libs support AMD already
        lodash: { location: 'components/lodash', main: 'lodash.compat' },
        jquery: { location: 'components/jquery', main: 'jquery' }

    },
    paths: {
        myLegacy: {
            location: 'components/my',
            config: { loader: 'curl/loader/legacy', exports: 'MyGlobal' }
        }
    }
});
```

New to curl.js's module loaders?  Read more
[here](https://github.com/cujojs/curl/blob/0.8.0/src/curl/loader) and in the
code docs of each module.

curl.js can be installed using bower:

`bower install --save curl#~0.8`

Read more about the curl.js [releases](https://github.com/cujojs/curl/releases).

## What's next for curl.js?  

curl.js will get a [folder reorg](https://github.com/cujojs/curl/issues/178)
in the very near future, as well as centralized docs.  curl may also get a
new module loader or two.

My favorite loader idea: a "curl/loader/byExt" loader that
invisibly uses the text! plugin for HTML templates, the css! plugin
for stylesheets, the json! plugin for JSON files, and the legacy loader for
legacy scripts!  Feels like the future to me!

## Speaking of the future...

The TC39 team has vowed to (*finally!*) standardize JavaScript modules in ES6,
and spec work is well underway.  How does this affect curl and cram?  More
importantly, how does it affect your current and future codebase?

We've got some answers, but need your feedback on some important decisions!
Read more about
[the future of curl.js and cram.js](the-future-looks-bright-for-modules-but-what-about-curl/).
