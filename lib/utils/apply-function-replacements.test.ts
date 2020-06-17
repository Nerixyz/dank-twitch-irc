import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  applyReplacement,
  applyReplacements,
} from "./apply-function-replacements.ts";


Deno.test("applyReplacement should delegate execution properly", () => {
  const self = {
    abc: "def",
  };

  class Target {
    public something = "KKona";

    public a(one: string, two: string, three: string): string {
      // test for the "this" reference in this class
      return this.something + one + two + three;
    }
  }

  const target = new Target();

  applyReplacement(self, target, "a", function a(
    originalFn,
    one: string,
    two: string,
    three: string,
  ): string {
    // test for the "this" reference in the replacement function
    return originalFn(one, two, three) + this.abc;
  });

  assertStrictEquals(target.a("1", "2", "3"), "KKona123def");
});

Deno.test("applyReplacement should not create a enumerable property on the target object",
  () => {
    const self = {};

    class Target {
      public a(): string {
        return "a";
      }
    }

    const target = new Target();
    assertEquals(Object.keys(target), []);

    applyReplacement(self, target, "a", (originalFn): string => originalFn());

    assertEquals(Object.keys(target), []);
  });

Deno.test("applyReplacements should apply all replacements given in functions map", () => {
  const self = {
    abc: "def",
  };

  class Target {
    public a(): string {
      return "a";
    }
    public b(): string {
      return "b";
    }
    public c(): string {
      return "c";
    }
  }

  const target = new Target();

  applyReplacements(self, target, {
    a(originalFn) {
      return originalFn() + "x";
    },
    b(originalFn) {
      return originalFn() + "y";
    },
    c(originalFn) {
      return originalFn() + "z";
    },
  });

  assertStrictEquals(target.a(), "ax");
  assertStrictEquals(target.b(), "by");
  assertStrictEquals(target.c(), "cz");
});
