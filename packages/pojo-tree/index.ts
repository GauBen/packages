type Tree<T> = T & { children: Array<Tree<T>> };

export const createTree = <
  T extends { id: U } & { [P in V]: U | undefined | null },
  U extends PropertyKey = PropertyKey,
  V extends PropertyKey = "parentId"
>(
  list: T[],
  parentIdKey: V = "parentId" as V
): Array<Tree<T>> => {
  const root = Symbol();
  const map = new Map<U | typeof root, Tree<T>>();

  for (const item of list) {
    const children = map.get(item.id)?.children || [];
    const node = { ...item, children };
    map.set(item.id, node);

    const parentId = item[parentIdKey] ?? root;
    if (!map.has(parentId))
      map.set(parentId, { children: [] } as unknown as Tree<T>);

    map.get(parentId)!.children.push(node);
  }

  return map.get(root)?.children ?? [];
};

export const getAncestors = <
  T extends { id: U; parentId?: U | null | undefined },
  U extends PropertyKey = PropertyKey
>(
  list: T[],
  id: U
) => {
  const map = new Map<U, T>();
  for (const item of list) map.set(item.id, item);

  const ancestors = [];
  let current = map.get(id);
  while (current) {
    ancestors.push(current);
    current = map.get(current.parentId as U);
  }

  return ancestors;
};
