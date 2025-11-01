import test from "node:test";
import assert from "node:assert/strict";

import {
  TRANSITIONS,
  selectRandomTransition,
  normalizeSlideDuration,
} from "../scripts/slideshow.js";

test("selectRandomTransition uses deterministic random function", () => {
  const transition = selectRandomTransition(TRANSITIONS, () => 0.2);
  assert.equal(transition.name, "Slide Drift");
});

test("selectRandomTransition selects last entry when random returns high value", () => {
  const transition = selectRandomTransition(TRANSITIONS, () => 1);
  assert.equal(transition.name, "Tilt Reveal");
});

test("selectRandomTransition throws when transition list empty", () => {
  assert.throws(() => selectRandomTransition([], () => 0.5));
});

test("normalizeSlideDuration falls back when input invalid", () => {
  assert.equal(normalizeSlideDuration("oops"), 4000);
});

test("normalizeSlideDuration enforces minimum seconds", () => {
  assert.equal(normalizeSlideDuration("1"), 2000);
});

test("normalizeSlideDuration converts seconds to milliseconds", () => {
  assert.equal(normalizeSlideDuration("5"), 5000);
});
