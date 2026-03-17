import { motion } from 'framer-motion'

interface AggregateMetricsProps {
  laborRate: number
  capitalRate: number
  spread: number
  loopholeCount: number
  totalLoopholes: number
}

export function AggregateMetrics({ laborRate, capitalRate, spread, loopholeCount, totalLoopholes }: AggregateMetricsProps) {
  const spreadColor = spread > 0.15 ? 'text-red-400' : spread > 0.05 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5">
        <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">Worker Tax</div>
        <motion.div
          className="text-lg font-bold text-blue-300 tabular-nums"
          key={laborRate.toFixed(3)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {(laborRate * 100).toFixed(1)}%
        </motion.div>
        <div className="text-[11px] text-blue-400/60">at $150K income</div>
      </div>

      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
        <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Investor Tax</div>
        <motion.div
          className="text-lg font-bold text-emerald-300 tabular-nums"
          key={capitalRate.toFixed(3)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {(capitalRate * 100).toFixed(1)}%
        </motion.div>
        <div className="text-[11px] text-emerald-400/60">inheritor avg</div>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
        <div className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Gap</div>
        <motion.div
          className={`text-lg font-bold tabular-nums ${spreadColor}`}
          key={spread.toFixed(3)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {spread > 0 ? '+' : ''}{(spread * 100).toFixed(1)}pp
        </motion.div>
        <div className="text-[11px] text-white/30">worker pays more</div>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
        <div className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Loopholes</div>
        <motion.div
          className="text-lg font-bold text-white/80 tabular-nums"
          key={loopholeCount}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {loopholeCount}/{totalLoopholes}
        </motion.div>
        <div className="text-[11px] text-white/30">open</div>
      </div>
    </div>
  )
}
