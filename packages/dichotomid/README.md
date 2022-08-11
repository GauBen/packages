# dichotomid

**Dichotomid helps you find the first free id of something, efficiently.**

Imagine you have a directory with files named `file1`, `file2`, `file3`, ... and you want to find the first free `fileN`:

```js
// 🐌 Naive implementation, do not do this 🐌
let i = 1;
while (fs.existsSync(`file${i}`)) {
  i++;
}
console.log(`file${i} is the first free`);
```

This implementation works, but **can be mathematically optimized**, and that's what dichotomid is for:

```js
// 🐎 Optimized implementation 🐎
import { dichotomid } from "dichotomid";
let i = dichotomid((i) => fs.existsSync(`file${i}`));
console.log(`file${i} is the first free`);
```

Dichotomid relies on binary search to find the first free id in the least amount of tests. Indeed, if `file1` to `file999` are all taken, it would take 1000 `existsSync` calls to figure it out naively. **Dichotomid will find the value in 30 call.**

```js
import { dichotomid } from "dichotomid";

let op = 0;
let validator = (n) => {
  op++;
  return n >= 1000; // The first free id is 1000
};

let id = dichotomid(validator);
console.log(op); // 30
```

## Usage

Three functions are made available: `dichotomid` (default export), `dichotomidSync` and `dichotomidAsync`.

`dichotomid` works for both synchronous and asynchronous validators. It returns a `number` if the validator is synchronous, or a `Promise<number>` if the validator is asynchronous.

## Notes

- `dichotomid` has a fail safe if the value offered to the validator exceeds `MAX_SAFE_INTEGER`.
- The library has 100% test coverage.
- Ids are expected to be contiguous. If they are not, the algorithm you want is the naive loop at the top.
