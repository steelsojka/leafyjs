Leaflet.js
=================

[![Build Status](https://travis-ci.org/steelsojka/leafyjs.svg?branch=master)](https://travis-ci.org/steelsojka/leafyjs)
[![Coverage Status](https://coveralls.io/repos/steelsojka/leafyjs/badge.png)](https://coveralls.io/r/steelsojka/leafyjs)

An event emitter library with chainable hierarchies.

Install
-------
* Browser:
```html
<script type="text/javascript" src="leafy.min.js"></script>
```
* Node:
```
npm install leafyjs
```

Instantiation
-------------
You can create a new Leaflet 2 ways:
```javascript
var leaflet = new Leaflet();
```
#####or
```javascript
var leaflet = Leaflet.create();
```

You can mixin a Leaflet instance into any object with the `mixin` method:
```javascript
var obj = {};

Leaflet.mixin(obj);

obj.on("test", function() {
  console.log("woot!");
});

obj.emit("test");
```

API
---

####Instance Methods:
* `on(event, fn)`: Binds an event to the leaflet instance.
  * `event:String`: The event to bind to.
  * `fn:Function`: The function to call when the event is triggered.
  * **Returns** `unbind:Function`: A function that unbinds the listener.

* `off(event, [fn])`: Unbinds an event to the leaflet instance.
  * `event:String`: The event to unbind.
  * `[fn:Function]`: The listener to unbind. If omitted, all listeners for that event will be removed.

* `once(event, fn)`: Binds an event to the leaflet instance that is removed after it is called once.
  * `event:String`: The event to bind to.
  * `fn:Function`: The function to call when the event is triggered.
  * **Returns** `unbind:Function`: A function that unbinds the listener.

* `emit(event, [...args])`: Emits an event on the leaflet instance.
  * `event:String`: The event to emit.
  * `[...args:*]`: Arguments to pass to the listeners.

* `emitUp(event, [...args])`: Emits an event on the leaflet instance and upward through the hierarchy.
  * `event:String`: The event to emit.
  * `[...args:*]`: Arguments to pass to the listeners.

* `emitDown(event, [...args])`: Emits an event on the leaflet instance and downward through the hierarchy.
  * `event:String`: The event to emit.
  * `[...args:*]`: Arguments to pass to the listeners.

* `emitSibling(event, [...args])`: Emits an event on the leaflet instance and all sibling leaflet instances.
  A sibling is any instance that shares the same parent.
  * `event:String`: The event to emit.
  * `[...args:*]`: Arguments to pass to the listeners.

* `linkChild(leaflet)`: Adds a leaflet instance as a child.
  * `leaflet:Leaflet`: The leaflet instance to add.
  * **Returns** `Leaflet`: The leaflet instance passed in.

* `linkParent(leaflet)`: Adds a leaflet instance as a parent.
  * `leaflet:Leaflet`: The leaflet instance to add.
  * **Returns** `Leaflet`: The leaflet instance passed in.

* `unlinkParent(leaflet)`: Removes a leaflet instance as a parent.
  * `leaflet:Leaflet`: The leaflet instance to remove.
  * **Returns** `Leaflet`: The leaflet instance passed in.

* `unlinkChild(leaflet)`: Removes a leaflet instance as a child.
  * `leaflet:Leaflet`: The leaflet instance to remove.
  * **Returns** `Leaflet`: The leaflet instance passed in.

* `destroy()`: Removes all links and listeners. This should be called when removing the leaflet. Not doing so can cause memory leaks.

####Static Methods:
* `mixin(obj)`: Mixes a leaflet instance into any object.
  * `obj:Object`: The object to mixin.
* `create()`: Creates a new Leaflet instance. An alternative to using the `new` operator.
  * **Returns** `Leaflet`: A new leaflet instance.

####Constants:
* Directions (Useful for checking the direction of the event):
  * `UP`
  * `DOWN`
  * `SIBLING`
  * `FLAT`

```javascript
var parent = new Leaflet();
var child = new Leaflet();

parent.linkChild(child);

parent.on("test", function(event) {
  if (event.getDirection() === Leaflet.UP) {
    // Do something only when event is going up
  }
});

child.emitUp("test");
```

####Event Methods:
* `isPropagationStopped()`: Returns whether the propagation is stopped.
  * **Returns** `Boolean`: Whether the propagation is stopped.

* `stopPropagation()`: Prevents the event from moving to the **NEXT** level. The event continues to be fired on the current
  level, but will not move up/down. This only effects events that are emitted through the `emitUp` and `emitDown` methods.

```javascript
var parent = new Leaflet();
var child = new Leaflet();

parent.linkChild(child);

child.on("test", function(event) {
  event.stopPropagation();
});

child.on("test", function(event) {
  // This listener will still get called even though we called stopPropagation on the previous listener
});

parent.on("test", function(event) {
  // This listener WILL NOT GET CALLED
});

child.emitUp("test", "woot!");
```

* `getDirection()`: Returns the direction of the event.
  * **Returns** `Direction`: The direction of the event.

* `getEventName()`: Returns the event name.
  * **Returns** `String`: The event name.

* `getTarget()`: Returns the target leaflet.
  * **Returns** `Leaflet`: The target leaflet

* `transformValues(...args)`: Transforms any additional arguments. The new values will only be available to the next level.
  This only effects events that are emitted through the `emitUp` and `emitDown` methods.
  * `...args:*`: Arguments to pass to the listeners.

```javascript
var parent = new Leaflet();
var child = new Leaflet();

parent.linkChild(child);

child.on("test", function(event, param) {
  console.log(param); // woot!

  event.transformValues("blorg!");
});

child.on("test", function(event, param) {
  // Even though we transformed the value in the last listener
  // it only takes effect when moved to the parent/child
  console.log(param); // woot!
});

parent.on("test", function(event, param) {
  console.log(param); // blorg!
});

child.emitUp("test", "woot!");
```

* `getValues()`: Returns the additional arguments associated with the event.
  * **Returns** `Array`: An array of values.
