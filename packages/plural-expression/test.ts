import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import compile from "./index.js";

describe("plural-expressions", () => {
  it("should compile simple expressions", () => {
    const f = compile("n % 10 ? 1 : n >= 2 ? 2 : 3");
    const ref = (n: number) => (n % 10 ? 1 : n >= 2 ? 2 : 3);
    for (let i = 0; i < 100; i++) assert.equal(f(i), ref(i));
  });

  it("should compile parenthesized expressions", () => {
    const f = compile("(n + 1) * (n + 2)");
    const ref = (n: number) => (n + 1) * (n + 2);
    for (let i = 0; i < 100; i++) assert.equal(f(i), ref(i));
  });

  it("should throw on malformed expressions", () => {
    assert.throws(() => compile("(n + 1"));
    // assert.throws(() => compile("(n + 1)))))"));
    assert.throws(() => compile(")"));
    assert.throws(() => compile("1 2"));
    assert.throws(() => compile("1 +"));
    assert.throws(() => compile("1 + /"));
    assert.throws(() => compile("1 + _"));
  });

  it("should correctly handle precedence", () => {
    {
      const f = compile("n * 3 + n * 2");
      const ref = (n: number) => n * 3 + n * 2;
      for (let i = 0; i < 100; i++) assert.equal(f(i), ref(i));
    }
    {
      const f = compile("n + 3 * n + 2");
      const ref = (n: number) => n + 3 * n + 2;
      for (let i = 0; i < 100; i++) assert.equal(f(i), ref(i));
    }
  });
});
