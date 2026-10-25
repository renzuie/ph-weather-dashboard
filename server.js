import express from "express";
import { parseBulletin, BULLETIN_URL } from "./scraper.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_MS = 30 * 60 * 1000;

let cache = { data: null, time: 0 };

async function scrapeBulletin() {
  const res = await fetch(BULLETIN_URL, {
    headers: { "User-Agent": "PH-Weather-Dashboard (student portfolio project)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`PAGASA responded with ${res.status}`);
  return parseBulletin(await res.text());
}

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

  if (cache.data && Date.now() - cache.time < CACHE_MS) {
    return res.json(cache.data);
  }

  try {
    const data = { ...(await scrapeBulletin()), fetchedAt: new Date().toISOString() };
    cache = { data, time: Date.now() };
    res.json(data);
  } catch (err) {
    console.error("Scrape failed:", err.message);
    if (cache.data) return res.json({ ...cache.data, stale: true });
    res.status(502).json({ error: "Couldn't reach PAGASA right now." });
  }
});

app.use(express.static("public"));

app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));