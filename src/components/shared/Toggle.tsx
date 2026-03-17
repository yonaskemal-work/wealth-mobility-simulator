import { useState, useId } from 'react'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel?: string
  offLabel?: string
  helpText?: string
  color?: string
}

export function Toggle({ label, checked, onChange, onLabel = 'On', offLabel = 'Off', helpText, color = '#3b82f6' }: ToggleProps) {
  const [showHelp, setShowHelp] = useState(false)
  const id = useId()
  const helpId = `${id}-help`

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-xs font-medium text-white/60">{label}</label>
        {helpText && (
          <span
            className="relative cursor-help"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            onFocus={() => setShowHelp(true)}
            onBlur={() => setShowHelp(false)}
            tabIndex={0}
            role="note"
            aria-label="Help"
          >
            <span className="text-[9px] text-white/30 hover:text-white/60 transition-colors">(?)</span>
            {showHelp && (
              <span id={helpId} role="tooltip" className="absolute left-0 bottom-full mb-1 z-50 w-48 px-2 py-1.5 text-[10px] text-white/80 bg-[#1e293b] border border-white/10 rounded-md shadow-lg leading-tight">
                {helpText}
              </span>
            )}
          </span>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? onLabel : offLabel}`}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        style={{ backgroundColor: checked ? color : '#475569' }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 shadow-sm"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(3px)' }}
        />
      </button>
      <span className="text-[10px] text-white/50 w-16 text-right">{checked ? onLabel : offLabel}</span>
    </div>
  )
}
