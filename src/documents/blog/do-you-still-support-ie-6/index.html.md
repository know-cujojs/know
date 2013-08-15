---
layout: post
title: Do you still support IE 6? What about Netscape 4?
author: scothis
tags: []
toc: true
ctime: 2013-08-14
mtime: 2013-08-15
---

Sometimes the only way to move forward is to let go of the past. As library
authors, we are particularly cognizant that the environments we support has a
direct impact on the environments you, as developers, support. After all,
turning away a visitor at the door means fewer visitors and lost
revenue/mindshare.

To date, each cujoJS project independently chooses which environments it
actively tests against. This makes it harder to determine the supported
environments when using multiple cujoJS projects. We'd like to fix that. Before
making any changes we be clear about our plans, and provide an opportunity for
feedback.

<a name="jump"></a>

## Proposed policy

Here's what we intend to actively support across all of the cujoJS projects:

- Node.js (stable and previous stable)
- any browser with >1% global market share*

*Environment must be available for automated testing. There are many sources of
browser stats, we're currently leaning on the [browser usage tables on Can I
use..](http://caniuse.com/usage_table.php).

## Impact

If we consider the state of the browser universe right now, these are the
supported environments:

- Chrome stable
- Firefox stable
- Safari 6 and 5.1
- IE 10, 9 and 8
- iOS 6
- Node.js 0.10 and 0.8

## Automated testing

When we claim to support an environment, we actually want to prove it works.
All cujoJS projects have robust test suites. In order to ensure a supported
environment actually works, we leverage [Travis CI](https://travis-ci.org)
and [Sauce Labs](https://saucelabs.com) to run the test suite in every
supported environment. Unfortunately, not every browser known to man is
available within Sauce Labs. Even if a browser has sufficient market share, if
we can't automate our test suite to ensure it works, we can't officially
support it. At the moment the Android browser has sufficient marketshare, but
is not well supported within Sauce Labs.

Just because an environment isn't supported, doesn't mean it won't work. It
simply means that we don't test within that particular environment. If you find
bugs in an unsupported environment, please continue to report the issue. We
will accept pull requests that fix issues in unsupported environments as long
as it doesn't break a supported environment or adversely affect the code base.
We just can't guarantee that the environment will not break again in the
future; because of course, there are no automated tests.

## The bleeding edge

Supporting an environment doesn't mean that every feature will work natively
within that environment. For example, many projects already assume an ES5
environment, or a polyfilled ES5-esque environment;
[cujojs/poly](https://github.com/cujojs/poly) and
[kriskowal/es5-shim](https://github.com/kriskowal/es5-shim) work well. We
refuse to be handcuffed to the lowest common denominator. If a feature within a
project requires functionality that is not available in all supported
environments it will be supplementary and not essential, moreover it will be
documented as such. Whenever possible, a less feature rich work around will
also be available.

## Future releases

Of course, we won't drop support for a browser in a point release. When we do
drop a browser, it will be clearly listed in the change log. Individual
projects may support additional environments; each project will clearly list
the supported environments. As newer versions of each environment are released,
we will attempt to support the new environment quickly in a point release. We
are attempting to create a common floor, not a celling.


## Too painful?

If this change will make your life as an application developer painful, now is
your opportunity to yell.
