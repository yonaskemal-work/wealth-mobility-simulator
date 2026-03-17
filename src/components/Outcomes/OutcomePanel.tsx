import { useMemo } from 'react'
import { usePolicyStore } from '../../models/policyState'
import { ARCHETYPE_CONFIGS, type ArchetypeId, ARCHETYPE_ORDER } from '../../data/archetypeConfigs'
import { projectWealth, getYearsToMilestone, getTerminalWealth, getAverageEffectiveTaxRate } from '../../models/wealthProjection'
import { calculateEffectiveLaborTaxRate, countOpenLoopholes, getLoopholeStatus } from '../../models/taxCalculator'
import { ArchetypeCard } from './ArchetypeCard'
import { AggregateMetrics } from './AggregateMetrics'

interface OutcomePanelProps {
  visibleArchetypes: Set<ArchetypeId>
}

export function OutcomePanel({ visibleArchetypes }: OutcomePanelProps) {
  const policy = usePolicyStore()

  const results = useMemo(() => {
    return ARCHETYPE_ORDER.map((id) => {
      const config = ARCHETYPE_CONFIGS[id]
      const snapshots = projectWealth(config, policy)
      return {
        id,
        config,
        snapshots,
        terminalWealth: getTerminalWealth(snapshots),
        yearsTo1M: getYearsToMilestone(snapshots, 1_000_000),
        yearsTo10M: getYearsToMilestone(snapshots, 10_000_000),
        yearsTo100M: getYearsToMilestone(snapshots, 100_000_000),
        avgTaxRate: getAverageEffectiveTaxRate(snapshots),
      }
    })
  }, [policy])

  // Aggregate metrics
  const laborRate = useMemo(() => calculateEffectiveLaborTaxRate(150_000, policy), [policy])
  const capitalArchetype = results.find((r) => r.id === 'inheritor')
  const capitalRate = capitalArchetype ? capitalArchetype.avgTaxRate : 0
  const spread = laborRate - capitalRate
  const loopholeCount = useMemo(() => countOpenLoopholes(policy), [policy])
  const totalLoopholes = useMemo(() => Object.keys(getLoopholeStatus(policy)).length, [policy])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2 pl-10">
        <h2 className="text-sm font-bold text-white/90 tracking-tight">Outcomes</h2>
        <p className="text-[11px] text-white/40 mt-0.5">40-year wealth projection (age 25–64)</p>
      </div>

      {/* Aggregate metrics */}
      <div className="px-4 pb-2">
        <AggregateMetrics
          laborRate={laborRate}
          capitalRate={capitalRate}
          spread={spread}
          loopholeCount={loopholeCount}
          totalLoopholes={totalLoopholes}
        />
      </div>

      {/* Archetype cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {results
          .filter((r) => visibleArchetypes.has(r.id))
          .map((r) => (
            <ArchetypeCard
              key={r.id}
              config={r.config}
              terminalWealth={r.terminalWealth}
              yearsTo1M={r.yearsTo1M}
              yearsTo10M={r.yearsTo10M}
              yearsTo100M={r.yearsTo100M}
              avgTaxRate={r.avgTaxRate}
            />
          ))}
      </div>
    </div>
  )
}
