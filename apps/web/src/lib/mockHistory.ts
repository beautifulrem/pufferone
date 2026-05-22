/// Mean-reverting random-walk time series generator for APY/TVL/rate mocks.
/// We don't have real historical data for our Sepolia mocks, so we generate
/// plausible series that look realistic in sparkline charts.
///
/// The series is **deterministic per (key, days)** so reloading the page
/// doesn't reshuffle the sparkline (consistent UX).

type Point = { day: number; value: number }

/// Mulberry32 PRNG — small deterministic random for stable mocks.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashKey(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/// Generate a mean-reverting series.
/// @param key   stable string seed (e.g. vault address)
/// @param base  central value (e.g. 5.0 for 5% APY)
/// @param vol   max ±deviation per step (e.g. 0.4)
/// @param days  number of points (default 30)
/// @param min   floor value (default 0)
export function mockSeries(
  key: string,
  base: number,
  vol: number,
  days = 30,
  min = 0,
): Point[] {
  const rand = mulberry32(hashKey(key))
  const out: Point[] = []
  let v = base
  for (let i = 0; i < days; i++) {
    const noise = (rand() - 0.5) * vol * 2
    v = base + noise + (v - base) * 0.3 // mean reversion toward `base`
    out.push({ day: i, value: Math.max(min, parseFloat(v.toFixed(4))) })
  }
  return out
}

/// Common presets used across the app.
export const APYHistory = (key: string, base: number) => mockSeries(key, base, 0.45, 30, 0)
export const TVLHistory = (key: string, baseM: number) =>
  mockSeries(key, baseM, baseM * 0.05, 30, 0)
export const RateHistory = (key: string, base: number) => mockSeries(key, base, 0.015, 30, 0)
