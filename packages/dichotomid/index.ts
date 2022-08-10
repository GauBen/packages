export type SyncValidator = (value: number) => boolean;
export type AsyncValidator = (value: number) => Promise<boolean>;
export type Validator = SyncValidator | AsyncValidator;

export const dichotomid = <T extends Validator>(
  validator: T
): T extends SyncValidator ? number : Promise<number> => {
  type ReturnType = T extends SyncValidator ? number : Promise<number>;
  const result = validator(1);

  if (result && typeof (result as Promise<boolean>).then === "function") {
    return (result as Promise<boolean>).then(async (result) => {
      if (result) return 1;
      return asyncDichotomid(validator as AsyncValidator, 2);
    }) as ReturnType;
  }

  if (result) return 1 as ReturnType;
  return syncDichotomid(validator as SyncValidator, 2) as ReturnType;
};

export { dichotomid as default };

export const syncDichotomid = (validator: SyncValidator, max = 1) => {
  while (!validator(max)) {
    max *= 2;

    if (max > Number.MAX_SAFE_INTEGER) {
      throw new TypeError(
        "syncDichotomid reached MAX_SAFE_INTEGER, the validator probably never accepts the value"
      );
    }
  }

  let min = max / 2;

  while (min + 1 < max) {
    const mid = (min + max) / 2;

    if (validator(mid)) max = mid;
    else min = mid;
  }

  return max;
};

export const asyncDichotomid = async (validator: AsyncValidator, max = 1) => {
  while (!(await validator(max))) {
    max *= 2;

    if (max > Number.MAX_SAFE_INTEGER) {
      throw new TypeError(
        "asyncDichotomid reached MAX_SAFE_INTEGER, the validator probably never accepts the value"
      );
    }
  }

  let min = max / 2;

  while (min + 1 < max) {
    const mid = (min + max) / 2;

    if (await validator(mid)) max = mid;
    else min = mid;
  }

  return max;
};
