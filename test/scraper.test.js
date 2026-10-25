import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBulletin } from "../scraper.js";

test("detects when there is no active storm", () => {
  const html = `<html><body><main>
    <h3>Tropical Cyclone Bulletin</h3>
    <p>No Active Tropical Cyclone within the Philippine Area of Responsibility</p>
  </main></body></html>`;

  assert.equal(parseBulletin(html).active, false);
});

test("extracts storm details from an active bulletin", () => {
  const html = `<html><body><main>
    <h3>TROPICAL CYCLONE BULLETIN NR. 7</h3>
    <p>Typhoon KIYAPO (NOUL)</p>
    <p>Issued at 5:00 PM, 24 July 2026</p>
    <a href="/files/TCB%237_kiyapo.pdf">Download bulletin</a>
  </main></body></html>`;

  const result = parseBulletin(html);
  assert.equal(result.active, true);
  assert.equal(result.category, "Typhoon");
  assert.equal(result.name, "KIYAPO");
  assert.equal(result.bulletinNumber, 7);
  assert.equal(result.issuedAt, "5:00 PM, 24 July 2026");
  assert.equal(result.pdfUrl, "https://bagong.pagasa.dost.gov.ph/files/TCB%237_kiyapo.pdf");
});

test("reads multi-word categories like Severe Tropical Storm", () => {
  const html = `<html><body><p>Severe Tropical Storm AGHON (EWINIAR)</p></body></html>`;
  const result = parseBulletin(html);
  assert.equal(result.category, "Severe Tropical Storm");
  assert.equal(result.name, "AGHON");
});

test("still reports an alert when details are missing", () => {
  const html = `<html><body><p>Tropical cyclone update in progress</p></body></html>`;
  const result = parseBulletin(html);
  assert.equal(result.active, true);
  assert.equal(result.name, null);
  assert.equal(result.pdfUrl, null);
});