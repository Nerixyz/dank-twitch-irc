import { EditableTimeout } from "./editable-timeout.ts";

// TODO: we need sinon Saj

Deno.test('EditableTimeout', () => {});

//describe("./utils/editable-timeout", function () {
//  describe("EditableTimeout", function () {
//    beforeEach(function () {
//      // initialize the time to be 5000 milliseconds after
//      // UTC epoch
//      sinon.useFakeTimers(5000);
//    });
//
//   Deno.test("should capture run time and current time at creation", function () {
//      // tslint:disable-next-line:no-empty
//      const timeout = new EditableTimeout(() => {}, 1234);
//      assertStrictEquals(timeout.startTime, 5000);
//      assertStrictEquals(timeout.runTime, 1234);
//    });
//
//   Deno.test("should run the callback after `runTime` if not edited", function () {
//      let wasHit = false;
//      const timeout = new EditableTimeout(() => {
//        wasHit = true;
//      }, 1234);
//
//      sinon.clock.tick(1233);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      sinon.clock.tick(1);
//      assertTrue(wasHit);
//      assertTrue(timeout.completed);
//    });
//
//   Deno.test("should be stoppable", function () {
//      let wasHit = false;
//      const timeout = new EditableTimeout(() => {
//        wasHit = true;
//      }, 1234);
//
//      sinon.clock.tick(1233);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      timeout.stop();
//      sinon.clock.tick(1);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      sinon.clock.tick(1000000);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//    });
//
//   Deno.test("should do nothing if stop is called after timeout is completed", function () {
//      let wasHit = false;
//      const timeout = new EditableTimeout(() => {
//        wasHit = true;
//      }, 1234);
//
//      sinon.clock.tick(1234);
//      assertTrue(wasHit);
//      assertTrue(timeout.completed);
//
//      timeout.stop();
//      assertTrue(wasHit);
//      assertTrue(timeout.completed);
//    });
//
//   Deno.test("should be possible to update the remaining run time", function () {
//      let wasHit = false;
//      const timeout = new EditableTimeout(() => {
//        wasHit = true;
//      }, 2000);
//
//      sinon.clock.tick(1000);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      timeout.update(1500);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      sinon.clock.tick(499);
//      assertFalse(wasHit);
//      assertFalse(timeout.completed);
//
//      sinon.clock.tick(1);
//      assertTrue(wasHit);
//      assertTrue(timeout.completed);
//    });
//
//   Deno.test("should do nothing if update is called after timeout is completed", function () {
//      let hitCount = 0;
//      const timeout = new EditableTimeout(() => {
//        hitCount += 1;
//      }, 1000);
//
//      sinon.clock.tick(999);
//      assertStrictEquals(hitCount, 0);
//      assertFalse(timeout.completed);
//
//      sinon.clock.tick(1);
//      assertStrictEquals(hitCount, 1);
//      assertTrue(timeout.completed);
//
//      timeout.update(2000);
//      assertStrictEquals(hitCount, 1);
//      assertTrue(timeout.completed);
//
//      sinon.clock.tick(1000);
//      assertStrictEquals(hitCount, 1);
//      assertTrue(timeout.completed);
//    });
//  });
//});
