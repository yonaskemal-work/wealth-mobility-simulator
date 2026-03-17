export const VIEW_W = 700
export const VIEW_H = 520
export const MOUNTAIN_PEAK_X = VIEW_W / 2
export const MOUNTAIN_PEAK_Y = 35
export const MOUNTAIN_BASE_LEFT = 20
export const MOUNTAIN_BASE_RIGHT = VIEW_W - 20
export const MOUNTAIN_BASE_Y = VIEW_H - 25

export function getLaborPathX(y: number): number {
  const t = 1 - (y - MOUNTAIN_PEAK_Y) / (MOUNTAIN_BASE_Y - MOUNTAIN_PEAK_Y)
  const startX = MOUNTAIN_BASE_LEFT + 80
  const endX = MOUNTAIN_PEAK_X - 30
  const curve = t + 0.12 * Math.sin(t * Math.PI)
  return startX + (endX - startX) * Math.pow(Math.min(curve, 1), 0.65)
}

export function getCapitalPathX(y: number): number {
  const t = 1 - (y - MOUNTAIN_PEAK_Y) / (MOUNTAIN_BASE_Y - MOUNTAIN_PEAK_Y)
  const startX = MOUNTAIN_BASE_RIGHT - 80
  const endX = MOUNTAIN_PEAK_X + 30
  const curve = t + 0.12 * Math.sin(t * Math.PI)
  return startX + (endX - startX) * Math.pow(Math.min(curve, 1), 0.65)
}

export function wealthToY(wealth: number): number {
  if (wealth <= 0) return MOUNTAIN_BASE_Y
  const logWealth = Math.log10(Math.max(wealth, 1))
  const logMin = Math.log10(10_000)       // $10K = bottom
  const logMax = Math.log10(1_000_000_000) // $1B = peak
  const t = Math.max(0, Math.min(1, (logWealth - logMin) / (logMax - logMin)))
  return MOUNTAIN_BASE_Y - t * (MOUNTAIN_BASE_Y - MOUNTAIN_PEAK_Y)
}
