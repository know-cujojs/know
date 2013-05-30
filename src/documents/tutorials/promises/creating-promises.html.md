---
layout: 'tutorial'
title: 'Creating promises'
tags: ['promises', 'when']
url: '/tutorials/promises/creating-promises'
urls: ['/tutorials/promises/creating-promises.html.md']
toc: true
ctime: 2013-03-28
mtime: 2013-05-30
order: 2
---

The [Consuming Promises tutorial](./consuming-promises.html.md) examined how to work with existing promises; in this tutorial you look at how to create promises.
With a promise library, it's really quite easy.
There are many [Promises/A+](http://promises-aplus.github.com/promises-spec/) compliant libraries, including Cujo’s [when.js](https://github.com/cujojs/when).


Promise chains
--------------

The simplest way to create a new promise is to handle another promise.
As you already know, a `then()` method accepts callback functions to be notified when the promise's value is available.
The act of asking to be notified when a promise is fulfilled creates a new promise for the return value of the callback function.

Suppose you have a promise representing the number 0.

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

You can keep this chain going forever.
The returned value from one callback is used as the value of the next promise.
The same chaining affect applies to error handlers.
Keep in mind that once a promise is in error, subsequent promises continue in error until the error is handled.


Creating promises for values
----------------------------

Up to this point, you've been given promises to work with; now you will create new promises from scratch.
The easiest way is to create a promise for a value.

Using the previous example, this example creates a promise representing the value 0 using when.js:

```javascript
var when = require('when');
var promise = when(0);
```

The `when()` function can create a promise from a promise or a value.
It's an easy way to normalize a value that may or may not be a promise into a promise, or even assimilate foreign promises into a Promises/A+ promise.
You don't need to determine whether the value is a promise; just pass it through the `when()` function.


Creating promises for future values
-----------------------------------

The usefulness of promises is more than chaining values together, that's really a side effect of their core essence.
The real benefit is to create a promise for a currently unknown, future value.
You do this by creating a deferred object.
A deferred object is a plain JS object that contains an unresolved promise and the capability to resolve that promise.
Typically, the promise is separated from the deferred object with the promise being exposed to the outside world while the resolver is protected.

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

Remember that a promise may be resolved once and only once.
If you invoke `resolve()` multiple times, only the first invocation has any effect; subsequent invocations are ignored.

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

Future success is never guaranteed.
Networks and servers go down, users click the Cancel button, you get the picture.
Consumers of a promise need to know that the promise is broken, and they will not receive the anticipated value.
You do this by rejecting the promise:

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


The next tutorial examines higher-order functions that when.js provides for working with promises.
