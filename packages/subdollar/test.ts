import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { analyze, sub$ } from "./index.ts";

describe("subdollar", () => {
  it("should replace existing values", () => {
    assert.equal(
      sub$("Hello $FOO$BAR", { FOO: "World", BAR: "!" }),
      "Hello World!"
    );
  });

  it("should ignore escaped values", () => {
    assert.equal(
      sub$("Hello $$FOO$$BAR", { FOO: "World", BAR: "!" }),
      "Hello $FOO$BAR"
    );
  });

  it("should work in edge cases", () => {
    const values = { FOO: "foo" };
    assert.equal(sub$("Hello FOO", values), "Hello FOO");
    assert.equal(sub$("Hello $FOO", values), "Hello foo");
    assert.equal(sub$("Hello $$FOO", values), "Hello $FOO");
    assert.equal(sub$("Hello $$$FOO", values), "Hello $foo");
    assert.equal(sub$("Hello $$$$FOO", values), "Hello $$FOO");
    assert.equal(sub$("Hello $$$$$FOO", values), "Hello $$foo");
  });

  it("should ignore invalid values", () => {
    assert.equal(sub$("Hello FOO", {}), "Hello FOO");
    assert.equal(sub$("Hello $FOO", {}), "Hello $FOO");
    assert.equal(sub$("Hello $$FOO", {}), "Hello $$FOO");
    assert.equal(sub$("Hello $$$FOO", {}), "Hello $$$FOO");
    assert.equal(sub$("Hello $$$$FOO", {}), "Hello $$$$FOO");
    assert.equal(sub$("Hello $$$$$FOO", {}), "Hello $$$$$FOO");
  });
});

describe("analyze", () => {
  it("should work", () => {
    assert.deepStrictEqual(analyze("Hello $FOO$BAR"), ["FOO", "BAR"]);
    assert.deepStrictEqual(analyze("Hello $$FOO$$BAR"), []);
    assert.deepStrictEqual(analyze("Hello $$$FOO$$$BAR"), ["FOO", "BAR"]);
    assert.deepStrictEqual(analyze("Hello $$$$FOO$$$$BAR"), []);
  });
});
