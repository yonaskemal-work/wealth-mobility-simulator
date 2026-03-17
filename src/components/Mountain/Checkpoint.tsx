import { motion } from 'framer-motion'

interface CheckpointProps {
  x: number
  y: number
  label: string
  size: number
  type: 'labor' | 'capital'
  rateDisplay: string
}

export function Checkpoint({ x, y, label, size, type, rateDisplay }: CheckpointProps) {
  const color = type === 'labor' ? '#ef4444' : '#f97316'
  const halfW = Math.min(size / 2, 20) + 5
  const labelSide = type === 'labor' ? 'left' : 'right'

  return (
    <g>
      {/* Subtle dashed barrier line */}
      <motion.line
        x1={x - halfW}
        y1={y}
        x2={x + halfW}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.3}
        strokeDasharray="6 4"
        animate={{ x1: x - halfW, x2: x + halfW }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />

      {/* Label + rate with dark pill background for clean layering */}
      {(() => {
        const labelX = labelSide === 'left' ? x - halfW - 6 : x + halfW + 6
        const anchor = labelSide === 'left' ? 'end' : 'start'
        const fullLabel = rateDisplay ? `${label} ${rateDisplay}` : label
        const pillW = fullLabel.length * 5.5 + 10
        const pillX = labelSide === 'left' ? labelX - pillW : labelX
        return (
          <g>
            <rect
              x={pillX}
              y={y - 15}
              width={pillW}
              height={13}
              rx={3}
              fill="rgba(10, 18, 30, 0.7)"
            />
            <text
              x={labelX}
              y={y - 6}
              textAnchor={anchor}
            >
              <tspan
                fill={color}
                fontSize={8}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
                opacity={0.6}
              >
                {label}
              </tspan>
              {rateDisplay && (
                <tspan
                  fill={color}
                  fontSize={7.5}
                  fontWeight={700}
                  fontFamily="'Space Grotesk', Inter, sans-serif"
                  opacity={0.5}
                  dx={3}
                >
                  {rateDisplay}
                </tspan>
              )}
            </text>
          </g>
        )
      })()}
    </g>
  )
}
