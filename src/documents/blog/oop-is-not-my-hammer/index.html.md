---
layout: post
title: OOP is not my hammer
author: unscriptable
tags: [aop]
toc: true
ctime: 2013-08-13
mtime: 2013-08-13
---

*This post originally appeared on [HTML5 Hub](http://html5hub.com/oop-is-not-your-hammer/)*

As a young coder, the first design pattern I learned was inheritance.  This was, of course, my introduction to Object Oriented Programming (OOP).  I was blown away by the simple idea that I could add or change an object’s behavior by overriding bits of it.  I eventually went on to learn and use much more advanced [Design Patterns by the Gang of Four](http://en.wikipedia.org/wiki/Design_Patterns), all of which expand upon simple inheritance.  It seemed that inheritance and OOP were the answer to all design problems, whether known or *yet-to-be-discovered*.

<a name="jump"></a>

When I started working in JavaScript back 1996, I looked for ways to apply these familiar patterns.  I soon learned that JavaScript presented three hurdles to inheritance-based design patterns:

* Lack of formal interfaces
* Faulty prototype chaining
* Lack of a `super` construct

These hurdles have been tackled by countless programmers, myself included.  Unfortunately, throwing code at these issues only makes the ultimate goal (inheritance-based design patterns) more complicated than it should be.  

They’ve also been tackled via proposed changes to the language.  Some, such as `Object.create()`, have other great uses, but we’ve *moved on* from OOP.  JavaScript has it’s own set of tools that we can apply to create advanced patterns.  OOP is no longer my only hammer.

## The Problem

Let’s look at a simple ecommerce site.  Let’s say we have a page that displays a product and has an order form with an “Add to cart” button as well as a widget that allows the user to specify a quantity to purchase.  

This app would be pretty simple to design.  One approach would be to create three components: 

* A model that embodies a shopping cart item and has properties such as `productId` and `quantity`.
* One or more views that display the product and the order form.
* A controller that coordinates the transaction.

You probably recognize this as a typical MVC-like pattern.  There are lots of variations on MVC and a never-ending [list of implementations](http://todomvc.com/).

However, MVC is not the problem.  Product Management is.  They now want you to display a *live* shopping cart in the right-hand margin of the page.  The live shopping cart must show a list of all of the items in the cart, including the one being added, as well as recalculate the shipping costs, taxes, and the grand total.

You could apply OOP here by creating a new controller that inherits from the original.  The new extended controller could coordinate with a new shopping cart view, sending it the new item and the newly calculated numbers.  However, there are several potential problems with this approach:

* Complexity: the coordination required of the extended controller means it has more logic.
* Testing: the job of isolating the extended controller is exacerbated by the increased number of tasks it must perform and the increased number of dependencies.
* Embedded side effect: the updating of the live shopping cart is a side effect to the controllers main task, which is to coordinate the transaction.

If Product Management never asked for another feature, the impact of these problems would seem quite minor, but as you know, Product Management will *never stop asking* for new features.  After a few iterations, the controller inheritance hierarchy will likely become a convoluted mess of overrides, conditionals, and code forks.

Side effects are an immediate red flag to me.  It has been drilled into my brain that an object, a module, or a function should do only one thing at a time.  In our case, the controller should ensure that the user’s input (productId and quantity) gets delivered to the server.  The coordination with a live, on-screen shopping cart view is a side effect of this task.  

My brain immediately wants to delegate the shopping cart coordination to another component.  This idea, as it turns out, leads to other potential solutions and has some interesting benefits:

* Complexity: complexity is reduced by compartmentalizing into separate components.
* Testing: fewer dependencies and fewer tasks per component means each component is easier to test.
* No side effects!

## Solution #1: Events

One of the most popular design patterns in JavaScript is the “publish-subscribe” or “event bus” pattern.  Components ask to be notified of events (i.e. they “subscribe”) or they emit events (i.e. they “publish”).  Events typically consist of “name-spaced” strings and an associated payload.  

In our ecommerce example, our controller could publish an event such as “cart.add-item” that has product details as its payload.  Some other component, a shopping cart controller for instance, could subscribe to “cart.add-item” events and use them to manage the on-screen shopping cart.

The popularity of this pattern is pretty good proof that it works.  We have successfully delegated the task of coordinating the on-screen shopping cart to a new component and have encapsulated the task of communication between the controllers to the publish-subscribe mechanism.  However, the publish-subscribe pattern has some drawbacks, as well:

* More dependencies: the introduction of the publish-subscribe mechanism has added another dependency to the components.  Testing now requires that the publish-subscribe mechanism be mocked or stubbed.
* Non-native abstraction: events are published by emitting strings (with payloads) into an opaque mechanism.  Code quality tools, including linters, can’t ensure that events will go to the correct recipients and debugging tools don’t trace calls from publishers to subscribers.

## Solution #2: AOP

What is AOP? [Aspect Oriented Programming](http://en.wikipedia.org/wiki/Aspect-oriented_programming) is a means to change the behavior of – or add behavior to – methods and functions (including constructors) *non-invasively*.  The added behavior is called “advice” and can be added *before*, *after*, or *around* the function it advises.

AOP is particularly easy in JavaScript, since the advice is encapsulated in functions and functions are first-class objects.  You’ve probably already used AOP without knowing it.  The following code is a very primitive form of AOP:

```js
var origMethod = someObject.method;
someObject.method = function myAdvice () {
    // do something before
    var result = origMethod.apply(this, arguments);
    // do something after
    return result;
};
```

In this example, the replacement function, myAdvice, is advising the original method.  This type of advice is called “around” advice since it completely surrounds and can add behavior around the original method.  You can imagine forms of this in which we wish to only add advice before or after the original method.  

In fact, you can easily create your own helper function to add before and after advice:

```js
function before (f, advice) {
    return function () {
        advice.apply(this, arguments);
        return f.apply(this, arguments);
    };
}
function after (f, advice) {
    return function () {
        var result = f.apply(this, arguments);
        advice.call(this, result);
        return result;
    };
}
```

AOP has several applications.  In functional languages such as JavaScript, one of these is non-invasive component interconnect.  Let’s use these simple helper functions in our ecommerce example to show how this works.

First, let’s say that our controller has a method, `saveItem`, that responds when the user clicks the “Add to cart” button and posts the order details to the server.  Let’s also assert that the on-screen shopping cart controller has a method, `addItem`, that receives product details.  We could code the interaction between these two controllers with the following code:

```js
controller.saveItem = after(controller.saveItem, function () {
    onscreenCart.addItem(this.product);
});
```

What’s nice about this code is that it’s a bit more declarative and a bit more obvious what’s happening.  

Let’s extend the scenario a bit.  As we know, the call to the server will be asynchronous, so some time will have elapsed between the time the user clicks the “Add to cart” button and the server returns a result back.  During this time, Product Management would like to show a spinner on the on-screen shopping cart.  (Of course!)

If the controller’s `saveItem` method returns a promise, we could use that to know when to turn off the spinner or remove the product if the server rejects the post:

```js
controller.saveItem = after(controller.saveItem, function (promise) {
    var product = this.product;
    onscreenCart.showSpinner(); // show spinner!
    onscreenCart.addItem(product);
    promise.then(
        function () {
            onscreenCart.hideSpinner(); // hide spinner!
        },
        function (error) {
            onscreenCart.removeItem(product); // remove product!
        }
    );
});
```

This code is really easy to test.  `onscreenCart` has no dependencies on `controller` or on a publish-subscribe mechanism.  `controller` has no dependencies on `onscreenCart` or the publish-subscribe mechanism, either.  The advice function above could easily be tested as well by only stubbing `onscreenCart`!

## More info

AOP has many other applications and should be part of every Javascript developer’s toolkit.  

Want to get started with AOP?  Check out these excellent AOP resources and implementations:

* [AOP Tutorials on know cujoJS](/tutorials/aop)
* [AOP in 50 LOC](https://github.com/briancavalier/aop-jsconf-2013/blob/master/src/aop-simple.js)
* cujoJS's [meld](https://github.com/cujojs/meld) ([documentation](https://github.com/cujojs/meld/tree/master/docs))
* [Hooker](https://github.com/cowboy/javascript-hooker)
* Dojo's [dojo/aspect](https://github.com/dojo/dojo/blob/master/aspect.js)
* Flight's [flight/advice](https://github.com/flightjs/flight/blob/master/doc/advice_api.md)
* [dcl](https://github.com/uhop/dcl)
