import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePolicyStore, type PolicyState } from '../../models/policyState'
import { ARCHETYPE_CONFIGS, type ArchetypeId, ARCHETYPE_ORDER } from '../../data/archetypeConfigs'
import { projectWealth } from '../../models/wealthProjection'
import { getLoopholeStatus } from '../../models/taxCalculator'
import { Checkpoint } from './Checkpoint'
import { Climber } from './Climber'
import { WealthTier } from './WealthTier'
import { YearNarrative } from './YearNarrative'
import { MountainLegend } from './MountainLegend'
import {
  VIEW_W, VIEW_H, MOUNTAIN_PEAK_X, MOUNTAIN_PEAK_Y,
  MOUNTAIN_BASE_LEFT, MOUNTAIN_BASE_RIGHT, MOUNTAIN_BASE_Y,
  getLaborPathX, getCapitalPathX, wealthToY,
} from '../../utils/mountainGeometry'

const WEALTH_TIERS = [
  { label: '$100K', value: 100_000 },
  { label: '$1M', value: 1_000_000 },
  { label: '$10M', value: 10_000_000 },
  { label: '$100M', value: 100_000_000 },
  { label: '$1B', value: 1_000_000_000 },
].map(tier => ({ ...tier, y: wealthToY(tier.value) }))

const LABOR_CHECKPOINTS = [
  { id: 'income-tax', label: 'Income Tax', y: 375, policyKey: 'incomeTaxBrackets' as const },
  { id: 'fica', label: 'Payroll Tax', y: 280, policyKey: 'ficaRate' as const },
  { id: 'state-tax', label: 'State Tax', y: 200, policyKey: 'stateIncomeTaxRate' as const },
]

const CAPITAL_CHECKPOINTS = [
  { id: 'ltcg', label: 'Investment Tax', y: 370, policyKey: 'ltcgRate' as const },
]

function getCheckpointSize(policyKey: string, policy: PolicyState): number {
  switch (policyKey) {
    case 'incomeTaxBrackets': {
      const avgRate = policy.incomeTaxBrackets.reduce((s, b) => s + b.rate, 0) / policy.incomeTaxBrackets.length
      return 12 + avgRate * 70
    }
    case 'ficaRate':
      return 10 + (policy.ficaRate / 0.15) * 35
    case 'stateIncomeTaxRate':
      return 10 + (policy.stateIncomeTaxRate / 0.13) * 30
    case 'ltcgRate':
      return 12 + (policy.ltcgRate / 0.40) * 45
    default:
      return 15
  }
}

function getCheckpointRateDisplay(policyKey: string, policy: PolicyState): string {
  switch (policyKey) {
    case 'incomeTaxBrackets': {
      const topRate = policy.incomeTaxBrackets[policy.incomeTaxBrackets.length - 1].rate
      return `${(topRate * 100).toFixed(0)}%`
    }
    case 'ficaRate':
      return `${(policy.ficaRate * 100).toFixed(1)}%`
    case 'stateIncomeTaxRate':
      return `${(policy.stateIncomeTaxRate * 100).toFixed(0)}%`
    case 'ltcgRate':
      return `${(policy.ltcgRate * 100).toFixed(0)}%`
    default:
      return ''
  }
}

interface MountainProps {
  visibleArchetypes: Set<ArchetypeId>
  selectedYear: number
  onClimberClick?: (id: ArchetypeId) => void
}

export function Mountain({ visibleArchetypes, selectedYear, onClimberClick }: MountainProps) {
  const policy = usePolicyStore()
  const loopholes = useMemo(() => getLoopholeStatus(policy), [policy])
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const projections = useMemo(() => {
    const result: Record<ArchetypeId, ReturnType<typeof projectWealth>> = {} as any
    for (const id of ARCHETYPE_ORDER) {
      result[id] = projectWealth(ARCHETYPE_CONFIGS[id], policy)
    }
    return result
  }, [policy])

  const mountainPath = `
    M ${MOUNTAIN_BASE_LEFT} ${MOUNTAIN_BASE_Y}
    C ${MOUNTAIN_BASE_LEFT + 30} ${MOUNTAIN_BASE_Y - 30}, ${MOUNTAIN_BASE_LEFT + 100} ${MOUNTAIN_BASE_Y - 160}, ${MOUNTAIN_PEAK_X - 120} ${MOUNTAIN_PEAK_Y + 100}
    C ${MOUNTAIN_PEAK_X - 60} ${MOUNTAIN_PEAK_Y + 30}, ${MOUNTAIN_PEAK_X - 20} ${MOUNTAIN_PEAK_Y + 5}, ${MOUNTAIN_PEAK_X} ${MOUNTAIN_PEAK_Y}
    C ${MOUNTAIN_PEAK_X + 20} ${MOUNTAIN_PEAK_Y + 5}, ${MOUNTAIN_PEAK_X + 60} ${MOUNTAIN_PEAK_Y + 30}, ${MOUNTAIN_PEAK_X + 120} ${MOUNTAIN_PEAK_Y + 100}
    C ${MOUNTAIN_BASE_RIGHT - 100} ${MOUNTAIN_BASE_Y - 160}, ${MOUNTAIN_BASE_RIGHT - 30} ${MOUNTAIN_BASE_Y - 30}, ${MOUNTAIN_BASE_RIGHT} ${MOUNTAIN_BASE_Y}
    Z
  `

  const snowPath = `
    M ${MOUNTAIN_PEAK_X - 70} ${MOUNTAIN_PEAK_Y + 55}
    C ${MOUNTAIN_PEAK_X - 40} ${MOUNTAIN_PEAK_Y + 20}, ${MOUNTAIN_PEAK_X - 15} ${MOUNTAIN_PEAK_Y + 5}, ${MOUNTAIN_PEAK_X} ${MOUNTAIN_PEAK_Y}
    C ${MOUNTAIN_PEAK_X + 15} ${MOUNTAIN_PEAK_Y + 5}, ${MOUNTAIN_PEAK_X + 40} ${MOUNTAIN_PEAK_Y + 20}, ${MOUNTAIN_PEAK_X + 70} ${MOUNTAIN_PEAK_Y + 55}
    C ${MOUNTAIN_PEAK_X + 40} ${MOUNTAIN_PEAK_Y + 65}, ${MOUNTAIN_PEAK_X - 40} ${MOUNTAIN_PEAK_Y + 65}, ${MOUNTAIN_PEAK_X - 70} ${MOUNTAIN_PEAK_Y + 55}
    Z
  `

  const laborPoints: [number, number][] = []
  for (let y = MOUNTAIN_BASE_Y; y >= MOUNTAIN_PEAK_Y + 20; y -= 3) {
    laborPoints.push([getLaborPathX(y), y])
  }
  const laborPathD = `M ${laborPoints.map(p => `${p[0]},${p[1]}`).join(' L ')}`

  const capitalPoints: [number, number][] = []
  for (let y = MOUNTAIN_BASE_Y; y >= MOUNTAIN_PEAK_Y + 20; y -= 3) {
    capitalPoints.push([getCapitalPathX(y), y])
  }
  const capitalPathD = `M ${capitalPoints.map(p => `${p[0]},${p[1]}`).join(' L ')}`

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox={isMobile ? '50 0 600 520' : `0 0 ${VIEW_W} ${VIEW_H}`}
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '92%' }}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="mountain-gradient" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="30%" stopColor="#1a3050" />
            <stop offset="60%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#264a6e" />
          </linearGradient>
          <linearGradient id="sky-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0c1a2e" />
            <stop offset="60%" stopColor="#132744" />
            <stop offset="100%" stopColor="#1a3656" />
          </linearGradient>
          <linearGradient id="labor-gradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="capital-gradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#sky-gradient)" />

        {/* Subtle stars */}
        {[
          [100, 30], [200, 15], [350, 25], [500, 10], [600, 35], [150, 50], [450, 45],
          [80, 60], [550, 55], [320, 20], [650, 40], [250, 8],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={0.7} fill="white" opacity={0.3} />
        ))}

        {/* Mountain body */}
        <motion.path
          d={mountainPath}
          fill="url(#mountain-gradient)"
          stroke="#2a4a6b"
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Subtle contour lines */}
        {[0.2, 0.4, 0.6, 0.8].map((frac) => {
          const contourY = MOUNTAIN_BASE_Y - frac * (MOUNTAIN_BASE_Y - MOUNTAIN_PEAK_Y - 30)
          const leftX = getLaborPathX(contourY) - 20
          const rightX = getCapitalPathX(contourY) + 20
          return (
            <line
              key={frac}
              x1={leftX} y1={contourY}
              x2={rightX} y2={contourY}
              stroke="#3a5a7a" strokeWidth={0.3} opacity={0.3}
            />
          )
        })}

        {/* Snow cap */}
        <path d={snowPath} fill="#c8ddf0" opacity={0.25} />

        {/* ===== LAYER 1: Background reference marks (lowest z) ===== */}
        <g className="layer-wealth-tiers" opacity={0.5}>
          {WEALTH_TIERS.map((tier) => (
            <WealthTier
              key={tier.label}
              label={tier.label}
              y={tier.y}
              leftX={getLaborPathX(tier.y) - 40}
              rightX={getCapitalPathX(tier.y) + 40}
            />
          ))}
        </g>

        {/* ===== LAYER 2: Track paths ===== */}
        <g className="layer-paths">
          <path d={laborPathD} fill="none" stroke="#3b82f6" strokeWidth={10} strokeLinecap="round" opacity={0.15} filter="url(#glow)" />
          <motion.path d={laborPathD} fill="none" stroke="url(#labor-gradient)" strokeWidth={3.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
          <path d={capitalPathD} fill="none" stroke="#10b981" strokeWidth={10} strokeLinecap="round" opacity={0.15} filter="url(#glow)" />
          <motion.path d={capitalPathD} fill="none" stroke="url(#capital-gradient)" strokeWidth={3.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.15 }} />
          <text x={getLaborPathX(MOUNTAIN_BASE_Y)} y={MOUNTAIN_BASE_Y + 10} textAnchor="middle" fill="#60a5fa" fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif" opacity={0.8}>
            Labor Track
          </text>
          <text x={getCapitalPathX(MOUNTAIN_BASE_Y)} y={MOUNTAIN_BASE_Y + 10} textAnchor="middle" fill="#34d399" fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif" opacity={0.8}>
            Capital Track
          </text>
        </g>

        {/* ===== LAYER 3: Checkpoints (barriers on paths) ===== */}
        <g className="layer-checkpoints">
          {LABOR_CHECKPOINTS.map((cp) => (
            <Checkpoint key={cp.id} x={getLaborPathX(cp.y)} y={cp.y} label={cp.label} size={getCheckpointSize(cp.policyKey, policy)} type="labor" rateDisplay={getCheckpointRateDisplay(cp.policyKey, policy)} />
          ))}
          {CAPITAL_CHECKPOINTS.map((cp) => (
            <Checkpoint key={cp.id} x={getCapitalPathX(cp.y)} y={cp.y} label={cp.label} size={getCheckpointSize(cp.policyKey, policy)} type="capital" rateDisplay={getCheckpointRateDisplay(cp.policyKey, policy)} />
          ))}
        </g>

        {/* ===== LAYER 4: Climbers (highest interactive z) ===== */}
        <g className="layer-climbers">
          {(() => {
            const visible = ARCHETYPE_ORDER.filter((id) => visibleArchetypes.has(id))
            const climberData = visible.map((id) => {
              const config = ARCHETYPE_CONFIGS[id]
              const snapshots = projections[id]
              const yearIndex = Math.min(selectedYear - 1, snapshots.length - 1)
              const snapshot = snapshots[yearIndex]
              const wealth = snapshot?.wealth ?? 0
              const cy = wealthToY(wealth)
              // For 'crossover' archetypes, follow the dynamic snapshot track (they switch sides)
              // For fixed 'labor' or 'capital' archetypes, always show on their primary track side
              const displayTrack = config.primaryTrack === 'crossover'
                ? (snapshot?.track ?? 'labor')
                : config.primaryTrack
              const isCapital = displayTrack === 'capital' || displayTrack === 'crossover'
              const cx = isCapital ? getCapitalPathX(cy) : getLaborPathX(cy)
              return { id, cx, cy, wealth, config, isCapital }
            })

            // Resolve label overlaps per track — generous spacing for clear layering
            function resolveOverlaps(items: { id: ArchetypeId; cy: number }[]): Record<string, number> {
              const sorted = [...items].sort((a, b) => a.cy - b.cy)
              const offsets: Record<string, number> = {}
              for (const c of sorted) offsets[c.id] = 0
              const MIN_GAP = 24
              for (let pass = 0; pass < 8; pass++) {
                for (let i = 1; i < sorted.length; i++) {
                  const prevY = sorted[i - 1].cy + offsets[sorted[i - 1].id]
                  const currY = sorted[i].cy + offsets[sorted[i].id]
                  const gap = currY - prevY
                  if (gap < MIN_GAP) {
                    const push = (MIN_GAP - gap) / 2
                    offsets[sorted[i - 1].id] -= push
                    offsets[sorted[i].id] += push
                  }
                }
              }
              for (const c of sorted) {
                offsets[c.id] = Math.max(-45, Math.min(45, offsets[c.id]))
              }
              return offsets
            }

            const laborOffsets = resolveOverlaps(climberData.filter((c) => !c.isCapital))
            const capitalOffsets = resolveOverlaps(climberData.filter((c) => c.isCapital))
            const allOffsets: Record<string, number> = { ...laborOffsets, ...capitalOffsets }

            return climberData.map(({ id, cx, cy, wealth, config }) => {
              const archetypeLoopholes = config.loopholes
              const openLoopholes = archetypeLoopholes.filter(l => loopholes[l] ?? false)
              return (
                <Climber
                  key={id}
                  x={cx}
                  y={cy}
                  color={config.color}
                  label={config.shortName}
                  wealth={wealth}
                  archetypeId={id}
                  onClick={onClimberClick}
                  labelYOffset={allOffsets[id] ?? 0}
                  loopholes={archetypeLoopholes}
                  openLoopholes={openLoopholes}
                />
              )
            })
          })()}
        </g>

        {/* ===== LAYER 5: UI overlays (narrative, legend — topmost, desktop only) ===== */}
        {!isMobile && (
          <g className="layer-ui-overlays">
            <YearNarrative
              selectedYear={selectedYear}
              projections={projections}
              visibleArchetypes={visibleArchetypes}
              policy={policy}
            />
            <MountainLegend />
          </g>
        )}
      </svg>
    </div>
  )
}
