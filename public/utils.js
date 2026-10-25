// Pure functions: no DOM, no network. Easy to test.

export function describe(code, isDay = true) {
  if (code === 0) return isDay ? ["Clear sky", "☀️"] : ["Clear night", "🌙"];
  if (code <= 3) return isDay ? ["Partly cloudy", "⛅"] : ["Partly cloudy", "☁️"];
  if (code <= 48) return ["Foggy", "🌫️"];
  if (code <= 57) return ["Drizzle", "🌦️"];
  if (code <= 67) return ["Rain", "🌧️"];
  if (code <= 77) return ["Snow", "❄️"];
  if (code <= 82) return ["Rain showers", "🌦️"];
  return ["Thunderstorm", "⛈️"];
}

export function themeFor(code, isDay) {
  if (code >= 95) return "storm";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (!isDay) return "night";
  if (code <= 1) return "sunny";
  return "cloudy";
}

// Standard heat index formula (works in °F internally, returns °C)
export function heatIndex(tempC, rh) {
  const T = tempC * 9 / 5 + 32;
  let hi = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);

  if ((hi + T) / 2 >= 80) {
    hi = -42.379 + 2.04901523 * T + 10.14333127 * rh
      - 0.22475541 * T * rh - 0.00683783 * T * T
      - 0.05481717 * rh * rh + 0.00122874 * T * T * rh
      + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;

    if (rh < 13 && T >= 80 && T <= 112) {
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (rh > 85 && T >= 80 && T <= 87) {
      hi += ((rh - 85) / 10) * ((87 - T) / 5);
    }
  }
  return Math.round((hi - 32) * 5 / 9);
}

// PAGASA heat index classification
export function heatLevel(hi) {
  if (hi >= 52) return { cls: "extreme-danger", label: "Extreme Danger",
    tip: "Heat stroke is highly likely. Stay indoors in a cool place and check on elderly family members and children." };
  if (hi >= 42) return { cls: "danger", label: "Danger",
    tip: "Heat exhaustion is likely, and heat stroke is possible with prolonged exposure. Avoid outdoor activity around midday." };
  if (hi >= 33) return { cls: "extreme-caution", label: "Extreme Caution",
    tip: "Heat cramps and heat exhaustion are possible. Drink water often and limit time under the sun." };
  if (hi >= 27) return { cls: "caution", label: "Caution",
    tip: "Fatigue is possible with prolonged exposure. Stay hydrated and take breaks in the shade." };
  return null;
}