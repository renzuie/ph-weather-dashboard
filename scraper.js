import * as cheerio from "cheerio";

export const BULLETIN_URL = "https://bagong.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin";

// Matches things like "Typhoon KIYAPO" or "Severe Tropical Storm AGHON"
const STORM_PATTERN =
  /\b(Super Typhoon|Typhoon|Severe Tropical Storm|Tropical Storm|Tropical Depression)\s+["“]?([A-Z]{3,})/;

// Takes raw HTML and returns structured data. No network involved, so it's testable.
export function parseBulletin(html, baseUrl = BULLETIN_URL) {
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer").remove();
  const text = $("body").text().replace(/\s+/g, " ");

  if (/No Active Tropical Cyclone/i.test(text)) {
    return { active: false, sourceUrl: baseUrl };
  }

  const storm = text.match(STORM_PATTERN);
  const number = text.match(/BULLETIN\s+NR\.?\s*(\d+)/i);
  const issued = text.match(/Issued at\s+([\d:]+\s*[AP]M,\s*\d{1,2}\s+\w+\s+\d{4})/i);

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
    pdfUrl: pdfLink ? new URL(pdfLink, baseUrl).href : null,
    sourceUrl: baseUrl,
  };
}