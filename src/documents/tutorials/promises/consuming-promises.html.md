---
layout: tutorial
title: Consuming promises
tags: ['promises']
url: '/tutorials/promises/consuming-promises'
urls: ['/tutorials/promises/consuming-promises.html.md']
toc: false
ctime: 2013-03-25
mtime: 2013-03-28
order: 1
---

GUI developers are familiar with the phrase "don't block the UI thread."  In JavaScript, everything executes in the UI thread. If you lock that thread, your application grinds to a halt.  Animations freeze, keystrokes and clicks are ignored, it’s unlikely you’ll even be able to scroll.  Promises are an increasingly popular approach to dealing with the wait for long-running tasks to complete.  The [cujo.js](http://cujojs.com/) family of libraries make extensive use of promises, so understanding how to consume a promise is essential.

A promise simply represents a value.  That value may or may not be available when you receive a promise.  Instead of directly asking a promise what its value is, or even asking if the value is available yet, you can ask to be notified once the value becomes available.  We refer to the act of a promise obtaining its value as fulfillment.  Once a promise is fulfilled, the promise's value never changes; it always represents that value.

To a consumer, promises are simply an object with a `.then()` function.  You use the `.then()` function to ask the promise to notify you when the value is fulfilled.  Let’s look at some code:

```javascript
var promise = ...;
promise.then(function (value) {
    ...do something with the value...
});
```

Suppose you have synchronous code, with the following hello world program:

```javascript
var greeting = sayHello();
console.log(greeting);    // 'hello world'
```

What if `sayHello()` needs to look up the current greeting from a database, or a web service?  Instead of blocking other code while waiting for the greeting, you use promises:

```javascript
var greetingPromise = sayHello();
greetingPromise.then(function (greeting) {
    console.log(greeting);    // 'hello world'
});
```

The same message is printed to the console, but now other code can continue to execute during the wait for the greeting.

What if the network goes down and you can't load the greeting from the web service?  That's ok, promises also has a mechanism for reporting errors.  The `then` function you use to obtain the promise's value also accepts a second argument that can receive an error.

```javascript
var greetingPromise = sayHello();
greetingPromise.then(
    function (greeting) {
        console.log(greeting);    // 'hello world'
    },
    function (error) {
        console.error('uh oh: ', error);   // 'uh oh: something bad happened'
    }
);
```

Now you are notified when the greeting value is available, or if the operation failed with the reason why.

A promise can either represent a value, or an error reason.  Once a promise becomes fulfilled with a value, the state of the promise is locked, the value will never change.  For the same promise, you can ask to be notified multiple times.  Each callback handler that asks to be notified will be invoked once.

```javascript
var greetingPromise = sayHello();

greetingPromise.then(function (greeting) {
    console.log(greeting);    // 'hello world'
});

greetingPromise.then(function (greeting) {
    console.log(greeting);    // still 'hello world'
});

greetingPromise.then(function (greeting) {
    console.log(greeting);    // it' not going to change 'hello world'
});

setTimeout(function () {
    // one minute later
    greetingPromise.then(function (greeting) {
        console.log(greeting);    // yep, still the same 'hello world'
    });
}, 60000);
```

From this very simple behavior, you can start to derive sophisticated systemsd.  In the next tutorial, you explore how to [create promises for others to consume](002-creating-promises.md).

## Cujo promises are Promises/A+

Many other programming languages use promises, and there are multiple implementations of promises within JavaScript.  Promises within Cujo are specifically [Promises/A+](http://promises-aplus.github.com/promises-spec/).  You generally won't need to worry about the subtle differences between different promise implementations. [when.js](https://github.com/cujojs/when) can assimilate other promises and return a clean Promises/A+ promise for the value the "untrusted" promise represents.  We'll cover that later.
