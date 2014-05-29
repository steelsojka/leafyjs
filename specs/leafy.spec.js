describe("Leafy", function() {

  beforeEach(function() {
  });

  it("should create a new instance", function() {
    var leafy = new Leafy();
    var leafy2 = Leafy.create();

    expect(leafy instanceof Leafy).toBe(true);
    expect(leafy2 instanceof Leafy).toBe(true);
  });

  it("should bind an event", function() {
    var leafy = new Leafy();

    leafy.on("test", function() {});

    var listeners = leafy.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);
  });

  it("should emit an event", function() {
    var leafy = new Leafy();
    var spy = jasmine.createSpy();

    leafy.on("test", spy); 

    leafy.emit("test");
    
    expect(spy).toHaveBeenCalled();
  });

  it("should unbind an event", function() {
    var leafy = new Leafy();

    var unbind = leafy.on("test", function() {});
    var listeners = leafy.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);

    unbind();

    expect(listeners["test"]).toBeUndefined();

    var callback = function() {};

    leafy.on("test", callback);

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(1);

    // This should just return out
    leafy.off("avasda");

    // This should not error
    leafy.off("test", function() {});

    leafy.off("test", callback);

    expect(listeners["test"]).toBeUndefined();
  });

  it("should unbind all event listeners", function() {
    var leafy = new Leafy();

    leafy.on("test", function() {});
    leafy.on("test", function() {});

    var listeners = leafy.getListeners();

    expect(listeners["test"]).toBeDefined();
    expect(listeners["test"].length).toBe(2);

    leafy.off("test");

    expect(listeners["test"]).toBeUndefined();
  });

  it("should link a child to a parent", function() {
    var child = new Leafy();
    var parent = new Leafy();

    child.linkParent(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(child.getParentLinks()[0]).toBe(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(parent.getChildLinks()[0]).toBe(child);
  });

  it("should link a parent to a child", function() {
    var child = new Leafy();
    var parent = new Leafy();

    parent.linkChild(child);

    expect(child.getParentLinks().length).toBe(1);
    expect(child.getParentLinks()[0]).toBe(parent);

    expect(child.getParentLinks().length).toBe(1);
    expect(parent.getChildLinks()[0]).toBe(child);
  });

  it("should emit events up through a heirarchy chain", function() {
    var grandparent = new Leafy();
    var parent = new Leafy();
    var child = new Leafy();

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
    var grandparent = new Leafy();
    var parent = new Leafy();
    var child = new Leafy();

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

  it("should chain link leafys", function() {
    var grandparent = new Leafy();
    var parent = new Leafy();
    var child = new Leafy();

    expect(grandparent.linkChild(parent)).toBe(parent)
    expect(child.linkParent(parent)).toBe(parent)
  });

  it("should emit events down through a heirarchy chain", function() {
    var grandparent = new Leafy();
    var parent = new Leafy();
    var child = new Leafy();

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
    var grandparent = new Leafy();
    var parent = new Leafy();
    var child = new Leafy();

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
    var leafy1 = {};
    var leafy2 = {};

    var spy1 = jasmine.createSpy();
    var spy2 = jasmine.createSpy();

    Leafy.mixin(leafy1);
    Leafy.mixin(leafy2);

    leafy1.on("test", spy1);
    leafy2.on("test", spy2);

    leafy1.emit("test");
    leafy2.emit("test");

    expect(spy1.calls.count()).toBe(1);
    expect(spy2.calls.count()).toBe(1);
  });

  it("should unlink a parent", function() {
    var parent = new Leafy();
    var child = new Leafy();

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
    var parent = new Leafy();
    var child = new Leafy();

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
    var parent = new Leafy();
    var child = new Leafy();
    var grandparent = new Leafy();

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
    var parent = new Leafy();
    var child = new Leafy();
    var grandparent = new Leafy();

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

  it("should destroy all child nodes if the destroyed node is the only parent", function() {
    var parent = new Leafy();
    var child = new Leafy();
    var grandparent = new Leafy();

    grandparent.linkChild(parent).linkChild(child);

    expect(grandparent.isDestroyed()).toBe(false);
    expect(parent.isDestroyed()).toBe(false);
    expect(child.isDestroyed()).toBe(false);

    grandparent.destroy();

    expect(grandparent.isDestroyed()).toBe(true);
    expect(parent.isDestroyed()).toBe(true);
    expect(child.isDestroyed()).toBe(true);
  });

  it("should not destroy the child node if it has multiple parents", function() {
    var parent = new Leafy();
    var parent2 = new Leafy();
    var child = new Leafy();

    parent.linkChild(child).linkParent(parent2);

    expect(parent.isDestroyed()).toBe(false);
    expect(parent2.isDestroyed()).toBe(false);
    expect(child.isDestroyed()).toBe(false);

    parent.destroy();

    expect(parent.isDestroyed()).toBe(true);
    expect(parent2.isDestroyed()).toBe(false);
    expect(child.isDestroyed()).toBe(false);
  });

  it("should throw an error when calling destructable method on a destroyed node", function() {
    var child = new Leafy();

    child.destroy();

    expect(child.on).toThrow();
  });

  it("should bind an event only once", function() {
    var leafy = new Leafy();
    var spy = jasmine.createSpy();

    leafy.once("test", spy);

    leafy.emit("test");
    leafy.emit("test");

    expect(spy.calls.count()).toBe(1);
  });

  it("should emit to all sibling nodes", function() {
    var root = new Leafy();
    var sibling1 = new Leafy();
    var sibling2 = new Leafy();
    var parent1 = new Leafy();
    var parent2 = new Leafy();

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
    var leafy = new Leafy();

    leafy.on("test", function(event) {
      expect(event.getTarget()).toBe(leafy);
    });

    leafy.emit("test");
  });

  it("should return the direction of the event", function() {
    var leafy = new Leafy();
    var parent = new Leafy();

    leafy.linkParent(parent);

    leafy.on("test", function(event) {
      expect(event.getDirection()).toBe(Leafy.DOWN);
    });

    parent.emitDown("test");
  });
});
