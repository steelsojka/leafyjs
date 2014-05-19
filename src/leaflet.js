(function(exports) {
  "use strict";

  var arrayProto = Array.prototype;
  var slice = arrayProto.slice;

  var UP = "up";
  var DOWN = "down";
  var FLAT = "flat";

  var methodTypes = {
    up: "emitUp",
    down: "emitDown"
  };

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

    if (fn) {
      pull(this._listeners[event], fn);

      if (this._listeners[event].length < 1) {
        delete this._listeners[event];
      }
    } else {
      delete this._listeners[event];
    }
  };

  Leaflet.prototype.emit = function(eventName) {
    var event = eventName instanceof LeafletEvent ? eventName : new LeafletEvent(eventName, FLAT);
    var args = toArray(arguments);

    eventName = event.getEventName();

    args[0] = event;

    if (!this._listeners[eventName]) {
      return;
    }

    for (var i = 0, len = this._listeners[eventName].length; i < len; i++) {
      this._listeners[eventName][i].apply(this, args);
    }
  };

  Leaflet.prototype.emitUp = function() {
    emit(UP, this._parentLinks, toArray(arguments));
  };

  Leaflet.prototype.emitDown = function() {
    emit(DOWN, this._childLinks, toArray(arguments));
  };

  Leaflet.prototype.linkChild = function(leaflet) {
    this._childLinks.push(leaflet);
    leaflet._parentLinks.push(this);
    return leaflet;
  };

  Leaflet.prototype.linkParent = function(leaflet) {
    this._parentLinks.push(leaflet);
    leaflet._childLinks.push(this);
    return leaflet;
  };

  Leaflet.prototype.unlinkChild = function(leaflet) {
    pull(this._childLinks, leaflet);
    pull(leaflet._parentLinks, this);
  };

  Leaflet.prototype.unlinkParent = function(leaflet) {
    pull(this._parentLinks, leaflet);
    pull(leaflet._childLinks, this);
  };

  // Static methods
  Leaflet.mixin = function(obj) {
    var leaflet = new Leaflet();

    extend(obj, leaflet);
    extend(obj, Leaflet.prototype);
  };

  var LeafletEvent = function(eventName, direction) {
    var stopProp = false;
    var values = [];

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

    this.transformValues = function() {
      values = toArray(arguments);
    };

    this.getValues = function() {
      return values;
    };
  };

  function emit(type, collection, args) {
    var eventName = args[0];
    var event = eventName instanceof LeafletEvent ? eventName : new LeafletEvent(eventName, type);
    var method = methodTypes[type];

    eventName = event.getEventName();

    event.transformValues(args.slice(1));

    args[0] = event;

    for (var i = 0, len = collection.length; i < len; i++) {
      var node = collection[i];

      if (node._listeners[eventName]) {
        for (var y = 0, len2 = node._listeners[eventName].length; y < len2; y++) {
          node._listeners[eventName][y].apply(node, args);
        }
      }
    }

    // If propagation was not stopped, it's safe to move to the next level
    if (!event.isPropagationStopped()) {
      // If the values get transformed we create a new set of arguments.
      // Transformed arguments only get passed to the next level and not siblings
      args = [event].concat(event.getValues());

      for (i = 0, len = collection.length; i < len; i++) {
        collection[i][method].apply(collection[i], args);
      }
    }
  }

  function pull(collection, item) {
    var index = indexOf(collection, item);

    if (index !== -1) {
      collection.splice(index, 1);
    }
  }

  function bind(context, fn) {
    var args = toArray(arguments, 2);

    return function() {
      fn.apply(context, args.concat(toArray(arguments)));
    };
  }

  function extend(obj1, obj2) {
    for (var key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        obj1[key] = obj2[key];
      }
    }

    return obj1;
  }

  function toArray(collection, start) {
    return slice.call(collection, (start || 0));
  }

  function indexOf(collection, element) {
    for (var i = 0, len = collection.length; i < len; i++) {
      if (collection[i] === element) {
        return i;
      }
    }

    return -1;
  }

  exports.Leaflet = Leaflet;
}(this));
