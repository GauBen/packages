import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { createTree, getAncestors } from "./index.js";

describe("pojo-tree", () => {
  it("should build a simple tree", () => {
    const tree = createTree([
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
      { id: 3, parentId: 1 },
      { id: 4, parentId: 2 },
      { id: 5, parentId: 3 },
    ]);

    assert.deepStrictEqual(tree, [
      {
        id: 1,
        parentId: null,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [{ id: 4, parentId: 2, children: [] }],
          },
          {
            id: 3,
            parentId: 1,
            children: [{ id: 5, parentId: 3, children: [] }],
          },
        ],
      },
    ]);
  });

  it("should build a simple tree with shuffled entries", () => {
    const tree = createTree([
      { id: 3, parentId: 2 },
      { id: 2, parentId: 1 },
      { id: 1, parentId: null },
    ]);

    assert.deepStrictEqual(tree, [
      {
        id: 1,
        parentId: null,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [{ id: 3, parentId: 2, children: [] }],
          },
        ],
      },
    ]);
  });

  it("should return an empty array if no roots can be found", () => {
    const tree = createTree([{ id: 3, parentId: 2 }]);
    assert.deepStrictEqual(tree, []);
  });

  it("should retrieve ancestors", () => {
    const ancestors = getAncestors<
      { id: number; parentId?: number | null },
      number
    >(
      [
        { id: 2, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 1, parentId: null },
        { id: 3, parentId: 2 },
      ],
      2
    );

    assert.deepStrictEqual(ancestors, [
      { id: 2, parentId: 1 },
      { id: 1, parentId: null },
    ]);
  });

  it("should work with custom key", () => {
    const tree = createTree(
      [
        { id: 3, x: 1 },
        { id: 1, x: null },
      ],
      "x"
    );
    assert.deepStrictEqual(tree, [
      { id: 1, x: null, children: [{ id: 3, x: 1, children: [] }] },
    ]);
  });
});
