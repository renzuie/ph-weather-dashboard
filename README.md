# 🇵🇭 PH Weather Dashboard

A weather dashboard for the Philippines that shows live forecasts for any city or town and displays PAGASA tropical cyclone alerts when a storm is inside the Philippine Area of Responsibility.

**🔗 Live demo:** https://ph-weather-dashboard.onrender.com
**🌀 Preview the typhoon alert:** https://ph-weather-dashboard.onrender.com/?test

> Hosted on Render's free tier, so the first load after a period of inactivity may take up to a minute while the server wakes up.


## Why I built this

During typhoon season, checking the weather in the Philippines usually means jumping between a weather app for the forecast and PAGASA's website for official storm bulletins. I wanted one clean, mobile-friendly page that shows both: the forecast for your area, and a clear alert when PAGASA issues a tropical cyclone bulletin.

## Features

- **Current weather**: temperature, feels-like, humidity, wind, and rainfall
- **7-day forecast**: daily highs and lows, conditions, and chance of rain
- **City search**: find any city or municipality in the Philippines, with keyboard navigation
- **PAGASA typhoon alerts**: an alert card appears automatically when a tropical cyclone bulletin is active, with a link to the official bulletin
- **Remembers your location** between visits using `localStorage`
- **Auto-refresh**: weather updates every 15 minutes, alerts every 30
- **Glassmorphic, responsive design** that works on phones and desktops

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js, Express |
| Scraping | Cheerio |
| Data | [Open-Meteo](https://open-meteo.com) Forecast and Geocoding APIs, [PAGASA](https://bagong.pagasa.dost.gov.ph) Tropical Cyclone Bulletin page |
| Hosting | Render |

## How it works

```
Browser ──► Open-Meteo API         (forecasts + city search)
   │
   └──► Express server /api/alerts ──► PAGASA bulletin page
              (cached 30 min)
```

**Weather data** comes from Open-Meteo, which is free, needs no API key, and allows requests directly from the browser.

**Typhoon alerts** are trickier. PAGASA doesn't offer a public API without a formal request, so the Express server scrapes the Tropical Cyclone Bulletin page and converts it into JSON. It detects whether a storm is active, then extracts the storm's category, name, bulletin number, issue time, and PDF link.

To scrape responsibly, the server:
- **caches results for 30 minutes**, so PAGASA is contacted at most twice an hour no matter how many people visit
- sends an identifying `User-Agent`
- **falls back to the last known bulletin** if PAGASA's site is unreachable, instead of showing an error

Since storms aren't always active, adding `?test` to the URL loads sample alert data so the alert card can be developed and demoed any time.

## Running locally

Requires Node.js 18 or newer.

```bash
git clone https://github.com/YOUR-USERNAME/ph-weather-dashboard.git
cd ph-weather-dashboard
npm install
npm start
```

Then open http://localhost:3000.

## Challenges and what I learned

- **No official API.** I had to figure out how to get PAGASA data without an API key, which led me to build a scraper and think about caching and being a responsible client of a government website.
- **Parsing an unpredictable page.** The bulletin page changes layout depending on whether a storm is active, so the scraper is written defensively: if it can't find a detail like the storm name, it still shows a general alert and links to PAGASA instead of breaking.
- **Security.** Search suggestions come from an external API, so I build them with `textContent` instead of `innerHTML` to prevent injected HTML.
- **Performance.** City search is debounced, so typing a full town name sends one request instead of one per keystroke.
- **Environment setup.** Getting Node.js, npm, and PowerShell configured on Windows took real troubleshooting, and deploying taught me how hosting platforms build and run a Node app.

## Future improvements

- Show Tropical Cyclone Wind Signal levels for the user's province
- Map of the storm's current location and track
- Hourly rain chart
- PHIVOLCS earthquake alerts

## Credits

Weather data by [Open-Meteo](https://open-meteo.com). Tropical cyclone information from [DOST-PAGASA](https://bagong.pagasa.dost.gov.ph). This project is not affiliated with PAGASA; always follow official advisories and your local government during severe weather.
