---
title: 'Higher Order Promises with when.js'
layout: 'tutorial'
summary: 'limitations with normal higher order functions in a promise environment, and how when.js solve these issues.'
tags: ['promises', 'when']
url: '/tutorials/promises/higher-order-promises-with-when'
urls: ['/tutorials/promises/higher-order-promises-with-when.html.md']
ctime: 2013-04-09
mtime: 2013-04-09
order: 3
---

One of JavaScript's great strengths is the ability to fuse object oriented and functional programming styles.  Higher order functions are a concept in functional programming where we apply a simple function to a larger collection of data to produce a new, transformed collection.  Put simply, they are methods that accept functions as arguments.

In previous tutorials we looked at [how to consume promises](./consuming-promises.html.md) and [how to create promises](./creating-promises.html.md). In this tutorial, we'll look at limitations with normal higher order functions in a promise environment, and how [when.js](https://github.com/cujojs/when) solve these issues.

`Array.prototype.map` applies a function to each element in an array, creating a new array containing the return value of the function invocation.

```javascript
var data = [0, 1, 2, 3];

var datax2 = data.map(function double(value) {
    return value * 2;
});

console.log(datax2);  // [0, 2, 4, 6]
```

We can take a set of values and transform them with a simple function into a new set of values, nice.  But what happens when promises enter the mix?

```javascript
var data = [0, 1, when(2), 3];

var datax2 = data.map(function double(value) {
    return value * 2;
});

console.log(datax2);  // [0, 2, NaN, 6]
```

What happened to the third value, why is it NaN instead of 4?  Unfortunately, JavaScript Arrays don't understand promises.  Instead of providing the value of the promise, 2, to be doubled the promise object itself is doubled.  An object times a number is not a number, NaN.  Fortunately, when.js provides a map implementation that is promise aware.

```javascript
var data = [0, 1, when(2), 3];

function double(value) {
    return value * 2;
}

when.map(data, double).then(function (datax2) {
    console.log(datax2);  // [0, 2, 4, 6]
});
```

Using the same data array, and the same doubling function, this time instead of NaN we get the expected double value for 2, 4!

It's important to remember that a promises' value may not be immediately available, the resulting array from the map method is also not immediately available, a promise for the resulting array is returned instead. The work function may return a promise, when will wait for that promise to resolve before resolving the promise returned from `when.map()`.

when.js provides many other promise aware, higher order functions.  While we don't have time to go into them all, two of the most useful are `when.all()` and `when.any()`.

`when.all()` digests an array of promises, returning a new promise that is resolved once each of the provided promises have themselves resolved.

Similarly to `when.all()`, `when.any()` accepts an array of promises, however, the resulting promise is resolved once a single provided promise has resolved.

```javascript
function delay(secs) {
    var d = when.defer();
    setTimeout(function () {
        d.resolve(secs);
    }, secs * 1000);
    return d.promise;
}

var promises = [
    delay(5),
    delay(10),
    delay(1)
];

when.all(promises).then(function(value) {
    // invoked after 10 seconds
    console.log('all delays resolved: ', value);  // 'all delays resolved: [5, 10, 1]'
});

when.any(promises).then(function(value) {
    // invoked after 1 second
    console.log('any delay resolved: ', value);  // 'any delay resolved: 1'
});
```

Be careful with the value of the promise returned from `when.any()`, as other promises in the array become resolved, the resulting value from subsequent `any` invocations may change for the same input array.  `when.any()` is a race, the first resolved promise in the array will win, and a non-promise value is considered resolved.

Odds are when.js already has promise aware support for any generic higher order function you can imagine.  From time based delays to task sequencing and periodic polling, when.js has it already.  If by chance when doesn't already support a higher order function you need, ask and we'll consider adding support.
