import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertThrowsChain } from "../helpers.test.ts";
import { splitIntoChunks } from "./split-into-chunks.ts";


Deno.test("splitIntoChunks should return an empty array when an empty array is passed", () => {
  assertEquals(splitIntoChunks([], " ", 500), []);
});

Deno.test("splitIntoChunks should return a single-element array as is", () => {
  assertEquals(splitIntoChunks(["test"], " ", 500), [["test"]]);
});

Deno.test("splitIntoChunks should return a two-element array that does not need to be split as is",
  () => {
    assertEquals(splitIntoChunks(["test", "abc"], " ", 500), [
      ["test", "abc"],
    ]);
  });

Deno.test("splitIntoChunks should handle custom-length separators correctly", () => {
  // test123KKona
  assertEquals(
    splitIntoChunks(["test", "KKona", "abc"], "123", 13),
    [["test", "KKona"], ["abc"]],
  );
});

// for when the resulting chunk of bits is of the exact same length that was requested
Deno.test("splitIntoChunks should handle exact-requested-length output chunks", () => {
  const s =
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
    "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed " +
    "diam voluptua. At vero eos et accusam et justo duo dolores";

  assertEquals(splitIntoChunks(s.split(" "), " ", 72), [
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy".split(
      " ",
    ),
    "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam".split(
      " ",
    ),
    "voluptua. At vero eos et accusam et justo duo dolores".split(" "),
  ]);
});

Deno.test("splitIntoChunks should throw an error when the split is impossible", () => {
  assertThrowsChain(
    () => splitIntoChunks(["superlongmessage", "NaM"], " ", 15),
    Error,
    "Found a piece that can never fit the target length limit",
  );
});
