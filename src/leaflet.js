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
    // These variables have to be "private" to avoid having circular references.
    var childLinks = [];
    var parentLinks = [];
    var listeners = {};

    this.getListeners = function() {
      return listeners;
    };

    this.getParentLinks = function() {
      return parentLinks;
    };

    this.getChildLinks = function() {
      return childLinks;
    };

    this.on = function(event, callback) {
      listeners[event] = listeners[event] || [];

      listeners[event].push(callback);

      return bind(this, function() {
        this.off(event, callback);
      });
    };

    this.once = function(event, fn) {
      var unbind = this.on(event, bind(this, function() {
        fn.apply(this, arguments);
        unbind();
      }));

      return unbind;
    };

    this.off = function(event, fn) {
      if (!listeners[event]) {
        return;
      }

      if (fn) {
        pull(listeners[event], fn);

        if (listeners[event].length < 1) {
          delete listeners[event];
        }
      } else {
        delete listeners[event];
      }
    };

    this.emit = function(eventName) {
      emit(FLAT, [this], toArray(arguments));
    };

    this.emitUp = function() {
      emit(UP, parentLinks, toArray(arguments));
    };

    this.emitDown = function() {
      emit(DOWN, childLinks, toArray(arguments));
    };

    this.linkChild = function(leaflet) {
      childLinks.push(leaflet);
      leaflet.getParentLinks().push(this);
      return leaflet;
    };

    this.linkParent = function(leaflet) {
      parentLinks.push(leaflet);
      leaflet.getChildLinks().push(this);
      return leaflet;
    };

    this.unlinkChild = function(leaflet) {
      pull(childLinks, leaflet);
      pull(leaflet.getParentLinks(), this);
      return leaflet;
    };

    this.unlinkParent = function(leaflet) {
      pull(parentLinks, leaflet);
      pull(leaflet.getChildLinks(), this);
      return leaflet;
    };

    this.destroy = function() {
      for (var i = 0, len = parentLinks.length; i < len; i++) {
        this.unlinkParent(parentLinks[i]);
      }

      for (i = 0, len = childLinks.length; i < len; i++) {
        this.unlinkChild(childLinks[i]);
      }

      forOwn(listeners, function(val, key) {
        delete listeners[key];
      });
    };
  };

  // Static methods
  Leaflet.mixin = function(obj) {
    extend(obj, new Leaflet());
  };

  Leaflet.UP = UP;
  Leaflet.DOWN = DOWN;
  Leaflet.FLAT = FLAT;

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

    event.transformValues.apply(event, args.slice(1));

    args[0] = event;

    for (var i = 0, len = collection.length; i < len; i++) {
      var node = collection[i];
      var listeners = node.getListeners();

      if (listeners[eventName]) {
        for (var y = 0, len2 = listeners[eventName].length; y < len2; y++) {
          listeners[eventName][y].apply(node, args);
        }
      }
    }

    // If propagation was not stopped, it's safe to move to the next level
    if (!event.isPropagationStopped() && type !== FLAT) {
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
    forOwn(obj2, function(val, key) {
      obj1[key] = val;
    });

    return obj1;
  }

  function forOwn(obj, fn) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key);
      }
    }
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
