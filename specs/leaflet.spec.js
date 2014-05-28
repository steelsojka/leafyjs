describe("Leaflet", function() {

  beforeEach(function() {
  });

  it("should create a new instance", function() {
    var leaflet = new Leaflet();
    var leaflet2 = Leaflet.create();

    expect(leaflet instanceof Leaflet).toBe(true);
    expect(leaflet2 instanceof Leaflet).toBe(true);
  });

  it("should bind an event", function() {
    var leaflet = new Leaflet();

    leaflet.on("test", function() {});

    var listeners = leaflet.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);
  });

  it("should emit an event", function() {
    var leaflet = new Leaflet();
    var spy = jasmine.createSpy();

    leaflet.on("test", spy); 

    leaflet.emit("test");
    
    expect(spy).toHaveBeenCalled();
  });

  it("should unbind an event", function() {
    var leaflet = new Leaflet();

    var unbind = leaflet.on("test", function() {});
    var listeners = leaflet.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);

    unbind();

    expect(listeners["test"]).toBeUndefined();

    var callback = function() {};

    leaflet.on("test", callback);

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);

    // This should just return out
    leaflet.off("avasda");

    // This should not error
    leaflet.off("test", function() {});

    leaflet.off("test", callback);

    expect(listeners["test"]).toBeUndefined();
  });

  it("should unbind all event listeners", function() {
    var leaflet = new Leaflet();

    leaflet.on("test", function() {});
    leaflet.on("test", function() {});

    var listeners = leaflet.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(2);

    leaflet.off("test");

    expect(listeners["test"]).toBeUndefined();
  });

  it("should link a child to a parent", function() {
    var child = new Leaflet();
    var parent = new Leaflet();

    child.linkParent(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(child.getParentLinks()[0]).toBe(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(parent.getChildLinks()[0]).toBe(child);
  });

  it("should link a parent to a child", function() {
    var child = new Leaflet();
    var parent = new Leaflet();

    parent.linkChild(child);

    expect(child.getParentLinks().length).toBe(1);
    expect(child.getParentLinks()[0]).toBe(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(parent.getChildLinks()[0]).toBe(child);
  });

  it("should emit events up through a heirarchy chain", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    var spy = jasmine.createSpy();

    grandparent.linkChild(parent);
    parent.linkChild(child);

    grandparent.on("test", spy);
    parent.on("test", spy);
    child.on("test", spy);

    child.emitUp("test");

    expect(spy.calls.count()).toBe(3);
  });

  it("should emit events up through a heirarchy chain stopping propagation in the middle", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    var parentspy = jasmine.createSpy();
    var grandparentspy = jasmine.createSpy();

    grandparent.linkChild(parent);
    parent.linkChild(child);

    grandparent.on("test", grandparentspy);

    parent.on("test", function(e) {
      e.stopPropagation();
      parentspy();
    });

    child.emitUp("test");

    expect(parentspy).toHaveBeenCalled();
    expect(grandparentspy).not.toHaveBeenCalled();
  });

  it("should chain link leaflets", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    expect(grandparent.linkChild(parent)).toBe(parent)
    expect(child.linkParent(parent)).toBe(parent)
  });

  it("should emit events down through a heirarchy chain", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    var spy = jasmine.createSpy();

    grandparent.linkChild(parent);
    parent.linkChild(child);

    child.on("test", spy);
    parent.on("test", spy);
    grandparent.on("test", spy);

    grandparent.emitDown("test");

    expect(spy.calls.count()).toBe(3);
  });

  it("should emit events down through a heirarchy chain stopping propagation in the middle", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    var parentspy = jasmine.createSpy();
    var childspy = jasmine.createSpy();

    grandparent.linkChild(parent);
    parent.linkChild(child);

    child.on("test", childspy);

    parent.on("test", function(e) {
      e.stopPropagation();
      parentspy();
    });

    grandparent.emitDown("test");

    expect(parentspy).toHaveBeenCalled();
    expect(childspy).not.toHaveBeenCalled();
  });

  it("should mixin the event emitter", function() {
    var leaflet1 = {};
    var leaflet2 = {};

    var spy1 = jasmine.createSpy();
    var spy2 = jasmine.createSpy();

    Leaflet.mixin(leaflet1);
    Leaflet.mixin(leaflet2);

    leaflet1.on("test", spy1);
    leaflet2.on("test", spy2);

    leaflet1.emit("test");
    leaflet2.emit("test");

    expect(spy1.calls.count()).toBe(1);
    expect(spy2.calls.count()).toBe(1);
  });

  it("should unlink a parent", function() {
    var parent = new Leaflet();
    var child = new Leaflet();

    child.linkParent(parent);

    expect(child.getParentLinks()[0]).toBe(parent);
    expect(parent.getChildLinks()[0]).toBe(child);

    child.unlinkParent(parent);

    expect(child.getParentLinks()[0]).toBeUndefined();
    expect(parent.getChildLinks()[0]).toBeUndefined();
    expect(child.getParentLinks().length).toBe(0);
    expect(parent.getChildLinks().length).toBe(0);
  });

  it("should unlink a child", function() {
    var parent = new Leaflet();
    var child = new Leaflet();

    parent.linkChild(child);

    expect(child.getParentLinks()[0]).toBe(parent);
    expect(parent.getChildLinks()[0]).toBe(child);

    parent.unlinkChild(child);

    expect(child.getParentLinks()[0]).toBeUndefined();
    expect(parent.getChildLinks()[0]).toBeUndefined();
    expect(child.getParentLinks().length).toBe(0);
    expect(parent.getChildLinks().length).toBe(0);
  });

  it("should transform the values from child to parent", function() {
    var parent = new Leaflet();
    var child = new Leaflet();
    var grandparent = new Leaflet();

    grandparent.linkChild(parent).linkChild(child);

    grandparent.on("test", function(event, value, word) {
      expect(value).toBe(15);
      expect(word).toBe("hello world");
    });

    parent.on("test", function(event, value, word) {
      event.transformValues(value + 10, word + " world");
    });

    parent.on("test", function(event, value, word) {
      expect(value).toBe(5);
      expect(word).toBe("hello");
    });

    child.emitUp("test", 5, "hello");
  });

  it("should destroy all links and listeners", function() {
    var parent = new Leaflet();
    var child = new Leaflet();
    var grandparent = new Leaflet();

    grandparent.linkChild(parent).linkChild(child);

    parent.on("test", function() {});

    expect(parent.getListeners()["test"].length).toBe(1);
    expect(parent.getChildLinks().length).toBe(1);
    expect(parent.getParentLinks().length).toBe(1);

    parent.destroy();

    expect(parent.getListeners()["test"]).toBeUndefined();
    expect(parent.getChildLinks().length).toBe(0);
    expect(parent.getParentLinks().length).toBe(0);
  });

  it("should bind an event only once", function() {
    var leaflet = new Leaflet();
    var spy = jasmine.createSpy();

    leaflet.once("test", spy);

    leaflet.emit("test");
    leaflet.emit("test");

    expect(spy.calls.count()).toBe(1);
  });

  it("should emit to all sibling nodes", function() {
    var root = new Leaflet();
    var sibling1 = new Leaflet();
    var sibling2 = new Leaflet();
    var parent1 = new Leaflet();
    var parent2 = new Leaflet();

    var rootSpy = jasmine.createSpy();
    var siblingSpy1 = jasmine.createSpy();
    var siblingSpy2 = jasmine.createSpy();

    root.linkParent(parent1).linkChild(sibling1);
    root.linkParent(parent2).linkChild(sibling2);

    root.on("test", rootSpy);
    sibling1.on("test", siblingSpy1);
    sibling2.on("test", siblingSpy2);

    root.emitSibling("test");

    expect(rootSpy).toHaveBeenCalled();
    expect(rootSpy.calls.count()).toBe(1);
    expect(siblingSpy1).toHaveBeenCalled();
    expect(siblingSpy1.calls.count()).toBe(1);
    expect(siblingSpy2).toHaveBeenCalled();
    expect(siblingSpy2.calls.count()).toBe(1);
  });

  it("should get the target of the event", function() {
    var leaflet = new Leaflet();

    leaflet.on("test", function(event) {
      expect(event.getTarget()).toBe(leaflet);
    });

    leaflet.emit("test");
  });

  it("should return the direction of the event", function() {
    var leaflet = new Leaflet();
    var parent = new Leaflet();

    leaflet.linkParent(parent);

    leaflet.on("test", function(event) {
      expect(event.getDirection()).toBe(Leaflet.DOWN);
    });

    parent.emitDown("test");
  });
});
