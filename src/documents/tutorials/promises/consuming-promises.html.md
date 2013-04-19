---
layout: tutorial
title: Consuming Promises
tags: ['promises']
url: '/tutorials/promises/consuming-promises'
urls: ['/tutorials/promises/consuming-promises.html.md']
toc: true
ctime: 2013-03-25
mtime: 2013-03-28
order: 1
---

GUI developers are familiar with the phrase "don't block the UI thread."  In JavaScript, everything executes in the 'UI thread,' if you lock that thread, your application will grind to a halt.  Animations will freeze, keystrokes and clicks will be ignored, heck it’s unlikely you’ll even be able to scroll.  There are ways to deal with waiting for long running tasks to complete, an increasingly popular approach to solving this problem are promises.  The [cujo.js](http://cujojs.com/) family of libraries make extensive use of promises, understanding how to consume a promise is essential.

A promise simply represents a value.  That value may or may not be available when you receive a promise.  Instead of directly asking a promise what its value is, or even asking if the value is available yet, you can ask to be notified once the value becomes available.  We refer to the act of a promise obtaining its value as fulfillment.  Once a promise is fulfilled, the promise's value will never change; it will always represent that value.

To a consumer, promises are simply an object with a `.then()` function; that's it.  The `.then()` function is how we can ask the promise to notify us once the value is fulfilled.  Let’s look at some code:

```javascript
var promise = ...;
promise.then(function (value) {
    ...do something with the value...
});
```

With synchronous code, we can have the follow hello world program:

```javascript
var greeting = sayHello();
console.log(greeting);    // 'hello world'
```

What if `sayHello()` needs to lookup the current greeting from a database, or a web service.  We can't block while waiting for the greeting, enter promises:

```javascript
var greetingPromise = sayHello();
greetingPromise.then(function (greeting) {
    console.log(greeting);    // 'hello world'
});
```

The same message is printed to the console but now other code can continue to execute while we wait for the greeting.

But, what if the network goes down and we can't load the greeting from the web service?  That's ok, promises also has a mechanism for reporting errors.  The `then` function we use to obtain the promise's value also accepts a second argument that can receive an error.

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

Now we're covered. We are notified when the greeting value is available, or if the operation failed with the reason why.

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

From this very simple behavior, we can start to derive sophisticated systems, but let's not get ahead of ourselves.  In the next tutorial, we'll explore how to [create promises for others to consume](002-creating-promises.md).

## Aside

Many other programming languages have the notion of promises, there are even multiple implementations of promises within JavaScript.  When we talk about promises within Cujo, we're specifically talking about [Promises/A+](http://promises-aplus.github.com/promises-spec/).  You generally won't need to worry about the subtile differences between different promise implementations, [when.js](https://github.com/cujojs/when) is able to assimilate other promises returning a clean Promises/A+ promise for the value the 'untrusted' promise represents.  We'll cover that later.
