---
layout: post
title: When.js 3.2 released
author: briancavalier
tags: []
toc: true
ctime: 2014-05-28
mtime: 2014-05-28
---

We recently released when.js [3.2][1] (3.2.2 as of this post), [cujoJS][2]'s JavaScript promises implementation.

It has some pretty cool and unique features:

1. Speed - It's currently one of the fastest promise implementations.  In a current set of benchmarks from another promise vendor, when.js 3.2 is 10x to over 100x faster than the native Promise implementations in Firefox, Chrome, and Node (v0.11.13).

2. Scalability - Most other implementations don't scale well.  As the amount of parallelism and number of promises increases, their performance increases linearly or worse.  When.js's speed and memory usage scale better than linear, even for tens of thousands of parallel promises.

3. Debuggability - asynchronous code and promises are notoriously hard to debug.  In other JavaScript promise implementations, asynchronous failures are silent by default.  When.js 3.2 detects asynchronous failures and makes them loud by default.

We're planning followup posts to dig a bit deeper into each of these 3 aspects.  Specifically, we'll talk about the combination of architectural and code-level optimizations that make when.js fast and scalable, and the trade-offs and decisions we've made when dealing with debuggability.

When.js has consistently been one of the most widely used JavaScript promise implementations (80k+ npm downloads in the last month!), and we think that trend will continue!

[1]: https://github.com/cujojs/when
[2]: http://cujojs.com
