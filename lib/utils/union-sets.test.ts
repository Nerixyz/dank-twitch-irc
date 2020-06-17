import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertSameMembers } from "../helpers.test.ts";
import { unionSets } from "./union-sets.ts";


Deno.test("unionSets should clone the set if 1 set is given", function() {
  const original = new Set(["a", "c", "b"]);

  const result = unionSets([original]);

  assertSameMembers([...original], [...result]);

  // check if cloned, not same
  original.add("d");
  assertStrictEquals(original.size, 4);
  assertStrictEquals(result.size, 3);
});

Deno.test("unionSets should union 2 sets", function() {
  const originals = [
    new Set(["a", "b", "c"]),
    new Set(["c", "d", "e", "f"]),
  ];

  const result = unionSets(originals);

  assertSameMembers(["a", "b", "c", "d", "e", "f"], [...result]);
});

Deno.test("unionSets should union 3 sets", function() {
  const originals = [
    new Set(["a", "b", "c"]),
    new Set(["c", "d", "e", "f"]),
    new Set(["a", "z"]),
  ];

  const result = unionSets(originals);

  assertSameMembers(["a", "b", "c", "d", "e", "f", "z"], [...result]);
});
