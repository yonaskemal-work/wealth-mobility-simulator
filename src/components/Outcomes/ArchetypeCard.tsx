import { motion } from 'framer-motion'
import type { ArchetypeConfig } from '../../data/archetypeConfigs'
import { formatWealth } from '../../utils/formatters'

interface ArchetypeCardProps {
  config: ArchetypeConfig
  terminalWealth: number
  yearsTo1M: number | null
  yearsTo10M: number | null
  yearsTo100M: number | null
  avgTaxRate: number
}

export function ArchetypeCard({ config, terminalWealth, yearsTo1M, yearsTo10M, yearsTo100M, avgTaxRate }: ArchetypeCardProps) {
  const trackLabel = config.primaryTrack === 'labor' ? 'Labor' : config.primaryTrack === 'capital' ? 'Capital' : 'Crossover'
  const trackColor = config.primaryTrack === 'labor'
    ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    : config.primaryTrack === 'capital'
      ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      : 'text-violet-400 bg-violet-500/20 border-violet-500/30'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-semibold text-white/90">{config.name}</span>
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${trackColor}`}>
          {trackLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div className="text-white/40">At Retirement</div>
        <div className="text-right font-semibold text-white/90 tabular-nums">
          {formatWealth(terminalWealth)}
        </div>

        <div className="text-white/40">Avg Tax Rate</div>
        <div className="text-right font-semibold text-white/90 tabular-nums">
          {(avgTaxRate * 100).toFixed(1)}%
        </div>

        <div className="text-white/40">Years to $1M</div>
        <div className="text-right font-semibold text-white/90 tabular-nums">
          {yearsTo1M !== null ? `${yearsTo1M} yrs` : '40+'}
        </div>

        <div className="text-white/40">Years to $10M</div>
        <div className="text-right font-semibold text-white/90 tabular-nums">
          {yearsTo10M !== null ? `${yearsTo10M} yrs` : '40+'}
        </div>

        <div className="text-white/40">Years to $100M</div>
        <div className="text-right font-semibold text-white/90 tabular-nums">
          {yearsTo100M !== null ? `${yearsTo100M} yrs` : '40+'}
        </div>
      </div>

      {config.loopholes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {config.loopholes.map((l) => (
            <span
              key={l}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10"
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
