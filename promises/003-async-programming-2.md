In [Part 1](http://blog.briancavalier.com/async-programming-part-1-its-messy), we looked at the awkward situation created when we introduce callbacks to handle even a single asynchronous operation into an otherwise simple set of function calls.

As a quick review, have a look back at the [code we started with](https://gist.github.com/1790802), the [messy end result](https://gist.github.com/1790826) when using callbacks, and the things we'd like to fix in order to get back to sanity:

1. We can no longer use a simple call-and-return programming model
1. We can no longer handle errors using try/catch/finally
1. We must add callback and errback parameters to every function signature that might eventually lead to an asynchronous operation

# Promises

A Promise (aka Future, Delayed value, Deferred value) represents a value that is not yet available because the computation that will produce the value has not yet completed.  A Promise is a *placeholder* into which the successful result or reason for failure will eventually materialize.

Promises also provide a simple API (see note below) for being notified when the result has materialized, *or* when a failure has occured.

Promises are [not a new concept](http://en.wikipedia.org/wiki/Futures_and_promises), and have been implemented in many languages. While several implementations of the Promise concept in Javascript have been around for a while, they have started to gain more popularity recently as we start to build bigger, more complex systems that require coordinating more asynchronous tasks.

(NOTE: Although there are [several proposed](http://wiki.commonjs.org/wiki/Promises) Promise API standards, [Promises/A+](http://promises-aplus.github.com/promises-spec/) appears to be becoming the *defacto standard*. In any case, the basic concepts are the same: 1) Promises act as a placeholder for a result or error, 2) they provide a way to be notified when the actual result has materialized, or when a failure has occurred.)

# The Canonical XHR Example

In the case of an XHR Get, the value we care about is the content of the url we're fetching.  We know that XHR is an asynchonous operation, and that the value won't be available immediately.  That fits the definition of a Promise perfectly.

Imagine that we have an XHR library that *immediately* returns a Promise, as a placeholder for the content, instead of requiring us to pass in a callback.  We could rewrite our asynchronous `thisMightFail` function from Part 1 to look like this:
	
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

(Note that several popular Javascript libraries, including [Dojo](http://dojotoolkit.org/reference-guide/dojo/xhrGet.html) (see also this [great article on Dojo's Deferred](http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/) by [@bryanforbes](https://twitter.com/bryanforbes)) and [jQuery](http://api.jquery.com/Types/#jqXHR), implement XHR operations using promises)

Now, we can return the Promise placeholder *as if it were the real result*, and our asynchronous `thisMightFail` function looks very much like a plain old synchronous, call-and-return operation.

# Taking Back the Stack

In a non-callback world, results and errors flow back *up* the call stack.  This is expected and familiar.  In a callback-based world, as we've seen, results and errors no longer follow that familiar model, and instead, callbacks must flow *down*, deeper into the stack.

By using Promises, we can restore the familiar call-and-return programming model, and remove the callbacks.

## Restoring Call-and-return

To see how this works, let's start with a simplified version of the [synchronous `getTheResult` function](https://gist.github.com/1790802) from [Part 1](http://blog.briancavalier.com/async-programming-part-1-its-messy), without try/catch so that exceptions will always propagate up the call stack.

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

Now let's introduce the *asynchronous* `thisMightFail` from above that uses our Promise-based XHR lib.

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

Using Promises, `getTheResult()` is identical in the synchronous and asynchronous cases!  And in both, the successful result *or the failure* will propagate *up* the stack to the caller.

## Removing Callbacks

Notice also that there are no callbacks or errbacks (or alwaysbacks!) being passed down the callstack, and they haven't polluted any of our function signatures.  By using Promises, our functions now *look and act* like the familiar, synchronous, call-and-return model.

## Done?

We've used Promises to refactor our simplified `getTheResult` function, and fix two of the problems we identified in Part 1.  We've:

1. restored call-and-return
1. removed callback/errback/alwaysback parameter propagation

But, what does this mean for callers of `getTheResult`?  Remember that we're returning a Promise, and eventually, either the successful result (the result of the XHR) or an error will materialize into the Promise placeholder, at which point the caller will want to take some action.

# What about the Caller?

As mentioned above, Promises provide an API for being notified when either the result or failure becomes available.  For example, in the proposed Promises/A+ spec, a Promise has a `.then()` method, and many promise libraries provide a `when()` function that achieves the same goal.

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

Now, let's look at how the caller can use the Promise that `getTheResult` returns using the Promises/A+ `.then()` API.

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

# WAT

Wasn't the whole point of this Promises stuff to *avoid using callbacks*?  And here we are using them?!?

# Stay with Me

In Javascript, Promises are implemented using callbacks because there is no language-level construct for dealing with asynchrony.  Callbacks are a necessary *implementation detail* of Promises.  If Javascript provided, or possibly when it does provide in the future, other language constructs, promises could be implemented differently.

However, there are several important advantages in using Promises over the deep callback passing model from Part 1.

First, our function signatures are sane.  We have removed the need to add callback and errback parameters to every function signature from the caller down to the XHR lib, and only the caller who is ultimately interested in the result needs to mess with callbacks.

Second, the Promise API standardizes callback passing.  Libraries all tend to place callbacks and errbacks at different positions in function signatures.  Some don't even accept an errback.  *Most* don't accept an alwaysback (i.e. "finally").  We can rely on the Promise API instead of *many potentially different library APIs*.

Third, a Promise makes a set of *guarantees* about how and when callbacks and errbacks will be called, and how return values and exceptions thrown by callbacks will be handled.  In a non-Promise world, the multitude of callback-supporting libraries and their many function signatures also means a multitude of different behaviors:

1. Are your callbacks allowed to return a value?
1. If so, what happens to that value?
1. Do all libraries allow your callback to throw an exception?  If so, what happens to it?  Is it silently eaten?
1. If your callback does throw an exception, will your errback be called, or not?

... and so on ...

So, while one way to think of Promises is as a standard API to callback registration, they also provide standard, predictable *behavior* for how and when a callback will be called, exception handling, etc.

# What about try/catch/finally?

Now that we've restored call-and-return and removed callbacks from our function signatures, we need a way to handle failures.  Ideally, we'd like to use try/catch/finally, or at least something that *looks and acts just like it* and works in the face of asynchrony.

In Part 3, we'll put the final piece of the puzzle into place, and see how to model try/catch/finally using Promises.