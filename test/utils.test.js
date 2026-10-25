import { test } from "node:test";
import assert from "node:assert/strict";
import { heatIndex, heatLevel, themeFor, describe } from "../public/utils.js";

test("heat index: 32°C at 70% humidity is about 40°C", () => {
  assert.equal(heatIndex(32, 70), 40);
});

test("heat index: mild weather has no warning", () => {
  assert.equal(heatLevel(heatIndex(25, 50)), null);
});

test("heat level: matches PAGASA category boundaries", () => {
  assert.equal(heatLevel(26), null);
  assert.equal(heatLevel(27).label, "Caution");
  assert.equal(heatLevel(32).label, "Caution");
  assert.equal(heatLevel(33).label, "Extreme Caution");
  assert.equal(heatLevel(41).label, "Extreme Caution");
  assert.equal(heatLevel(42).label, "Danger");
  assert.equal(heatLevel(51).label, "Danger");
  assert.equal(heatLevel(52).label, "Extreme Danger");
});

test("theme: picks the right theme for conditions", () => {
  assert.equal(themeFor(0, true), "sunny");
  assert.equal(themeFor(3, true), "cloudy");
  assert.equal(themeFor(0, false), "night");
  assert.equal(themeFor(61, true), "rain");
  assert.equal(themeFor(95, true), "storm");
});

test("theme: rain takes priority over night", () => {
  assert.equal(themeFor(61, false), "rain");
});

test("describe: shows a moon for clear nights", () => {
  assert.deepEqual(describe(0, false), ["Clear night", "🌙"]);
});