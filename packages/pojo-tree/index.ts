type Tree<T> = T & { children: Array<Tree<T>> };

export const createTree = <
  T extends { id: U; parentId?: U | null | undefined },
  U extends PropertyKey = PropertyKey
>(
  list: T[]
): Array<Tree<T>> => {
  const root = Symbol();
  const map = new Map<U | typeof root, Tree<T>>();

  for (const item of list) {
    const children = map.get(item.id)?.children || [];
    const node = { ...item, children };
    map.set(item.id, node);

    if (!map.has(item.parentId ?? root))
      map.set(item.parentId ?? root, { children: [] } as unknown as Tree<T>);

    map.get(item.parentId ?? root)!.children.push(node);
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
