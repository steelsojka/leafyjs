(function(exports) {
  "use strict";

  var arrayProto = Array.prototype;
  var slice = arrayProto.slice;

  var UP = "up";
  var DOWN = "down";
  var FLAT = "flat";
  var SIBLING = "sibling";

  var methodTypes = {
    up: "emitUp",
    down: "emitDown"
  };

  var Leafy = function() {
    // These variables have to be "private" to avoid having circular references.
    var childLinks = [];
    var parentLinks = [];
    var listeners = {};
    var destroyed = false;

    this.isDestroyed = function() {
      return destroyed;
    };

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

    this.emit = function() {
      emit(this, FLAT, [], toArray(arguments));
    };

    this.emitUp = function() {
      emit(this, UP, parentLinks, toArray(arguments));
    };

    this.emitDown = function() {
      emit(this, DOWN, childLinks, toArray(arguments));
    };

    this.emitSibling = function() {
      var collection = [];

      for (var i = 0, len = parentLinks.length; i < len; i++) {
        collection = collection.concat(pull(parentLinks[i].getChildLinks(), this, true));
      }

      emit(this, SIBLING, collection, toArray(arguments));
    };

    this.linkChild = function(leafy) {
      childLinks.push(leafy);
      leafy.getParentLinks().push(this);
      return leafy;
    };

    this.linkParent = function(leafy) {
      parentLinks.push(leafy);
      leafy.getChildLinks().push(this);
      return leafy;
    };

    this.unlinkChild = function(leafy) {
      pull(childLinks, leafy);
      pull(leafy.getParentLinks(), this);
      return leafy;
    };

    this.unlinkParent = function(leafy) {
      pull(parentLinks, leafy);
      pull(leafy.getChildLinks(), this);
      return leafy;
    };

    this.destroy = function(key) {
      for (var i = 0, len = parentLinks.length; i < len; i++) {
        this.unlinkParent(parentLinks[i]);
      }

      for (i = 0, len = childLinks.length; i < len; i++) {
        var childLink = childLinks[i];
        var _parentLinks = childLink.getParentLinks();

        if (_parentLinks.length === 1 && _parentLinks[0] === this) {
          childLink.destroy();
        } else {
          this.unlinkChild(childLink);
        }
      }

      forOwn(listeners, function(val, key) {
        delete listeners[key];
      });

      destroyed = true;
    };
  };

  // Static methods
  Leafy.mixin = function(obj) {
    extend(obj, new Leafy());
  };

  Leafy.create = function() {
    return new Leafy();
  };

  Leafy.UP = UP;
  Leafy.DOWN = DOWN;
  Leafy.FLAT = FLAT;
  Leafy.SIBLING = SIBLING;

  var LeafyEvent = function(target, eventName, direction) {
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

    this.getTarget = function() {
      return target;
    };

    this.transformValues = function() {
      values = toArray(arguments);
    };

    this.getValues = function() {
      return values;
    };
  };

  function emitCollection(eventName, collection, args) {
    for (var i = 0, len = collection.length; i < len; i++) {
      var node = collection[i];
      var listeners = node.getListeners();

      if (listeners[eventName]) {
        for (var y = 0, len2 = listeners[eventName].length; y < len2; y++) {
          listeners[eventName][y].apply(node, args);
        }
      }
    }
  }

  function emit(target, type, collection, args) {
    var eventName = args[0];
    var event = eventName instanceof LeafyEvent ? eventName : new LeafyEvent(target, eventName, type);
    var method = methodTypes[type];

    eventName = event.getEventName();

    event.transformValues.apply(event, args.slice(1));

    args[0] = event;

    emitCollection(eventName, [target], args); // Emit on the current target first

    // If propagation was not stopped, it's safe to move to the next level
    if (!event.isPropagationStopped() && (type === UP || type === DOWN)) {
      // If the values get transformed we create a new set of arguments.
      // Transformed arguments only get passed to the next level and not siblings
      args = [event].concat(event.getValues());

      for (var i = 0, len = collection.length; i < len; i++) {
        collection[i][method].apply(collection[i], args);
      }
    } else if (type === SIBLING) {
      emitCollection(eventName, collection, args);
    }

    return event;
  }

  function pull(collection, item, clone) {
    collection = clone ? collection.slice(0) : collection;

    var index = indexOf(collection, item);

    if (index !== -1) {
      collection.splice(index, 1);
    }

    return collection;
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

  exports.Leafy = Leafy;
}(this));
