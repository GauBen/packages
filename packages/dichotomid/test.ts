import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { dichotomid } from "./index.js";

describe("dichotomid", () => {
  it("should synchronously return the first available id", () => {
    for (let i = 1; i < 1000; i++) {
      assert.equal(
        dichotomid((value) => value >= i),
        i
      );
    }
  });

  it("should asynchronously return the first available id", async () => {
    for (let i = 1; i < 1000; i++)
      assert.equal(await dichotomid((value) => Promise.resolve(value >= i)), i);
  });

  it("should be faster than the naive implementation", async () => {
    const estimate = (n: number) => 2 * Math.ceil(Math.log2(n));
    {
      let op = 0;
      let validator = (n: number) => {
        op++;
        return n >= 1000;
      };
      assert.equal(dichotomid(validator), 1000);
      assert.equal(op, estimate(1000)); // == 20
    }
    {
      let op = 0;
      let validator = (n: number) => {
        op++;
        return n >= 1_000_000_000;
      };
      assert.equal(dichotomid(validator), 1_000_000_000);
      assert.equal(op, estimate(1_000_000_000)); // == 60
    }
  });

  it("should throw if the validator never returns true", () => {
    // Sync version
    assert.throws(() => dichotomid(() => false));
    // Async version
    assert.rejects(dichotomid(() => Promise.resolve(false)));
  });
});
