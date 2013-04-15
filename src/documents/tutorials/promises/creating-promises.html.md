---
layout: 'tutorial'
title: 'Creating Promises'
summary: 'create promises with a promise library'
tags: ['tutorial', 'promises', 'when']
url: '/tutorials/promises/creating-promises'
urls: ['/tutorials/promises/creating-promises.html.md']
order: 2
---

In the [Consuming Promises tutorial](./consuming-promises.html.md), we looked at how to work with existing promises, let's shift focus and now look at how to create promises.  With a promise library, it's really quite easy.  There are many [Promises/A+](http://promises-aplus.github.com/promises-spec/) compliant libraries, including Cujo’s [when.js](https://github.com/cujojs/when).


Promise Chains
--------------

The simplest way to create a new promise, is to handle another promise.  As we already know, the key to promises is a `then()` method that accepts callback functions to be notified when the promises' value is available.  It turns out, the act of asking to be notified when a promise is fulfilled creates a new promise for the return value of the callback function.

Let's suppose we have a promise representing the number 0.

```javascript
var promise =  ...;  // we'll show the '...' in the next example

function increment(count) {
    console.log(count);
    return count + 1;
}

promise.then(increment)   // 0
       .then(increment)   // 1
       .then(increment)   // 2
       .then(increment);  // 3
```

We can keep this chain going forever.  The returned value from one callback will be used as the value of the next promise.  The same chaining affect applies to error handlers as well.  It's important to keep in mind that once a promise is in error, subsequent promises will continue in error, until the error is handled.


Creating Promises for values
----------------------------

Up to this point, we've been given promises to work with, let create new promises from scratch.  The easiest way to create a new promise is for a value.

Using the previous example, let's create a promise representing the value 0 using when.js.

```javascript
var when = require('when');
var promise = when(0);
```

The `when()` function can create a promise from a promise or value.  It's an easy way to normalize a value that may or may not be a promise into a promise, or even assimilate foreign promises into a Promises/A+ promise.  No need to sniff for promises vs values, just pass it through the `when()` function.


Creating Promises for future values
-----------------------------------

The usefulness of promises is more than chaining values together, that's really a side effect of their core essence.  The real benefit is to create a promise for an currently unknown, future value.  We do this by creating a deferred object.  A deferred is a plain JS object that contains an unresolved promise and the capability to resolve said promise.  Typically, the promise is separated from the deferred with the promise being exposed to the outside world while the resolver is protected.

```javascript
function sayHello() {
    var d = when.defer();
    // 'setTimeout' in this example could be any operation
    // like an XMLHttpRequest or an expected user input
    setTimeout(function () {
        d.resolve('hello');
    }, 5000);
    return d.promise;
}

sayHello().then(function (greeting) {
    // five seconds later
    console.log(greeting);  // 'hello'
});
```

It's important to remember that a promise may be resolved once and only once.  If you invoke `resolve()` multiple times, only the first invocation will have any effect, subsequent invocations are ignored.

```javascript
function sayHello() {
    var d = when.defer();
    setTimeout(function () {
        // accepted
        d.resolve('hello');

        // ignored
        d.resolve('goodbye');
        d.resolve('I said good day, sir!');
    }, 5000);
    return d.promise;
}

sayHello().then(function (greeting) {
    // five seconds later, only invoked once
    console.log(greeting);  // 'hello'
});
```

Future success is never guarenteed.  As much as we may hope for the happy path, in the real world, stuff happens.  Networks and servers go down, users click the 'cancel' button, you get the picture.  Consumers of a promise need to know the promise is broken, and they will not receive the anticipated value.  This is done by rejecting the promise.

```javascript
function sayHello() {
    var d = when.defer();
    setTimeout(function () {
        d.reject("I'm busy");
    }, 5000);
    return d.promise;
}

sayHello().then(
    function (greeting) {
        // never invoked
    },
    function (err) {
        // five seconds later
        console.log(err);  // "I'm busy"
    }
);
```


In the next tutorial, we'll start to dig into higher order functions when.js provides for working with promises.
