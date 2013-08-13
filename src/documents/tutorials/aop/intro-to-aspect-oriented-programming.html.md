---
layout: tutorial
title: Intro to Aspect Oriented Programming
tags: ['aop']
url: '/tutorials/aop/intro-to-aspect-oriented-programming'
urls: ['/tutorials/aop/intro-to-aspect-oriented-programming.html.md']
toc: true
ctime: 2013-08-13T00:00:00
mtime: 2013-08-13T00:00:00
order: 1
---

Aspect Oriented Programming (AOP) is a technique for augmenting the behavior of objects, methods, and functions non-invasively. AOP allows you to add new behaviors and to combine and modify existing behaviors "from the outside".

While there are many techniques for adding and combining behavior, such as inheritance, composition, and delegation, AOP can prove to be more flexible and less invasive in many situations, and it is a worthwhile addition to your toolbox of techniques.

To see how it works, let's look at a simple example.

Imagine our codebase contains the following simple object.

```js
function Thing() {}

Thing.prototype.doSomething = function(x, y) {
	var result;

	// compute some result using x and y

	return result;
};
```

Imagine that we use many instances of the object throughout our application via code that looks something like the following.

```js
var thing = new Thing();

// some time later, and possibly even in
// another part of the application
var result = thing.doSomething(x, y);
```

## Adding behavior

Now imagine that we suspect that `Thing.prototype.doSomething` is the source of performance problems, and we'd like to log profiling information about its inputs, `x` and `y`, the time it takes to compute `result`, and the value of the `result`.

### Modifying all the call sites

One approach would be to log data in every spot that `Thing.prototype.doSomething` is called:

```js
var start = Date.now();

var result = thing.doSomething(x, y);

console.log((Date.now() - start) + 'ms', x, y, result);
```

Obviously, if `Thing.prototype.doSomething` is used many times in the application, this could be *a lot of cut and paste*.  You might miss some places, or worse yet, you might forget to remove some after collecting the data.

### Modifying the source

Another approach would be to modify the source of `Thing`:

```js
Thing.prototype.doSomething = function(x, y) {
	var result;

	var start = Date.now();

	// compute some result using x and y

	console.log((Date.now() - start) + 'ms', x, y, result);

	return result;
};
```

While this centralizes the change, it is also still fairly invasive: it requires changing the source code of `Thing`.  Imagine if `Thing.prototype.doSomething` were a more complex method, with multiple `return` points and a few `try/catch/finally` blocks.  It could be non-trivial to modify the code in a way that allows you to collect the data you want *without changing the method's behavior*.

If you ever wanted to profile other methods in a similar way, you would need to change their source code as well.

### Using inheritance

Yet another approach would be to use inheritance to avoid modifying `Thing`'s source:

```js
function ProfiledThing() {
	Thing.apply(this, arguments);
}

ProfiledThing.prototype = Object.create(Thing.prototype);

ProfiledThing.prototype.doSomething = function() {
	var start = Date.now();

	var result = Thing.prototype.doSomething.apply(this, arguments);

	console.log((Date.now() - start) + 'ms', x, y, result);

	return result;
}
```

This approach avoids modifying `Thing`'s source, but has a *significant* problem: it requires changing every spot in the code that constructs a `new Thing()`, to construct a `new ProfiledThing()` instead.

There are ways to mitigate this problem, but by now it should be becoming clear that there simply has to be a better way to introduce this profiling behavior.

## Unrelated Concerns

An interesting characteristic of this profiling behavior is that it is unrelated to `Thing`'s primary purpose.  It is a side effect.

`Thing` has most likely been created to solve a particular problem in a particular domain.  The solutions above attempt to introduce this unrelated behavior into `Thing`'s domain, and it's highly likely that `Thing`'s problem domain has nothing to do with profiling.

`Thing` need not know anything about profiling to do its job, but the solutions above force profiling concerns directly into `Thing`'s domain.

What we need is a technique that allows us to introduce this kind of behavior in a controlled, non-invasive way.  That is, a way that makes strong guarantees about preserving `Thing`'s behavior, and without requiring that we modify `Thing`'s source code or every bit of code that creates or consumes a `Thing`.

## Enter AOP

AOP, as we said above, is a technique for augmenting behavior non-invasively.  In JavaScript, it is quite simple.  You don't necessarily even need tools or a library to apply it, although they certainly help, as does any tool or library that helps you apply a reusable pattern.

If you've ever done the following, you've done AOP in JavaScript:

```js
var origDoSomething = thing.doSomething;

// Method replacement is a simple form of AOP
thing.doSomething = function() {
	doSomethingElseFirst();

	return origDoSomething.apply(this, arguments);
}
```

This effectively adds behavior to `thing.doSomething`.  Now, when `thing.doSomething` is called, it will `doSomethingElseFirst`, and then perform the original behavior.

In AOP parlance, We can say that `doSomethingElseFirst` is a behavior aspect that has been applied to `thing.doSomething`.  Specifically, `doSomethingElseFirst` is called "before advice" ... that is, we have *advised* `thing.doSomething` that it should `doSomethingElseFirst` *before* doing it's original job.  AOP implementations typically provide many advice types, such as before, after, afterReturning, afterThrowing, and around.

There are several important things to note about this simple example:

* The source code of `Thing` hasn't been modified.
* The consumers of `thing` do not need to change.
* The behavior of the original `doSomething`, i.e. *its contract* has been preserved.
* `Thing` has no knowledge of `doSomethingElseFirst`, and no dependency on it.  Thus, `Thing`'s unit tests do not need to be updated.  Of course, we need to write unit tests for `doSomethingElseFirst`, but any new code requires unit tests.

### AOPing the example

Let's use a similar approach to AOP to add profiling to all the `Thing`s.

```js
var origDoSomething = Thing.prototype.doSomething;

Thing.prototype.doSomething = function() {
	var start = Date.now();

	var result = origDoSomething.apply(this, arguments);

	console.log((Date.now() - start) + 'ms', x, y, result);

	return result;
}
```

We've again used the method replacement technique, but this time we've replaced a method on `Thing`'s prototype.  All `Thing` instances will have this new, profiling version of `doSomething`.  This type of aspect is called "around" advice because it does something both before and after (thus, "around") the original method.

While this looks very similar to the [inheritance](#Using-inheritance) example above, there is one very important difference: We've not introduced a new constructor, and thus consumers of `Thing` do not need to change.

## AOP in practice

Non-invasively adding profiling to a single method of a single prototype is a simple way to show how AOP can be applied easily in JavaScript, but the technique can be used to do much more sophisticated and interesting things, such as:

* Collect profiling data about an entire application
* Trace program execution to visualize the call tree
* Automatically retry failed asynchronous I/O, such as XHR or database queries
* Connect collaborating components in an application in a loosely coupled way without using events or pubsub.

In upcoming tutorials, we'll look at more examples of how to apply AOP, and the kinds of problems it is good at solving.
