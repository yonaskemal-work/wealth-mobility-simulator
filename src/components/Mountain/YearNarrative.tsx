import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type ArchetypeId } from '../../data/archetypeConfigs'
import { type YearlySnapshot } from '../../models/wealthProjection'
import type { PolicyState } from '../../models/policyState'
import { getYearNarrative } from '../../data/yearNarratives'

interface YearNarrativeProps {
  selectedYear: number
  projections: Record<ArchetypeId, YearlySnapshot[]>
  visibleArchetypes: Set<ArchetypeId>
  policy: PolicyState
}

export function YearNarrative({ selectedYear, projections, visibleArchetypes, policy }: YearNarrativeProps) {
  const narrative = useMemo(
    () => getYearNarrative(selectedYear, projections, visibleArchetypes, policy),
    [selectedYear, projections, visibleArchetypes, policy],
  )

  return (
    <foreignObject x={12} y={65} width={215} height={110}>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedYear}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          // @ts-expect-error xmlns required for foreignObject HTML
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '4px', lineHeight: 1.3 }}>
            {narrative.headline}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, marginBottom: narrative.detail ? '4px' : 0 }}>
            {narrative.body}
          </div>
          {narrative.detail && (
            <div style={{ fontSize: '9px', color: 'rgba(96,165,250,0.8)', lineHeight: 1.3, fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
              {narrative.detail}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </foreignObject>
  )
}
