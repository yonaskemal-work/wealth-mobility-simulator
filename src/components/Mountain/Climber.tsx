import { motion, useMotionValue, useSpring, animate } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { type ArchetypeId, ARCHETYPE_CONFIGS } from '../../data/archetypeConfigs'
import { ClimberFigure } from './ClimberFigure'
import { formatWealth } from '../../utils/formatters'

interface ClimberProps {
  x: number
  y: number
  color: string
  label: string
  wealth: number
  archetypeId: ArchetypeId
  onClick?: (id: ArchetypeId) => void
  labelYOffset?: number
  loopholes?: string[]
  openLoopholes?: string[]
}

export function Climber({ x, y, color, label, wealth, archetypeId, onClick, labelYOffset = 0, loopholes = [], openLoopholes = [] }: ClimberProps) {
  const [hovered, setHovered] = useState(false)
  const [walkPose, setWalkPose] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down' | 'idle'>('idle')
  const config = ARCHETYPE_CONFIGS[archetypeId]
  const prevY = useRef(y)
  const walkInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Spring-animated position
  const motionX = useMotionValue(x)
  const motionY = useMotionValue(y)
  const springX = useSpring(motionX, { stiffness: 80, damping: 18 })
  const springY = useSpring(motionY, { stiffness: 80, damping: 18 })

  useEffect(() => {
    // Determine direction
    const dy = y - prevY.current
    if (Math.abs(dy) > 2) {
      setDirection(dy < 0 ? 'up' : 'down')
      // Start walk cycle
      if (!walkInterval.current) {
        walkInterval.current = setInterval(() => {
          setWalkPose(p => !p)
        }, 200)
      }
    }

    // Animate to new position
    animate(motionX, x, { type: 'spring', stiffness: 80, damping: 18 })
    animate(motionY, y, { type: 'spring', stiffness: 80, damping: 18 })

    // Stop walk cycle after animation settles
    const timeout = setTimeout(() => {
      setDirection('idle')
      if (walkInterval.current) {
        clearInterval(walkInterval.current)
        walkInterval.current = null
      }
    }, 800)

    prevY.current = y

    return () => {
      clearTimeout(timeout)
    }
  }, [x, y, motionX, motionY])

  // Cleanup walk interval on unmount
  useEffect(() => {
    return () => {
      if (walkInterval.current) {
        clearInterval(walkInterval.current)
      }
    }
  }, [])

  // Loophole badge color
  const totalLoopholes = loopholes.length
  const openCount = openLoopholes.length
  const badgeColor = totalLoopholes === 0 ? '#64748b'
    : openCount === totalLoopholes ? '#34d399'
    : openCount === 0 ? '#ef4444'
    : '#f59e0b'

  // Hover card dimensions — larger when showing loopholes
  const hoverCardHeight = 44 + (totalLoopholes > 0 ? Math.min(totalLoopholes, 6) * 11 + 16 : 0)

  return (
    <motion.g
      style={{ x: springX, y: springY, cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(archetypeId)}
    >
      {/* Stick figure */}
      <g style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}>
        <ClimberFigure
          color={color}
          direction={direction}
          walkPose={walkPose}
          hovered={hovered}
        />
      </g>

      {/* Label with dark pill background for clear layering */}
      <g transform={`translate(0, ${-20 + labelYOffset})`}>
        {/* Dark pill background */}
        <rect
          x={-50}
          y={-7}
          width={100}
          height={15}
          rx={4}
          fill="rgba(10, 18, 30, 0.85)"
          stroke={`${color}30`}
          strokeWidth={0.5}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
        >
          <tspan
            fill={color}
            fontSize={8.5}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
          >
            {label}
          </tspan>
          <tspan
            fill="white"
            fontSize={7.5}
            fontWeight={500}
            fontFamily="'Space Grotesk', Inter, sans-serif"
            opacity={0.7}
            dx={3}
          >
            {formatWealth(wealth)}
          </tspan>
        </text>

        {/* Loophole badge — small count below label */}
        {totalLoopholes > 0 && (
          <g transform="translate(0, 14)">
            <rect
              x={-22}
              y={-5}
              width={44}
              height={11}
              rx={5.5}
              fill="rgba(10, 18, 30, 0.8)"
              stroke={`${badgeColor}40`}
              strokeWidth={0.4}
            />
            {/* Shield icon */}
            <path
              d={`M -14 -1 L -14 2 C -14 4 -12 5 -11 5 C -10 5 -8 4 -8 2 L -8 -1 L -11 -2.5 Z`}
              fill={badgeColor}
              opacity={0.7}
            />
            <text
              x={2}
              y={3}
              textAnchor="middle"
              fill={badgeColor}
              fontSize={7}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
              opacity={0.8}
            >
              {openCount}/{totalLoopholes}
            </text>
          </g>
        )}
      </g>

      {/* Hover card — shows loophole list */}
      {hovered && (
        <foreignObject
          x={-100}
          y={16}
          width={200}
          height={hoverCardHeight + 10}
        >
          <div
            // @ts-expect-error xmlns required for foreignObject HTML
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '8px 10px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '2px' }}>
              {config.name}
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: totalLoopholes > 0 ? '6px' : '0' }}>
              Wealth: {formatWealth(wealth)}
            </div>

            {totalLoopholes > 0 && (
              <>
                <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {openCount} of {totalLoopholes} loopholes open
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {loopholes.map((l) => {
                    const isOpen = openLoopholes.includes(l)
                    return (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: isOpen ? '#34d399' : '#ef4444',
                          opacity: isOpen ? 0.8 : 0.5,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '8px',
                          color: isOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                          textDecoration: isOpen ? 'none' : 'line-through',
                          lineHeight: 1.2,
                        }}>
                          {l}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            {totalLoopholes === 0 && (
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                No tax loopholes — pays full rate
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </motion.g>
  )
}
