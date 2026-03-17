import { type ArchetypeId, ARCHETYPE_CONFIGS } from './archetypeConfigs'
import type { YearlySnapshot } from '../models/wealthProjection'
import type { PolicyState } from '../models/policyState'
import { formatWealth } from '../utils/formatters'

export interface YearNarrativeData {
  headline: string
  body: string
  detail?: string
}

const WEALTH_MILESTONES = [
  { value: 100_000, label: '$100K' },
  { value: 1_000_000, label: '$1M' },
  { value: 10_000_000, label: '$10M' },
  { value: 100_000_000, label: '$100M' },
  { value: 1_000_000_000, label: '$1B' },
]

export function getYearNarrative(
  year: number,
  projections: Record<ArchetypeId, YearlySnapshot[]>,
  visibleArchetypes: Set<ArchetypeId>,
  policy: PolicyState,
): YearNarrativeData {
  const age = 24 + year
  const visible = Array.from(visibleArchetypes)

  // Year 1: Starting line
  if (year === 1) {
    const starters = visible.map(id => {
      const config = ARCHETYPE_CONFIGS[id]
      const wealth = projections[id]?.[0]?.wealth ?? 0
      return `${config.shortName}: ${formatWealth(wealth)}`
    })
    return {
      headline: `Starting Line — Age 25`,
      body: `All climbers begin their 40-year journey. The labor track (left) requires earning wages. The capital track (right) grows investments.`,
      detail: starters.slice(0, 3).join('  ·  '),
    }
  }

  // RE Investor buys first property (year 4, age 28)
  if (year === 4 && visibleArchetypes.has('realEstateInvestor')) {
    return {
      headline: `First Property — Age ${age}`,
      body: `Real Estate Investor puts $200K down on their first property. Leveraged 4:1, they now control $800K in real estate.`,
      detail: policy.depreciationEnabled
        ? `Depreciation + leverage begin compounding tax-free equity`
        : `No depreciation available — gains fully taxed`,
    }
  }

  // VC Partner makes partner (year 5, age 29)
  if (year === 5 && visibleArchetypes.has('vcPartner')) {
    return {
      headline: `Making Partner — Age ${age}`,
      body: `VC Partner is promoted from analyst to partner. Compensation shifts from salary to $500K management fees + $2M/yr carried interest.`,
      detail: !policy.carriedInterestAsOrdinary
        ? `Carried interest taxed at ${(policy.ltcgRate * 100).toFixed(0)}% capital gains rate, not ordinary income`
        : `Carried interest taxed as ordinary income under current policy`,
    }
  }

  // Inheritor receives inheritance (year 6, age 30)
  if (year === 6 && visibleArchetypes.has('inheritor')) {
    return {
      headline: `The Inheritance — Age ${age}`,
      body: `Inheritor receives $5M. Quits their modest job and begins living off portfolio returns.`,
      detail: policy.stepUpBasisEnabled
        ? `Step-up basis resets cost basis — inherited gains are never taxed`
        : `No step-up basis — inheritor owes tax on original gains`,
    }
  }

  // Tech Founder exit year (year 7, age 31)
  if (year === 7 && visibleArchetypes.has('techFounder')) {
    const founderWealth = projections.techFounder?.[6]?.wealth ?? 0
    const qsbsCap = policy.qsbsExclusionCap
    return {
      headline: `The Exit — Age ${age}`,
      body: `Tech Founder sells the startup for $20M. Crosses from the labor track to the capital track.`,
      detail: qsbsCap > 0
        ? `QSBS exclusion shields up to ${formatWealth(qsbsCap)} from tax`
        : `No QSBS exclusion — full tax on gains`,
    }
  }

  // Check for milestone crossings this year
  for (const milestone of WEALTH_MILESTONES) {
    for (const id of visible) {
      const prev = projections[id]?.[year - 2]?.wealth ?? 0
      const curr = projections[id]?.[year - 1]?.wealth ?? 0
      if (prev < milestone.value && curr >= milestone.value) {
        const config = ARCHETYPE_CONFIGS[id]
        return {
          headline: `${config.shortName} crosses ${milestone.label} — Age ${age}`,
          body: `After ${year} years, ${config.name} reaches ${milestone.label} in total wealth.`,
          detail: `Effective tax rate: ${((projections[id]?.[year - 1]?.effectiveTaxRate ?? 0) * 100).toFixed(1)}%`,
        }
      }
    }
  }

  // Divergence check — compare richest and poorest visible
  const wealthAtYear = visible.map(id => ({
    id,
    wealth: projections[id]?.[year - 1]?.wealth ?? 0,
    name: ARCHETYPE_CONFIGS[id].shortName,
  })).sort((a, b) => b.wealth - a.wealth)

  if (wealthAtYear.length >= 2) {
    const richest = wealthAtYear[0]
    const poorest = wealthAtYear[wealthAtYear.length - 1]

    if (poorest.wealth > 0) {
      const ratio = Math.round(richest.wealth / poorest.wealth)

      // Show divergence at key thresholds
      if (year > 1) {
        const prevRichest = projections[richest.id]?.[year - 2]?.wealth ?? 0
        const prevPoorest = projections[poorest.id]?.[year - 2]?.wealth ?? 0
        const prevRatio = prevPoorest > 0 ? Math.round(prevRichest / prevPoorest) : 0

        for (const threshold of [10, 50, 100, 500, 1000]) {
          if (prevRatio < threshold && ratio >= threshold) {
            return {
              headline: `${ratio}:1 Wealth Gap — Age ${age}`,
              body: `${richest.name} now has ${ratio}x the wealth of ${poorest.name}.`,
              detail: `${richest.name}: ${formatWealth(richest.wealth)}  vs  ${poorest.name}: ${formatWealth(poorest.wealth)}`,
            }
          }
        }
      }
    }

    // Default: show comparison
    return {
      headline: `Year ${year} — Age ${age}`,
      body: `${richest.name} leads at ${formatWealth(richest.wealth)}. ${poorest.name} at ${formatWealth(poorest.wealth)}.`,
      detail: poorest.wealth > 0
        ? `Gap: ${Math.round(richest.wealth / poorest.wealth)}:1`
        : `${poorest.name} still building`,
    }
  }

  return {
    headline: `Year ${year} — Age ${age}`,
    body: `Wealth continues to compound across all tracks.`,
  }
}
