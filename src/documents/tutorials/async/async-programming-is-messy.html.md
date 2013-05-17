---
layout: tutorial
title: Async Programming is Messy
tags: ['promises', 'when', 'async']
url: '/tutorials/async/async-programming-is-messy'
urls: ['/tutorials/async/async-programming-is-messy.html.md']
toc: true
ctime: 2013-05-17
mtime: 2013-05-17
order: 1
---

*This tutorial is an adaption of [this original blog post](http://blog.briancavalier.com/async-programming-part-1-it-s-messy/)*

## Exceptions and try/catch

Exceptions and try/catch are an intuitive way to execute operations that may fail. They allow us to recover from the failure, or to let the failure propagate up the call stack to a caller by either not catching the exception, or explicitly re-throwing it.

Here's a simple example:

```js
function thisMightFail() {
	//...
	if(badThingsHappened) {
		throw new Error(...);
	}

	return theGoodResult;
}

function recoverFromFailure(e) {
	//...
	return recoveryValue;
}

function getTheResult() {

	var result;

	try {
		result = thisMightFail();
	} catch(e) {
		result = recoverFromFailure(e);
	}

	return result;
}
```

In this case, `getTheResult` handles the case where `thisMightFail` does indeed fail and throws an `Error` by catching the `Error` and calling `recoverFromFailure` (which could return some default result, for example). This works because `thisMightFail` is _synchronous_.

## Going Async

What if `thisMightFail` is _asynchronous_? For example, it may perform an asynchronous XHR to fetch the result data:

```js
function thisMightFail(callback, errback) {
	xhrGet('/result', callback, errback);
}
```

Now it's impossible to use try/catch, and we have to supply a callback and errback to handle the success and failure cases. That's pretty common in Javascript applications, so no big deal, right? But wait, now `getTheResult` _also_ has to change:

```js
function getTheResult(callback) {

	// Simulating the catch-and-recover behavior of try/catch
	thisMightFail(callback, function(e) {

		var result = recoverFromFalure(e);
		callback(result);

	});

}
```

At the very least, `callback` (and possibly `errback`, read on) must now be added to _every function signature_ all the way back up to the caller who is ultimately interested in the result.

## More Async

If `recoverFromFailure` is also asynchronous, we have to add yet another level of callback nesting:

```js
function getTheResult(callback) {

	// Simulating the catch-and-recover behavior of try/catch
	thisMightFail(callback, function(e) {

		recoverFromFailure(callback, function(e) {
			// What do we do here?!?!
		});

	});
}
```

This also raises the question of what to do if `recoverFromFailure` itself fails. When using synchronous try/catch, `recoverFromFailure` could simply throw an `Error` and it would propagate up to the code that called `getTheResult`. To handle an asynchronous failure, we have to introduce another `errback`, resulting in both `callback` and `errback` infiltrating every function signature from `recoverFromFailure` all the way up to a caller who must ultimately supply them.

It may also mean that we have to check to see if callback and errback were actually provided, and if they might throw exceptions:

```js
function thisMightFail(callback, errback) {
	xhrGet('/result', callback, errback);
}

function recoverFromFailure(callback, errback) {
	recoverAsync(
		function(result) {
			if(callback) {
				try {
					callback(result);
				} catch(e) {
					// Ok, callback threw an exception, let's switch to errback
					// At least this will let the caller know that something went wrong.
					// But now, both the callback and errback will have been called, and
					// and the developer may not have accounted for that!
					errback(e);
				}
			}
		}
		function(error) {
			if(errback) {
				try {
					errback(error);
				} catch(ohnoes) {
					// What do we do now?!?
					// We could re-throw or not catch at all, but no one can catch
					// the exception because this is all asynchronous.
					// And now console.error has infiltrated deep into our code, too!
					console.error(ohnoes);
				}
			}
		},
	);
}

function getTheResult(callback, errback) {

	// Simulating the catch-and-recover behavior of try/catch
	thisMightFail(callback, function(e) {

		recoverFromFailure(callback, errback);

	});

}
```

The code has gone from a simple try/catch to deeply nested callbacks, with `callback` and `errback` in every function signature, plus additional logic to check whether it's safe to call them, and, ironically, _two try/catch blocks_ to ensure that `recoverFromFailure` can indeed recover from a failure.

## And what about finally?

Imagine if we were also to introduce `finally` into the mix--things would need to become even more complex. There are essentially two options, neither of which is as simple and elegant as the language-provided `finally` clause. We could: 1) add an `alwaysback` callback to all function signatures, with the accompanying checks to ensure it is safely callable, or 2) always write our callback/errback to handle errors internally, and be sure to invoke `alwaysback` in all cases.

## Summary

Using callbacks for asynchronous programming changes the basic programming model, creating the following situation:

  1. We can no longer use a simple call-and-return programming model
  2. We can no longer handle errors using try/catch/finally
  3. We must add callback and errback parameters to every function signature that _might eventually_ lead to an asynchronous operation

We can do better. There is another model for asynchronous programming in Javascript that more closely resembles standard call-and-return, follows a model more like try/catch/finally, and doesn't force us to add two callback parameters to a large number of functions.

Next, we'll look at [Promises](./async-programming-with-promises), and how they help to bring asynchronous programming back to a model that is simpler and more familiar.