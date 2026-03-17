import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PolicyPanel } from './components/Controls/PolicyPanel'
import { Mountain } from './components/Mountain/Mountain'
import { OutcomePanel } from './components/Outcomes/OutcomePanel'
import { ArchetypeStoryModal } from './components/Outcomes/ArchetypeStoryModal'
import { ArchetypeSelector } from './components/Archetypes/ArchetypeSelector'
import { YearSlider } from './components/shared/YearSlider'
import { LandingPage } from './components/LandingPage'
import { type ArchetypeId, ARCHETYPE_ORDER } from './data/archetypeConfigs'
import { usePolicyStore } from './models/policyState'
import { PRESETS } from './data/defaultPolicies'

function App() {
  const [visibleArchetypes, setVisibleArchetypes] = useState<Set<ArchetypeId>>(
    new Set(ARCHETYPE_ORDER),
  )
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(40)
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null)
  const [showLanding, setShowLanding] = useState(true)
  const loadPreset = usePolicyStore((s) => s.loadPreset)

  const toggleArchetype = useCallback((id: ArchetypeId) => {
    setVisibleArchetypes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleClimberClick = useCallback((id: ArchetypeId) => {
    setSelectedArchetype(id)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#0c1a2e]">
      {/* FULL-SCREEN MOUNTAIN */}
      <div className="absolute inset-0 z-0">
        <Mountain
          visibleArchetypes={visibleArchetypes}
          selectedYear={selectedYear}
          onClimberClick={handleClimberClick}
        />
      </div>

      {/* TOP TOOLBAR */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0f172a]/70 backdrop-blur-md border-b border-white/5">
          <h1 className="text-[11px] font-semibold text-white/80 tracking-tight whitespace-nowrap">
            Wealth Mobility Tax Simulator
          </h1>
          <div className="w-px h-4 bg-white/10" />
          <ArchetypeSelector
            visibleArchetypes={visibleArchetypes}
            onToggle={toggleArchetype}
          />
          <div className="flex-1" />
          <div className="flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-hide">
            {Object.entries(PRESETS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => loadPreset(PRESETS[key].policy)}
                className="px-2 py-1 text-[9px] font-medium rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT: Controls toggle */}
      <AnimatePresence>
        {!leftOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setLeftOpen(true)}
            className="absolute left-3 top-14 z-20 w-9 h-9 bg-[#1e293b]/70 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#1e293b] transition-colors cursor-pointer"
            title="Policy Controls"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4.5h10M3 8h6M3 11.5h10" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* LEFT PANEL */}
      <AnimatePresence>
        {leftOpen && (
          <motion.div
            initial={{ x: -310, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -310, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute left-3 top-14 bottom-3 z-20 w-[290px] bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            <button
              onClick={() => setLeftOpen(false)}
              aria-label="Close policy controls"
              className="absolute top-2.5 right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/80 text-xs transition-colors cursor-pointer"
            >
              &#215;
            </button>
            <div className="flex-1 overflow-y-auto">
              <PolicyPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT: Outcomes toggle */}
      <AnimatePresence>
        {!rightOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setRightOpen(true)}
            className="absolute right-3 top-14 z-20 w-9 h-9 bg-[#1e293b]/70 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#1e293b] transition-colors cursor-pointer"
            title="Outcomes"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="4.5" height="4.5" rx="1" stroke="white" strokeWidth="1.1" opacity="0.6" />
              <rect x="8.5" y="3" width="4.5" height="4.5" rx="1" stroke="white" strokeWidth="1.1" opacity="0.6" />
              <rect x="3" y="8.5" width="4.5" height="4.5" rx="1" stroke="white" strokeWidth="1.1" opacity="0.6" />
              <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1" stroke="white" strokeWidth="1.1" opacity="0.6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* RIGHT PANEL */}
      <AnimatePresence>
        {rightOpen && (
          <motion.div
            initial={{ x: 310, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 310, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-3 top-14 bottom-3 z-20 w-[290px] bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            <button
              onClick={() => setRightOpen(false)}
              aria-label="Close outcomes panel"
              className="absolute top-2.5 left-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/80 text-xs transition-colors cursor-pointer"
            >
              &#215;
            </button>
            <div className="flex-1 overflow-y-auto">
              <OutcomePanel visibleArchetypes={visibleArchetypes} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARCHETYPE STORY MODAL */}
      <AnimatePresence>
        {selectedArchetype && (
          <ArchetypeStoryModal
            archetypeId={selectedArchetype}
            selectedYear={selectedYear}
            onClose={() => setSelectedArchetype(null)}
          />
        )}
      </AnimatePresence>

      {/* YEAR TIMELINE SLIDER */}
      <YearSlider year={selectedYear} onChange={setSelectedYear} />

      {/* LANDING PAGE OVERLAY */}
      <AnimatePresence>
        {showLanding && (
          <LandingPage onEnter={() => setShowLanding(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
