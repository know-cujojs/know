---
layout: tutorial
title: Intro to Object-oriented CSS
tags: ['aop']
url: '/tutorials/css/intro-to-object-oriented-css'
urls: ['/tutorials/css/intro-to-object-oriented-css.html.md']
toc: true
ctime: 2013-08-13T00:00:00
mtime: 2013-08-13T00:00:00
order: 1
---

CSS is a critical component of any web-based application.
However, its architectural importance is often undervalued -- or even
completely disregarded -- by many engineering teams, left to the
"artsy folks" to manage.

In all but the most trivial web-base applications, poorly
designed CSS can cause just as many bugs and maintainability problems
as poorly designed JavaScript.

## The architecture of CSS

CSS cannot be built in isolation since it is manifested in HTML.
The HTML dictates the composition and the inheritance of CSS rules, while
also providing up to half of the type information needed to
apply the rules.

> The activity of designing CSS must be done in the scope
of the HTML.

## The process of designing CSS

### Step 1: Identify the domain objects

The first task is to identify the domain objects.  When describing and
talking about the user interface, what are the *things* you talk about?
These are the domain objects.

### Step 2: Identify the relationships

The next task is to identify the relationships between objects.  Does
an object only exist inside another object?  Does it always exist
at the top of another?  At the left or right?  Do some objects exist
only to provide layout for other objects? ("containers")

### Step 3: Identify the messages

(how to talk about states / messages?)



**** It's important to recognize that the element you want to style is
very likely to *not* be the element that needs to be specialized with
a class name.  You have to identify the domain object that is being
specialized!




## The curse of unmanaged CSS

Every unmanaged CSS endeavor inevitably goes down the same path. Hundreds
-- or, more often, thousands -- of lines of style declarations.  Several dozen
`display: none;` and `display: block;` rules alongside ever more
`font-size: 83.33%;` rules.

At the same time, it seems there's a never-ending need to increase the
specificity of selectors in order to override some other rule that's
overriding the one was meant to be applied.  Then, failing to resolve
the correct cascade order, somebody inevitably decides to sprinkle
`!important` qualifiers in the rules to override specificity.

It's futile to attempt to try to solve these problems by looking at the
CSS alone.  This is because the CSS is manifested in HTML: the combinatorial
effects of the CSS rules -- both through composition and inheritance --
happen in the HTML, not the CSS files.

In short: you can't fix the CSS without understanding the structure of
the HTML.

## CSS patterns

Luckily, it's not hard to learn some basic patterns that not only
provide a solid foundation, but also feel natural and familiar to
engineers who have already mastered basic object-oriented patterns.




- lack of reuse / reams of css
- long-running, monolithic files
- specificity hell
- co-location of HTML and CSS

## OOCSS and SMACSS

*** talk about how these provide some simple heuristics that can help
prevent common issues such as "specificity hell" without causing
"class-itis" but don't address ... what???

https://github.com/stubbornella/oocss/wiki

also point to our presentation!

We won't be following either of these closely, but...????

also: less and sass are interesting, but you can do a lot with just css.

## Applying object orientation

At a basic level, CSS class names are akin to classes in classical OOP
(constructor-prototype pairs in JavaScript).  They represent a classification
of a type.  Let's go with this analogy and see where it takes us.

### Base classes

```html
<section class="card"></section>
```

In this snippet, we have assigned a class name, `card`, to the `section`
element.  In object-oriented terms, we have declared that the `section`
element *is a* `card`.  A `card` is something we've identified as a
*visual component*.  While studying a screen mockup or UI prototype, we've
identified some element -- or collection of elements -- that feels like
a component.  How do you know it's a component?  It can take practice to
be able to identify components, but there's a reasonably good heuristic you
can use: *if it's a thing you find yourself talking about when you
describe the UI, then it's likey a component*.

So, our `card` is a visual component.  Perhaps cards are a sort of
full-screen container that we'd like to slide in or out of view, so
we position it absolutely:

```css
.card {
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
}
```

Notice that the rules in the `card` style block are concerned only with
the positioning and layout of the element.  This is the CSS equivalent of
applying the [Single Responsibility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle).
Note, also, that the `left` property has been left out.  We'll see shortly
that this allows us to *more easily* apply the
[Interface Segregation Principle](http://en.wikipedia.org/wiki/Interface_segregation_principle).

Of course, when you're looking at a screen mockup or UI prototype of an
application, it's hard to look past the other attributes of a `card`.
It might have a noticeable background color, opacity, or border radius.
The same skills that make you an awesome OOP coder can help you now!

Try to think about the possible variations of the `card` type.  Is it
possible that other instances of `card` will have a different background
color?  Perhaps?  If so, then leave them out of the "base class".
If in doubt, just use Nicole Sullivan's
[first principle](https://github.com/stubbornella/oocss/wiki#separate-structure-and-skin) of OOCSS:

> Separate structure (position, layout) from skin (colors, borders)

It is possible that structure and skin are both essential to the single
purpose of a particular visual component.  This happens occasionally,
and in this case it is acceptable to break this core principle.

## Decorators

Let's imagine that there are at least two variations of a `card` in
our application: one that slides in from the right and one that slides in
from the left:

```css
.slide-from-right {
	left: 100%;
}
.slide-from-left {
	right: 100%;
}
```

These are not skin variations.  They are structure variations.  Variations
can be declared for any set of style properties.

If we want to declare a `card` that is also has `slide-from-right` behavior,
we do that in the HTML by applying both class names:

```html
<section class="card slide-from-right"></section>
```

Perhaps we also have identified two skin variations: `normal` and `contrast`.
The latter describes a contrasting color scheme so that the `card` stands
apart from the other, normal cards:

```css
.normal {
	background-color: #fff;
	color: 333;
}
.contrast {
	background-color: #000;
	color: eee;
}
```

Now we can apply a skin class to our `card`:

```html
<section class="card slide-from-right normal"></section>
```

If this is starting to feel like a lot of class names, don't worry.  In
practice, the number of names is rarely more than three.  In fact, we can
eliminate one of these names: `normal`.  Generally, you shouldn't have to
specify *normal* skin styles.  These are typically specified in a base
style sheet, often called a "reset style sheet".

Note that the `contrast` class is not limited to just `card` elements.
We could apply it to any other elements and it would still provide the
same behavior.  In essence, we've created a reusable *decorator class*.

```html
<p class="side-bar contrast">lorem ipsum</p>
```

Decorators can also be finely-targeted.  Let's say you've identified
form labels that need to have a contrasting color scheme, but the
mockups use different colors.  This is easy in CSS:

```css
.contrast {
	background-color: #000;
	color: eee;
}
label.contrast {
	color: f77; /* contrast labels are muted red */
}
```

## Specializations

In classical OOP, specialization is typically implemented via inheritance.
CSS3 provides no mechanism for inheritance of rules (although CSS
pre-processors such as [LESS](http://lesscss.org/) and
[SASS](http://sass-lang.com/) do).
However, we can implement certain types of specialization via CSS through
*specificity*, which is roughly analogous to scoping when increasing
the specificity in the direction of the ancestors.

*** the above needs a lot of work! ***

Let's say our requirements for `card` components on a certain screen
should leave some extra space at the top for additional controls.  On
the `settings` screen, our `card` component must keep its content out
of the way of these controls.  There are a few CSS methods for doing
this, but here's a simple one:

```css
.settings .card {
	padding-top: 64px;
}
```

In CSS terms, we've increased the specificity of the
rule to only apply to `card` components that exist inside elements
with a `settings` class.  In OOP concepts, we've specialized `card`
components that exist inside `settings` components.  Unlike OOP, there's
no explicit class, `card-inside-setting`, but the net effect is the same.

We could also specialize a `card` component by increasing the specificity
of its element directly, rather than at a parent element:

```css
.card.has-controls {
	padding-top: 64px;
}
```

With this rule, we have effectively decorated the `card` with `has-controls`.
The subtle difference between this scenario and decoration is the
applicability of the `has-controls` class.  If `has-controls` could be
applied to other components, then it might be more accurately thought of
as a decorator, not a specialization.

Specializations apply to only a particular type of component.

## States

Earlier, we declared that out `card` components slide in from either the
left or the right.  We created decorators the specify whether they are
`slide-from-left` or `slide-from-right`, but we haven't declared any
rules that move them.

To tackle this task, we need to think of the `card` components as having
stateful information about their visible state.  This is a Boolean state:
"Is this `card` visible, or not?"

Ignoring animations or transitions for the moment, it's pretty easy to
define two rules that position a `card` in its visible state or its hidden
state.  Actually, if we assume that the hidden state is the "normal"
state, then we can define just one rule, the visible state:

```css
.slide-from-right.visible {
	left: 0;
}
.slide-from-left.visible {
	right: 0;
}
```

Notice that this rule applies to the `slide-from-right` and `slide-from-left`
decorators, not to the `card` class.  We have created specializations
of the `slide-from-XXX` decorators that take affect when elements are
also given the `visible` class name.

In JavaScript in a modern browser, this could be done quite simply:

```js
cardComponent.classList.add('visible');
```

To hide the component, you would remove the `visible` class:

```js
cardComponent.classList.remove('visible');
```

States can be much more sophisticated.  You can change the layout or
styling of an entire application by applying state classes to elements
high in the DOM.  For instance, you could decide which `card` to show
based on which state the application is in.

If the application states are `normal`, `settings`, and `browse`, then
we could create a corresponding set of `card` specializations that
identify the card that is visible when the application is in that state.
In other words, we would specialize all of the `card` components by assigning
each a unique name.  Then (assuming all `card` components are `slide-from-left`)
we can create some rules to show the `card` that corresponds to the
application's current state:

```css
.normal .card.main {
	right: 0;
}
.settings .card.settings {
	right: 0;
}
.browse .card.browse {
	right: 0;
}
```

These rules will make the `card` with the `main` specialization visible
when the application is in the `normal` state.  The `settings`-specialized
`card` wil be visible when the application is in the `settings` state.
The `browse` `card` will be visible when the application is in the `browse`
state.

It's also possible to omit the `normal` class, but the rules get a bit
more complicated.  This is due to the fact that you have to write two
rules for the `main` specialization: one rule for the normal case which
makes the `card` visible, and one rule for the other states to hide it:

```css
/* show it by default */
.card.main {
	right: 0;
}
/* hide it when we're not in the default, "normal" state */
.settings .card.main,
.browse .card.main {
	right: 100%;
}
.settings .card.settings {
	right: 0;
}
.browse .card.browse {
	right: 0;
}
```

Setting the application state in JavaScript is simple:

```js
var prevState;
function (currState) {
	document.body.classList.remove(prevSate);
	document.body.classList.add(currState);
}
```

## Animations and transitions

It's cool that we've used CSS to display one of the `card` components
by just a tiny bit of JavaScript and some CSS rules.  So, what if we
want to animate the state transitions?  This is super easy by using
decorators.  Define some decorators that describe the type of CSS
transition that should be applied when the state changes:

```css
.slide-from-left {
	transition: right 0.5s ease;
}
.slide-from-right {
	transition: left 0.5s ease;
}
```

We've used the same decorators we used to specify the default (hidden)
positions of the `card` components, but if we were to define different
styles of transitions, we could create other decorators to apply to the
`card` components:

```html
<section class="card slide-from-right slide-fast"></section>
```


## Beyond class names

This is an interesting case: the tag type is already a classification:
Some elements have a fairly unambiguois type already.

```html
<button class="button">click me!</button>
```

::active and other built-in "states"

attributes when using data


## Themes

themes are cross-cutting so they are largely specializations

maybe we should elaborate more about the difference between decorators
and specializations?  (decorators are applied in the HTML, specializations
in CSS)
