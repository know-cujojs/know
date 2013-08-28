---
layout: post
title: The future looks bright for modules, but what about curl.js?
author: unscriptable
tags: ['modules', 'amd', 'commonjs', 'curl', 'es6', 'cram']
toc: true
ctime: 2013-08-28 13:00:00
mtime: 2013-08-28 13:00:00
---

In an increasingly mobile-first, JavaScript-everywhere landscape, the
importance of curl.js and cram.js as the foundation of a modular
architecture has never been more clear.  On the cujoJS team,
we're continually researching and developing new and better ways
to assemble your code, whether it's AMD, CommonJS, legacy scripts,
CSS, HTML, JSON, etc. If you haven’t done so already, check out what
you can do with the [latest releases](/blog/new-cram-and-curl-releases/).

> But what's next for curl and cram?  Isn't it about time we bumped curl to
1.0.0?

Well, it may not be so simple.  If you haven't noticed, we've been talking
*a lot* about ES6 modules and loaders recently.  ES6 is the future, of
course, and one of cujoJS's [core principles](http://cujojs.com/manifesto.html)
is to embrace the future.  More than a few times we’ve asked:

> What do the cujoJS projects look like in an
ES6 world?  Are curl and cram even needed at all?

<a name="jump"></a>

## ES6 solves all the things, no?

It's true that the ES6 `Loader` will be built into all JavaScript environments,
including server-side environments.  It's also true that the ES6 will
accommodate [legacy formats](https://gist.github.com/wycats/51c96e3adcdb3a68cbc3/),
including AMD and CommonJS, via a low-level, “loader pipeline” API.
Furthermore, concatenating ES6 modules into a bundle is an easier task than
bundling AMD or CommonJS modules today.  It would seem that curl and cram
wouldn't be much use in a pure ES6 world, right?

However, as with any new JavaScript feature, there's a transition period.  The
TC39 team informs us that we should expect to be able to use ES6 modules and
loaders *in production* around 2016.  In addition, there will likely be legacy
browsers and code lingering around for another few years.  It seems like we've
got a 4-5 year transition period ahead of us.

## The future is now

> So, what's the best way to get to the future from here?

We believe the best way is to immediately start emulating the future via shims
and "transpilers".  In such a world, curl should adopt the ES6 Loader API and
provide a simple way for you to configure your "legacy" AMD and CJS packages.
As soon as you feel comfortable with the quality and robustness of ES6-to-AMD
"transpilers", you could start authoring in -- or refactoring to -- ES6 format.

ES6 loaders will have the necessary hooks to handle ES6 modules alongside AMD
or CommonJS.  However, it's up to us, the community, to write the code to make
these legacy modules work.  curl already has a lot of the necessary code, but
it's not just a simple refactoring task to adapt plugins and module loaders to
ES6 "pipelines".

Actually, plugins are problematic in ES6.  As of now, the
mostly-sync ES6 Loader API won't allow many plugins to work seamlessly.
Furthermore, many folks would like to see the "plugin!resource" syntax
disappear, myself included.  I'd much rather use curl's new module loaders.

On the other hand, cram has an excellent infrastructure based around its
*compile-to-AMD* strategy.  It wouldn't be a huge leap to allow cram to add a
*compile-to-ES6* feature and let you pick which formats to output.

## Break all the APIs!

So, it appears that cram's API could be kept intact, but curl's current API is
100% obsolete -- it is _legacy_ and no longer complies with our principles.
How do we reconcile this?
Is it cool to declare that curl 1.0 will break everything?  Or should we
introduce a new cujoJS project whose sole purpose is to provide an ES6 Loader
shim and pipelines for loading legacy modules and scripts?

I may be painting a more dire picture than really exists.  Most -- if not all
-- of your application code won't need to change.  We would provide AMD and
CommonJS ES6 pipelines for the foreseeable future.  The only code that must
change is your application bootstrapping code.  In most projects, this would
likely be just a handful of files: your HTML files and a "run.js" file or two.

I guess we could provide a `curl()` API adapter on top of the new ES6 Loader
API.  However, I don't think we should prolong the past, and I don't want to
spend valuable time creating or maintaining a legacy API for the next five years
or so.  My time would be better spent improving the quality and utility of the
codebase, imho.

Similarly, we could conceivably provide a migration tool that translates
`curl()` API calls to corresponding ES6 Loader API calls, but that, too, would
need to be maintained.  If any of you want to write *and maintain* a migration
tool, go for it! :)

So, I ask again, should curl 1.0 break the API?  Or should we start a totally
new cujoJS project?  Is it mandatory that we (or somebody) create a legacy
adapter or a migration tool?

Your feedback is valuable and certainly welcome!
