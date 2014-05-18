describe("Leaflet", function() {

  beforeEach(function() {
  });

  it("should create a new instance", function() {
    var leaflet = new Leaflet();

    expect(leaflet._listeners).toBeDefined();
    expect(leaflet._parentLinks).toBeDefined();
    expect(leaflet._childLinks).toBeDefined();
  });

  it("should bind an event", function() {
    var leaflet = new Leaflet();

    leaflet.on("test", function() {});

    expect(leaflet._listeners["test"]).toBeDefined();
    expect(leaflet._listeners["test"].length).toBe(1);
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

    expect(leaflet._listeners["test"]).toBeDefined();
    expect(leaflet._listeners["test"].length).toBe(1);

    unbind();

    expect(leaflet._listeners["test"]).toBeUndefined();

    var callback = function() {};

    leaflet.on("test", callback);

    expect(leaflet._listeners["test"]).toBeDefined();
    expect(leaflet._listeners["test"].length).toBe(1);

    leaflet.off("test", callback);

    expect(leaflet._listeners["test"]).toBeUndefined();
  });

  it("should unbind all event listeners", function() {
    var leaflet = new Leaflet();

    leaflet.on("test", function() {});
    leaflet.on("test", function() {});

    expect(leaflet._listeners["test"]).toBeDefined();
    expect(leaflet._listeners["test"].length).toBe(2);

    leaflet.off("test");

    expect(leaflet._listeners["test"]).toBeUndefined();
  });

  it("should link a child to a parent", function() {
    var child = new Leaflet();
    var parent = new Leaflet();

    child.linkParent(parent);

    expect(child._parentLinks.length).toBe(1);
    expect(child._parentLinks[0]).toBe(parent);

    expect(child._parentLinks.length).toBe(1);
    expect(parent._childLinks[0]).toBe(child);
  });

  it("should link a parent to a child", function() {
    var child = new Leaflet();
    var parent = new Leaflet();

    parent.linkChild(child);

    expect(child._parentLinks.length).toBe(1);
    expect(child._parentLinks[0]).toBe(parent);

    expect(child._parentLinks.length).toBe(1);
    expect(parent._childLinks[0]).toBe(child);
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

    child.emitUp("test");

    expect(spy.calls.count()).toBe(2);
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

  it("should emit events down through a heirarchy chain", function() {
    var grandparent = new Leaflet();
    var parent = new Leaflet();
    var child = new Leaflet();

    var spy = jasmine.createSpy();

    grandparent.linkChild(parent);
    parent.linkChild(child);

    child.on("test", spy);
    parent.on("test", spy);

    grandparent.emitDown("test");

    expect(spy.calls.count()).toBe(2);
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
});
