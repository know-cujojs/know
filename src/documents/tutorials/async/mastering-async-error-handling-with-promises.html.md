---
layout: tutorial
title: Mastering Async Error Handling with Promises
tags: ['promises', 'when', 'async']
url: '/tutorials/async/mastering-async-error-handling-with-promises'
urls: ['/tutorials/async/mastering-async-error-handling-with-promises.html.md']
toc: true
ctime: 2013-05-17
mtime: 2013-05-17
order: 3
---

*This tutorial is an adaption of [this original blog post](http://blog.briancavalier.com/async-programming-part-3-finally/)*

As we saw in [Async Programming is Messy](./async-programming-is-messy.html.md), error handling in callback-based asynchronous code gets messy quickly, and loses many of the qualities of synchronous code that make it familiar and easier to reason about.  In [Simplifying Async with Promises](./simplifying-async-with-promises.html.md), we introduced Promises and saw how they restore call-and-return semantics, allow errors to propagate up the stack similarly to synchronous exceptions, and generally provide a cleaner approach to managing asynchrony, especially when handling errors.

## Try/catch/finally

In synchronous code, `try/catch/finally` provides a simple and familiar, yet very powerful idiom for performing a task, handling errors, and then always ensuring we can clean up afterward.

Here's a simple `try/catch/finally` example in the same vein as the original `getTheResult()` from Part 1:

```js
// Sync
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }

}
```

As we've seen, attempting to simulate even the `try/catch` via a callback-based approach is fraught with pitfalls.  Adding the notion of `finally`, that is, *guaranteed cleanup*, only makes things worse.

Using Promises, we can build an approach that is analogous to this familiar `try/catch/finally` idiom, without deep callback structures.

## Try/catch

Let's start with a simpler version of example above that only uses `try/catch`, and see how we can use Promises to handle errors in the same way.

```js
// Sync
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    }

}
```

And now, as in Part 2, let's assume that `thisMightFail()` is asynchronous and returns a Promise.  We can use `then()` to simulate `catch`:

```js
// Async
function thisMightFail() {
    //...
    return promise;
}

function getTheResult() {

    return thisMightFail()
        .then(null, recoverFromFailure);

}
```

Waitaminit, that's *even less code* than using `try/catch`!  What's going on here?

### Propagating a success

This example introduces two very important facts about how Promises behave. The first of which is:

If no `onFulfilled` handler is provided to `then()`, the fulfillment value will propagate through unchanged to the returned Promise.

We're *not* supplying an `onFulfilled` handler when calling `then()`.  This means that a successful result from `thisMightFail()` simply will propagate through and be returned to the caller.

### Handling an error

The other important behavior is:

A handler may produce either a successful result by returning a value, or an error by throwing or returning a rejected promise.

We *are* supplying an `onRejected` handler: `recoverFromFailure`.  That means that any error produced by `thisMightFail` will be provided to `recoverFromFailure`.  Just like the `catch` statement in the synchronous example, `recoverFromFailure` can handle the error and `return` a successful result, *or* it can produce an error by throwing or by returning a rejected Promise.

Now we have a fully asynchronous construct that behaves like its synchronous analog, and is just as easy to write.

### Adding some sugar

Hmmm, but what about that `null` we're passing as the first param?  Why should we have to type `null` everywhere we want to use this asynchronous `try/catch`-like construct?  Can't we do better?

While the primary interface to a Promises/A+ Promise is its `then()` method, many implementations add convenience methods, built, with very little code, upon `then()`.  For example, [when.js](https://github.com/cujojs/when) Promises provide an [`otherwise()` method](https://github.com/cujojs/when/blob/master/docs/api.md#otherwise) that allows us to write this example more intuitive and compactly:

```js
// Async: Using when.js promise.otherwise();
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);

}
```

Now we have something that reads nicely!

## Adding finally

Let's add `finally` back into the mix, and see how we can use Promises to achieve the same result for asynchronous operations.

```js
// Sync
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }

}
```

First, let's note that there are some very interesting things about this seemingly simple `finally` block.  It:

1. will always execute after `thisMightFail` and/or `recoverFromFailure`
1. does not have access to the value returned by `thisMightFail`, or to the thrown exception (`e`), or to the value returned by `recoverFromFailure` <sup id="footnote-1-ref">[1](#footnote-1)</sup>.
1. cannot, in this case, transform an exception thrown by `recoverFromFailure` back into a successful result <sup id="footnote-2-ref">[2](#footnote-2)</sup>.
1. *can* change a successful result (returned by either `thisMightFail` or `recoverFromFailure`) into a failure if `alwaysCleanup` throws an exception.
1. *can* substitute a new exception in place of one thrown by `recoverFromFailure`.  That is, if both `recoverFromFailure` and `alwaysCleanup` throw exceptions, the one thrown by `alwaysCleanup` will propagate to the caller, and the one thrown by `recoverFromFailure` *will not*.

This seems fairly sophisticated.  Let's return to our asynchronous `getTheResult` and look at how we can achieve these same properties using Promises.

### Always execute

First, let's use `then()` to ensure that `alwaysCleanup` will execute in all cases (for succinctness, we'll keep when.js's `otherwise`):

```js
// Async
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanup, alwaysCleanup);
}
```

That seems simple enough!  Now, `alwaysCleanup` will be executed in all cases:

1. if `thisMightFail` succeeds,
2. if `thisMightFail` fails and `recoverFromFailure` succeeds, or
3. if `thisMightFail` and `recoverFromFailure` both fail.

But wait, while we've ensured that `alwaysCleanup` will always execute, we've violated two of the other properties:  `alwaysCleanup` *will* receive the successful result or the error, so has access to either/both, and it *can* transform an error into a successful result by returning successfully.

### Don't access result/error

We can introduce a wrapper to prevent passing the result or error to `alwaysCleanup`:

```js
// Async
function alwaysCleanupWrapper(resultOrError) {
    // don't pass resultOrError through
    return alwaysCleanup();
}

function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanupWrapper, alwaysCleanupWrapper);
}
```

Now we've achieved one of the two properties we had lost: `alwaysCleanup` no longer has access to the result or error.  Unfortunately, we had to add some code that feels unnecessary.  Let's keep exploring, though, to see if we can achieve the remaining property.

### Don't change the result

While `alwaysCleanupWrapper` prevents `alwaysCleanup` from accessing the result or error, it still allows `alwaysCleanup` to turn an error condition into a successful result.  For example, if `recoverFromFailure` produces an error, it will be passed to `alwaysCleanupWrapper`, which will then call `alwaysCleanup`.  If `alwaysCleanup` returns successfully, the result will be propagated to the caller, thus squelching the previous error.

That doesn't align with how our synchronous `finally` clause behaves, so let's refactor:

```js
// Async
function alwaysCleanupOnSuccess(result) {
    // don't pass result through, *and ignore* the return value
    // of alwaysCleanup.  Instead, return original result to propagate it.
    alwaysCleanup();
    return result;
}

function alwaysCleanupOnFailure(error) {
    // don't pass result through, *and ignore* the result
    // of alwaysCleanup.  Instead, rethrow error to propagate the failure.
    alwaysCleanup();
    throw error;
}

function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanupOnSuccess, alwaysCleanupOnFailure);

}
```

In both the success and failure cases, we've preserved the outcome: `alwaysCleanupOnSuccess` will execute `alwaysCleanup` but not allow it to change the ultimate result, and `alwaysCleanupOnFailure` will also execute `alwaysCleanup` and always rethrow the original error, thus propagating it even if `alwaysCleanup` returns successfully.

### The remaining two properties

Looking at the refactor above, we can also see that the remaining two properties hold:

In `alwaysCleanupOnSuccess`, if `alwaysCleanup` throws, the `return result` will never be reached, and this new error will be propagated to the caller, thus turning a successful result into a failure.

In `alwaysCleanupOnFailure`, if `alwaysCleanup` throws, the `throw error` will never be reached, and the error thrown by `alwaysCleanup` will be propagated to the caller, thus substituting a new error.

## Finally?

With this latest refactor, we've created an asynchronous construct that behaves like its familiar, synchronous `try/catch/finally` analog.

### More sugar

Some Promise implementations provide an abstraction for the `finally`-like behavior we want.  For example, when.js Promises provide an [`ensure()` method](https://github.com/cujojs/when/blob/master/docs/api.md#ensure) that has all of the properties we achieved above, but also allows us to be more succinct:

```js
// Async: Using when.js promise.ensure();
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);

}
```

## Finally

We started with the goal of finding a way to model the useful and familiar synchronous `try/catch/finally` behavior for asynchronous operations.  Here's the simple, synchronous code we started with:


```js
// Sync
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }

}
```

And here is the asynchronous analog we ended up with something that is just as compact, and easily readable:

```js
// Async
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);

}
```

## Try/finally

Another common construct is `try/finally`.  It is useful in executing cleanup code, but always allowing exceptions to propagate in the case where there is no immediate recovery path.  For example:

```js
// Sync
function getTheResult() {

    try {
        return thisMightFail();
    } finally {
        alwaysCleanup();
    }

}
```

Now that we've modeled a full `try/catch/finally` using Promises, modeling `try/finally` is trivial.  Similarly to simply cutting out the `catch` above, we can cut out the `otherwise()` in our Promise version:

```js
// Async
function getTheResult() {

    return thisMightFail()
        .ensure(alwaysCleanup);

}
```

All of the constraints we've been attempting to achieve still hold--this asynchronous construct will behave analogously to its synchronous `try/finally` counterpart.

## Using it

Let's compare how we would use the synchronous and asynchronous versions of `getTheResult`.  Assume we have the following two pre-existing functions for showing results and errors.  For simplicity, let's also assume that `showResult` might fail, but that `showError` will *not* fail.

```js
// Assume showResult might fail
function showResult(result) { /* Format and show the result */ }

// Assume showError will never fail
function showError(error) { /* Show the error, warn the user, etc. */ }
```

### Synchronous

First, the synchronous version, which we might use like this:

```js
// Sync
try {
    showResult(getTheResult());
} catch(e) {
    showError(e);
}
```

It's quite simple, as we'd expect.  If we get the result successfully, then we show it.  If getting the result fails (by throwing an exception), we show the error.

It's also important to note that if `showResult` fails, we will show an error.  This is an important hallmark of synchronous exceptions.  We've written single `catch` clause that will handle errors from either `getTheResult` or `showResult`.  The error propagation is *automatic*, and required no additional effort on our part.

### Asynchronous

Now, let's look at how we'd use the asynchronous version to accomplish the same goals:

```js
// Async
getTheResult().then(showResult)
    .otherwise(showError);
```

The functionality here is analogous, and one could argue that visually, this is even simpler than the synchronous version.  We get the result, or rather in this case, a Promise for the result, and when the actual result materializes (remember, this is all asynchronous!), we show it.  If getting the result fails (by rejecting resultPromise), we show the error.

Because Promises propagate errors similarly to exceptions, if `showResult` fails, we will also show an error.  So, the automatic the behavior here is also parallel to the synchronous version: We've written single `otherwise` call that will handle errors from either `getTheResult` or `showResult`.

Another important thing to notice is that we are able to use the same `showResult` and `showError` functions as in the synchronous version.  We don't need artificial callback-specific function signatures to work with promises--just the same functions we'd write anyway.

## Putting it all together

We've refactored our `getTheResult` code to use Promises to eumlate `try/catch/finally`, and also the calling code to use the returned Promise to handle all the same error cases we would handle in the synchronous version.  Let's look at the complete Promise-based asynchronous version of our code:

```js
// Using getTheResult()
getTheResult().then(showResult)
    .otherwise(showError);
```

```js
function getTheResult() {
    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);
}
```

```js
function thisMightFail() {
    // Using the proposed Promises/A+ style API for promise creation
    return makePromise(function(resolve, reject) {
        var result, error;

        // Do work, then:

        if(error) {
            reject(error);
        } else {
            resolve(result);
        }
    });
}
```

## The end?

Of course, there will always be differences between synchronous and asynchronous execution, but by using Promises, we can narrow the divide.  The synchronous and Promise-based versions we've constructed not only look very similar, they *behave* similarly.  They have similar invariants.  We can reason about them in similar ways.  We can even *refactor* and *test* them in similar ways.

Providing familiar and predictable error handling patterns and composable call-and-return semantics are two powerful aspects of Promises, but they are also only the beginning.  Promises are a building block on which fully asynchronous analogs of many other familiar features can be built easily: higher order functions like [`map`](https://github.com/cujojs/when/blob/master/docs/api.md#whenmap) and [`reduce`](https://github.com/cujojs/when/blob/master/docs/api.md#whenreduce)/`fold`, [parallel and sequential](https://github.com/cujojs/when/blob/master/docs/api.md#concurrency) task execution, and much more.

----

1. <a name="footnote-1" />You might be wondering why we want this property.  For this article, we're choosing to try to model `finally` as closely as possible.  The intention of synchronous `finally` is to cause *side effects*, such as closing a file or database connection, and not to transform the result or error by applying a function to it.  Also, passing something that *might be a result or might be an error* to `alwaysCleanup` can be a source of hazards without *also* telling `alwaysCleanup` what kind of thing it is receiving. The fact that `finally` doesn't have a "parameter", like `catch` means that the burden is on the developer to grant access to the result or error, usually by storing it in a local variable before execution enters the `finally`. That approach will work for these promise-based approaches as well.[&#8617;](#footnote-1-ref)
1. <a name="footnote-2" />Note that `finally` *is* allowed to squelch exceptions by *explicitly* returning a value.  However, in this case, we are not returning anything explicitly.  I've never seen a realistic and useful case for squelching an exception that way.[&#8617;](#footnote-2-ref)