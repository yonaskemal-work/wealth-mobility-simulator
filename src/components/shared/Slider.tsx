import { useCallback, useState, useId } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (value: number) => string
  onChange: (value: number) => void
  color?: string
  helpText?: string
}

export function Slider({ label, value, min, max, step, format, onChange, color = '#3b82f6', helpText }: SliderProps) {
  const displayValue = format ? format(value) : value.toString()
  const percent = ((value - min) / (max - min)) * 100
  const [showHelp, setShowHelp] = useState(false)
  const id = useId()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value))
    },
    [onChange],
  )

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
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
                <span role="tooltip" className="absolute left-0 bottom-full mb-1 z-50 w-48 px-2 py-1.5 text-[10px] text-white/80 bg-[#1e293b] border border-white/10 rounded-md shadow-lg leading-tight">
                  {helpText}
                </span>
              )}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-white/90 tabular-nums">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        className="w-full"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #334155 ${percent}%, #334155 100%)`,
        }}
      />
    </div>
  )
}
