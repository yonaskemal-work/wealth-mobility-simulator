interface YearSliderProps {
  year: number
  onChange: (year: number) => void
}

export function YearSlider({ year, onChange }: YearSliderProps) {
  const age = 24 + year

  return (
    <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 items-center gap-3 px-4 py-2 bg-[#0f172a]/80 backdrop-blur-md rounded-full border border-white/10">
      <span className="text-[10px] font-medium text-white/50 whitespace-nowrap">Year 1</span>
      <input
        type="range"
        min={1}
        max={40}
        step={1}
        value={year}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-48"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((year - 1) / 39) * 100}%, #334155 ${((year - 1) / 39) * 100}%, #334155 100%)`,
        }}
      />
      <span className="text-[10px] font-medium text-white/50 whitespace-nowrap">Year 40</span>
      <div className="w-px h-4 bg-white/10" />
      <span className="text-xs font-bold text-white/90 tabular-nums whitespace-nowrap">
        Age {age}
      </span>
      <span className="text-[10px] text-white/40 whitespace-nowrap">
        (Yr {year})
      </span>
    </div>
  )
}
