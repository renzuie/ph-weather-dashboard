import express from "express";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;
const BULLETIN_URL = "https://bagong.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin";
const CACHE_MS = 30 * 60 * 1000; // only check PAGASA every 30 minutes

let cache = { data: null, time: 0 };

// Matches things like "Typhoon KIYAPO" or "Severe Tropical Storm AGHON"
const STORM_PATTERN =
  /\b(Super Typhoon|Typhoon|Severe Tropical Storm|Tropical Storm|Tropical Depression)\s+["“]?([A-Z]{3,})/;

async function scrapeBulletin() {
  const res = await fetch(BULLETIN_URL, {
    headers: { "User-Agent": "PH-Weather-Dashboard (student portfolio project)" },
    signal: AbortSignal.timeout(15000), // give up after 15 seconds
  });
  if (!res.ok) throw new Error(`PAGASA responded with ${res.status}`);

  const $ = cheerio.load(await res.text());
  $("script, style, nav, header, footer").remove(); // strip menus so they don't confuse matching
  const text = $("body").text().replace(/\s+/g, " ");

  if (/No Active Tropical Cyclone/i.test(text)) {
    return { active: false, sourceUrl: BULLETIN_URL };
  }

  const storm = text.match(STORM_PATTERN);
  const number = text.match(/BULLETIN\s+NR\.?\s*(\d+)/i);
  const issued = text.match(/Issued at\s+([\d:]+\s*[AP]M,\s*\d{1,2}\s+\w+\s+\d{4})/i);

  // Find a link to the bulletin PDF, if the page has one
  const pdfLink = $("a[href$='.pdf']")
    .map((_, el) => $(el).attr("href"))
    .get()
    .find((href) => /bulletin|TCB/i.test(href));

  return {
    active: true,
    category: storm ? storm[1] : null,
    name: storm ? storm[2] : null,
    bulletinNumber: number ? Number(number[1]) : null,
    issuedAt: issued ? issued[1] : null,
    pdfUrl: pdfLink ? new URL(pdfLink, BULLETIN_URL).href : null,
    sourceUrl: BULLETIN_URL,
  };
}

// Fake storm data so you can design the alert card on a calm day
const SAMPLE_ALERT = {
  active: true,
  category: "Typhoon",
  name: "SAMPLE",
  bulletinNumber: 7,
  issuedAt: "5:00 PM, 25 October 2026",
  pdfUrl: null,
  sourceUrl: BULLETIN_URL,
  test: true,
};

app.get("/api/alerts", async (req, res) => {
  if (req.query.test === "1") {
    return res.json({ ...SAMPLE_ALERT, fetchedAt: new Date().toISOString() });
  }

  // Serve cached data if it's still fresh
  if (cache.data && Date.now() - cache.time < CACHE_MS) {
    return res.json(cache.data);
  }

  try {
    const data = { ...(await scrapeBulletin()), fetchedAt: new Date().toISOString() };
    cache = { data, time: Date.now() };
    res.json(data);
  } catch (err) {
    console.error("Scrape failed:", err.message);
    // If PAGASA is down, fall back to the last good result instead of failing
    if (cache.data) return res.json({ ...cache.data, stale: true });
    res.status(502).json({ error: "Couldn't reach PAGASA right now." });
  }
});

app.use(express.static("public"));

app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));