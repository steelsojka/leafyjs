(function(exports) {
  "use strict";

  var arrayProto = Array.prototype;
  var slice = arrayProto.slice;

  var UP = "up";
  var DOWN = "down";
  var FLAT = "flat";

  var Leaflet = function() {
    this._childLinks = [];
    this._parentLinks = [];
    this._listeners = {};
  };
  
  Leaflet.prototype.on = function(event, callback) {
    this._listeners[event] = this._listeners[event] || [];

    this._listeners[event].push(callback);

    return bind(this, function() {
      this.off(event, callback);
    });
  };

  Leaflet.prototype.off = function(event, fn) {
    if (!this._listeners[event]) {
      return;
    }

    var index = indexOf.call(this._listeners[event], fn);

    if (fn && index !== -1) {
      this._listeners[event].splice(index, 1);

      if (this._listeners[event].length < 1) {
        delete this._listeners[event];
      }
    } else {
      delete this._listeners[event];
    }
  };

  Leaflet.prototype.emit = function(eventName) {
    var event = eventName instanceof LeafletEvent ? eventName : new LeafletEvent(eventName, FLAT);
    var args = slice.call(arguments, 0);

    eventName = event.getEventName();

    args[0] = event;

    if (!this._listeners[eventName]) {
      return;
    }

    for (var i = 0, len = this._listeners[eventName].length; i < len; i++) {
      this._listeners[eventName][i].apply(this, args);
    }
  };

  Leaflet.prototype.emitUp = function(eventName) {
    var event = eventName instanceof LeafletEvent ? eventName : new LeafletEvent(eventName, UP);
    var args = slice.call(arguments, 0);

    eventName = event.getEventName();

    args[0] = event;

    for (var i = 0, len = this._parentLinks.length; i < len; i++) {
      var node = this._parentLinks[i];

      if (node._listeners[eventName]) {
        for (var y = 0, len2 = node._listeners[eventName].length; y < len2; y++) {
          node._listeners[eventName][y].apply(node, args);
        }
      }
    }

    // If propagation was not stopped, it's safe to move to the next level
    if (!event.isPropagationStopped()) {
      for (i = 0, len = this._parentLinks.length; i < len; i++) {
        this._parentLinks[i].emitUp.apply(this._parentLinks[i], args);
      }
    }
  };

  Leaflet.prototype.emitDown = function(eventName) {
    var event = eventName instanceof LeafletEvent ? eventName : new LeafletEvent(eventName, DOWN);
    var args = slice.call(arguments, 0);

    eventName = event.getEventName();

    args[0] = event;

    for (var i = 0, len = this._childLinks.length; i < len; i++) {
      var node = this._childLinks[i];

      if (node._listeners[eventName]) {
        for (var y = 0, len2 = node._listeners[eventName].length; y < len2; y++) {
          node._listeners[eventName][y].apply(node, args);
        }
      }
    }

    // If propagation was not stopped, it's safe to move to the next level
    if (!event.isPropagationStopped()) {
      for (i = 0, len = this._childLinks.length; i < len; i++) {
        this._childLinks[i].emitDown.apply(this._childLinks[i], args);
      }
    }
  };

  Leaflet.prototype.linkChild = function(leaflet) {
    this._childLinks.push(leaflet);
    leaflet._parentLinks.push(this);
  };

  Leaflet.prototype.linkParent = function(leaflet) {
    this._parentLinks.push(leaflet);
    leaflet._childLinks.push(this);
  };

  var LeafletEvent = function(eventName, direction) {
    var stopProp = false;

    this.isPropagationStopped = function() {
      return stopProp;
    };

    this.stopPropagation = function() {
      stopProp = true;
    };

    this.getDirection = function() {
      return direction;
    };

    this.getEventName = function() {
      return eventName;
    };
  };

  function bind(context, fn) {
    var args = slice.call(arguments, 2);

    return function() {
      fn.apply(context, args.concat(slice.call(arguments, 0)));
    };
  }

  var indexOf = arrayProto.indexOf || function(element) {
    for (var i = 0, len = this.length; i < len; i++) {
      if (this[i] === element) {
        return i;
      }
    }

    return -1;
  };

  exports.Leaflet = Leaflet;
}(this));
