import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { decodeValue, parseTags } from "./tags.ts";


Deno.test("decodeValue should decode undefined as null", () => {
  assertStrictEquals(decodeValue(undefined), null);
});
Deno.test("decodeValue should decode empty string as empty string", () => {
  assertStrictEquals("", decodeValue(""));
});
Deno.test("decodeValue should decode semicolons", () => {
  assertStrictEquals("abc;def", decodeValue("abc\\:def"));
  assertStrictEquals(";", decodeValue("\\:"));
});
Deno.test("decodeValue should decode spaces", () => {
  assertStrictEquals("abc def", decodeValue("abc\\sdef"));
  assertStrictEquals(" ", decodeValue("\\s"));
});
Deno.test("decodeValue should decode backslashes", () => {
  assertStrictEquals("abc\\def", decodeValue("abc\\\\def"));
  assertStrictEquals("\\", decodeValue("\\\\"));
});
Deno.test("decodeValue should decode CR", () => {
  assertStrictEquals("abc\rdef", decodeValue("abc\\rdef"));
  assertStrictEquals("\r", decodeValue("\\r"));
});
Deno.test("decodeValue should decode LF", () => {
  assertStrictEquals("abc\ndef", decodeValue("abc\\ndef"));
  assertStrictEquals("\n", decodeValue("\\n"));
});
Deno.test("decodeValue should not apply unescaping multiple times", () => {
  assertStrictEquals("abc\\ndef", decodeValue("abc\\\\ndef"));
});
Deno.test("decodeValue should ignore dangling backslashes", () => {
  assertStrictEquals("abc def", decodeValue("abc\\sdef\\"));
});
Deno.test("decodeValue should support a combination of all escape sequences", () => {
  assertStrictEquals(
    "abc; \\\r\ndef",
    decodeValue("abc\\:\\s\\\\\\r\\ndef\\"),
  );
});

Deno.test("parseTags should parse no-value tag as null", () => {
  assertEquals(parseTags("enabled"), { enabled: null });
});

Deno.test("parseTags should parse empty-value tag as empty string", () => {
  assertEquals(parseTags("enabled="), { enabled: "" });
});

Deno.test("parseTags should keep boolean/numeric values as-is without coercion", () => {
  assertEquals(parseTags("enabled=1"), { enabled: "1" });
});

Deno.test("parseTags should decode escaped tag values", () => {
  assertEquals(parseTags("message=Hello\\sWorld!"), {
    message: "Hello World!",
  });
});

Deno.test("parseTags should override double tags with the last definition", () => {
  assertEquals(parseTags("message=1;message=2"), {
    message: "2",
  });
});

Deno.test("parseTags should override double tags with the last definition, even if value is null",
  () => {
    assertEquals(parseTags("message=1;message"), { message: null });
  });

Deno.test("parseTags should to-lower-case tag keys", () => {
  assertEquals(parseTags("MESSAGE=Hi"), { message: "Hi" });
});

Deno.test("parseTags should support multiple different keys", () => {
  assertEquals(parseTags("abc=1;def=2;xd;xd;hi=;abc"), {
    abc: null,
    def: "2",
    xd: null,
    hi: "",
  });
});
