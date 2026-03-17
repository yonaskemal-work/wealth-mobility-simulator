import { LaborControls } from './LaborControls'
import { CapitalControls } from './CapitalControls'
import { ReformControls } from './ReformControls'
import { useState } from 'react'

type Tab = 'labor' | 'capital' | 'reform'

export function PolicyPanel() {
  const [tab, setTab] = useState<Tab>('labor')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2 pr-10">
        <h2 className="text-sm font-bold text-white/90 tracking-tight">Policy Controls</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Adjust parameters to see real-time impact</p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-white/10 px-4">
        {([
          { key: 'labor' as Tab, label: 'Labor Taxes', color: 'blue' },
          { key: 'capital' as Tab, label: 'Capital Taxes', color: 'emerald' },
          { key: 'reform' as Tab, label: 'Reforms', color: 'violet' },
        ]).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`
              flex-1 py-2 text-[10px] font-semibold border-b-2 transition-colors cursor-pointer
              ${tab === key
                ? ''
                : 'text-white/40 border-transparent hover:text-white/60'
              }
            `}
            style={tab === key ? {
              color: color === 'blue' ? '#60a5fa' : color === 'emerald' ? '#34d399' : '#a78bfa',
              borderColor: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#8b5cf6',
            } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'labor' && <LaborControls />}
        {tab === 'capital' && <CapitalControls />}
        {tab === 'reform' && <ReformControls />}
      </div>
    </div>
  )
}
