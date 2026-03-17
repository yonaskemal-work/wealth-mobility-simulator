import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'mountainLegendDismissed'

export function MountainLegend() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      setVisible(dismissed !== 'true')
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
  }

  return (
    <foreignObject x={8} y={415} width={175} height={98}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            // @ts-expect-error xmlns required for foreignObject HTML
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontFamily: 'Inter, sans-serif',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Dismiss legend"
              style={{
                position: 'absolute',
                top: '3px',
                right: '5px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '10px',
                cursor: 'pointer',
                padding: '2px',
                lineHeight: 1,
              }}
            >
              &#215;
            </button>

            <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
              How to read this
            </div>

            {/* Legend rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <LegendRow>
                <svg width="14" height="8"><line x1="0" y1="4" x2="14" y2="4" stroke="#3b82f6" strokeWidth="2" /></svg>
                <span>Labor Track (wages)</span>
              </LegendRow>
              <LegendRow>
                <svg width="14" height="8"><line x1="0" y1="4" x2="14" y2="4" stroke="#10b981" strokeWidth="2" /></svg>
                <span>Capital Track (investments)</span>
              </LegendRow>
              <LegendRow>
                <svg width="14" height="8"><line x1="0" y1="4" x2="14" y2="4" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.6" /><line x1="4" y1="1" x2="8" y2="7" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" /><line x1="9" y1="1" x2="13" y2="7" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" /></svg>
                <span>Tax Checkpoint</span>
              </LegendRow>
              <LegendRow>
                <svg width="14" height="10"><rect x="0" y="1" width="14" height="8" rx="4" fill="rgba(52,211,153,0.15)" stroke="#34d399" strokeWidth="0.6" /><text x="7" y="7" textAnchor="middle" fill="#34d399" fontSize="5" fontWeight="600">2/3</text></svg>
                <span>Loophole badge (hover climber)</span>
              </LegendRow>
              <LegendRow>
                <svg width="14" height="10"><circle cx="5" cy="3" r="2" fill="#8b5cf6" /><line x1="5" y1="5" x2="5" y2="9" stroke="#8b5cf6" strokeWidth="1" /></svg>
                <span>Click climber for story</span>
              </LegendRow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </foreignObject>
  )
}

function LegendRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.2 }}>
      {children}
    </div>
  )
}
