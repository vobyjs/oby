
import { root, observable as $, effect } from "./dist/index.js";


const N = 1000;
const M = 10000;
let l = () => {}; // console.log;
function test_oby() {
  let t = performance.now();
  root(() => {
    let s = $(1);
    effect(() => l("A", s()));
    effect(() => l("B", s()));
    effect(() => l("C", s()));
    effect(() =>
      l(
        "D",
        (() => {
          for (let j = 0; j < M; j++) s();
        })()
      )
    );
    setTimeout(() => {
      for (let i = 0; i < N; i++) {
        s(2);
        s(3);
        s(4);
      }
      console.log("Oby", performance.now() - t);
    });
  });
}

test_oby();
