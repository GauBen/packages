import pluralForms from "@tannin/plural-forms";
import { suite, add, cycle, complete } from "benny";
import parse from "./index.js";

suite(
  "Compilation",
  add("tannin", () => {
    const evaluate2 = parse("n > 10 ? 1 : n % 2 == 1 ? 2 : 3");
  }),
  add("mine", () => {
    const evaluate2 = parse("n > 10 ? 1 : n % 2 == 1 ? 2 : 3");
  }),
  cycle(),
  complete()
);

suite(
  "Execution",
  add("tannin", () => {
    const evaluate1 = pluralForms("n > 1");
    for (let n = 0; n < 100; n++) {
      evaluate1(n);
    }
  }),
  add("mine", () => {
    const evaluate2 = parse("n > 1");
    for (let n = 0; n < 100; n++) {
      evaluate2(n);
    }
  }),
  cycle(),
  complete()
);
