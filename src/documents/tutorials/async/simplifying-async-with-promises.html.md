---
layout: tutorial
title: Simplifying Async with Promises
tags: ['promises', 'when', 'async']
url: '/tutorials/async/simplifying-async-with-promises'
urls: ['/tutorials/async/simplifying-async-with-promises.html.md']
toc: true
ctime: 2013-05-15
mtime: 2013-05-15
order: 2
---

*This tutorial is an adaption of [this original blog post](http://blog.briancavalier.com/async-programming-part-2-promises/)*


In [Async Programming is Messy][1], we looked at the awkward situation created when we introduce callbacks to handle even a single asynchronous operation into an otherwise simple set of function calls.

   [1]: ./async-programming-is-messy.html.md

As a quick review, have a look back at the code we started with, the messy end result when using callbacks, and the things we'd like to fix in order to get back to sanity:

  1. We can no longer use a simple call-and-return programming model
  2. We can no longer handle errors using try/catch/finally
  3. We must add callback and errback parameters to every function signature that might eventually lead to an asynchronous operation

## Promises

A Promise (aka Future, Delayed value, Deferred value) represents a value that is not yet available because the computation that will produce the value has not yet completed. A Promise is a _placeholder_ into which the successful result or reason for failure will eventually materialize.

Promises also provide a simple API (see note below) for being notified when the result has materialized, _or_ when a failure has occured.

Promises are [not a new concept][2], and have been implemented in many languages. While several implementations of the Promise concept in Javascript have been around for a while, they have started to gain more popularity recently as we start to build bigger, more complex systems that require coordinating more asynchronous tasks.

   [2]: http://en.wikipedia.org/wiki/Futures_and_promises

(NOTE: Although there are [several proposed][3] Promise API standards, [Promises/A+][4] has been implemented in several major frameworks, and appears to be becoming the _defacto standard_. In any case, the basic concepts are the same: 1) Promises act as a placeholder for a result or error, 2) they provide a way to be notified when the actual result has materialized, or when a failure has occurred.)

   [3]: http://wiki.commonjs.org/wiki/Promises
   [4]: http://promises-aplus.github.io/promises-spec/

## The Canonical XHR Example

In the case of an XHR Get, the value we care about is the content of the url we're fetching. We know that XHR is an asynchonous operation, and that the value won't be available immediately. That fits the definition of a Promise perfectly.

Imagine that we have an XHR library that _immediately_ returns a Promise, as a placeholder for the content, instead of requiring us to pass in a callback. We could rewrite our asynchronous `thisMightFail` function from Part 1 to look like this:

```js
function thisMightFail() {
	// Our XHR library returns a promise placeholder for the
	// content of the url.  The XHR itself will execute later.
	var promise = xhrGet('/result');

	// We can simply return the promise to our caller as if
	// it is the actual value.
	return promise;
}
```

(Note that several popular Javascript libraries, including [Dojo][5] (see also this [great article on Dojo's Deferred][6] by [@bryanforbes][7]) and [jQuery][8], implement XHR operations using promises)

   [5]: http://dojotoolkit.org/reference-guide/dojo/xhrGet.html
   [6]: http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/
   [7]: https://twitter.com/bryanforbes
   [8]: http://api.jquery.com/Types/#jqXHR

Now, we can return the Promise placeholder _as if it were the real result_, and our asynchronous `thisMightFail` function looks very much like a plain old synchronous, call-and-return operation.

## Taking Back the Stack

In a non-callback world, results and errors flow back _up_ the call stack. This is expected and familiar. In a callback-based world, as we've seen, results and errors no longer follow that familiar model, and instead, callbacks must flow _down_, deeper into the stack.

By using Promises, we can restore the familiar call-and-return programming model, and remove the callbacks.

### Restoring Call-and-return

To see how this works, let's start with a simplified version of the [synchronous `getTheResult` function from Part 1][1], without try/catch so that exceptions will always propagate up the call stack.

```js
function thisMightFail() {
	//...
	if(badThingsHappened) {
		throw new Error(...);
	}

	return theGoodResult;
}

function getTheResult() {
	// Return the result of thisMightFail, or let the exception
	// propagate.
	return thisMightFail();
}
```

Now let's introduce the _asynchronous_ `thisMightFail` from above that uses our Promise-based XHR lib.

```js
function thisMightFail() {
	// Our XHR library returns a promise placeholder for the
	// content of the url.  The XHR itself will execute later.
	var promise = xhrGet('/result');

	// We can simply return the promise to our caller as if
	// it is the actual value.
	return promise;
}

function getTheResult() {
	// Return the result of thisMightFail, which will be a Promise
	// representing a future value or failure
	return thisMightFail();
}
```

Using Promises, `getTheResult()` is identical in the synchronous and asynchronous cases! And in both, the successful result _or the failure_ will propagate _up_ the stack to the caller.

### Removing Callbacks

Notice also that there are no callbacks or errbacks (or alwaysbacks!) being passed down the callstack, and they haven't polluted any of our function signatures. By using Promises, our functions now _look and act_ like the familiar, synchronous, call-and-return model.

### Done?

We've used Promises to refactor our simplified `getTheResult` function, and fix two of the problems we identified in Part 1. We've:

  1. restored call-and-return
  2. removed callback/errback/alwaysback parameter propagation

But, what does this mean for callers of `getTheResult`? Remember that we're returning a Promise, and eventually, either the successful result (the result of the XHR) or an error will materialize into the Promise placeholder, at which point the caller will want to take some action.

## What about the Caller?

As mentioned above, Promises provide an API for being notified when either the result or failure becomes available. For example, in the proposed Promises/A spec, a Promise has a `.then()` method, and many promise libraries provide a `when()` function that achieves the same goal.

First, let's look at what the calling code might look like when using the callback-based approach:

```js
// Callback-based getTheResult
getTheResult(
	function(theResult) {
		// theResult will be the XHR reponse content
		resultNode.innerHTML = theResult;
	},
	function(error) {
		// error will be an indication of why the XHR failed, whatever
		// the XHR lib chooses to supply.  For example, it could be
		// an Error.
		errorNode.innerHTML = error.message;
	}
);
```

Now, let's look at how the caller can use the Promise that `getTheResult` returns using the Promises/A `.then()` API.

```js
// Call promise-based getTheResult and get back a Promise
var promise = getTheResult();

promise.then(
	function(theResult) {
		// theResult will be the XHR reponse content
		resultNode.innerHTML = theResult;
	},
	function(error) {
		// error will be an indication of why the XHR failed, whatever
		// the XHR lib chooses to supply.  For example, it could be
		// an Error.
		errorNode.innerHTML = error.message;
	}
);
```

Or, more compactly:

```js
getTheResult().then(
	function(theResult) {
		// theResult will be the XHR reponse content
		resultNode.innerHTML = theResult;
	},
	function(error) {
		// error will be an indication of why the XHR failed, whatever
		// the XHR lib chooses to supply.  For example, it could be
		// an Error.
		errorNode.innerHTML = error.message;
	}
);
```

![WAT][11]

   [11]: ./funny-surprised-owl-WHAT.jpg

(Image from [The Meta Picture][12])

   [12]: http://themetapicture.com/wat/

Wasn't the whole point of this Promises stuff to _avoid using callbacks_? And here we are using them?!?

## Stay with Me

In Javascript, Promises are implemented using callbacks because there is no language-level construct for dealing with asynchrony. Callbacks are a necessary _implementation detail_ of Promises. If Javascript provided, or possibly when it does provide in the future, other language constructs, promises could be implemented differently.

However, there are several important advantages in using Promises over the deep callback passing model from Part 1.

First, our function signatures are sane. We have removed the need to add callback and errback parameters to every function signature from the caller down to the XHR lib, and only the caller who is ultimately interested in the result needs to mess with callbacks.

Second, the Promise API standardizes callback passing. Libraries all tend to place callbacks and errbacks at different positions in function signatures. Some don't even accept an errback. _Most_ don't accept an alwaysback (i.e. "finally"). We can rely on the Promise API instead of _many potentially different library APIs_.

Third, a Promise makes a set of _guarantees_ about how and when callbacks and errbacks will be called, and how return values and exceptions thrown by callbacks will be handled. In a non-Promise world, the multitude of callback-supporting libraries and their many function signatures also means a multitude of different behaviors:

  1. Are your callbacks allowed to return a value?
  2. If so, what happens to that value?
  3. Do all libraries allow your callback to throw an exception? If so, what happens to it? Is it silently eaten?
  4. If your callback does throw an exception, will your errback be called, or not?

… and so on …

So, while one way to think of Promises is as a standard API to callback registration, they also provide standard, predictable _behavior_ for how and when a callback will be called, exception handling, etc.

## What about try/catch/finally?

Now that we've restored call-and-return and removed callbacks from our function signatures, we need a way to handle failures. Ideally, we'd like to use try/catch/finally, or at least something that _looks and acts just like it_ and works in the face of asynchrony.

In [Mastering Async Error Handling with Promises](./mastering-async-error-handling-with-promises.html.md), we'll put the final piece of the puzzle into place, and see how to model try/catch/finally using Promises.
