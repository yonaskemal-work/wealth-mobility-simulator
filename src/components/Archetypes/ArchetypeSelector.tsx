import { ARCHETYPE_CONFIGS, type ArchetypeId, ARCHETYPE_ORDER } from '../../data/archetypeConfigs'

interface ArchetypeSelectorProps {
  visibleArchetypes: Set<ArchetypeId>
  onToggle: (id: ArchetypeId) => void
}

export function ArchetypeSelector({ visibleArchetypes, onToggle }: ArchetypeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {ARCHETYPE_ORDER.map((id) => {
        const config = ARCHETYPE_CONFIGS[id]
        const active = visibleArchetypes.has(id)
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className={`
              flex items-center gap-1.5 px-1.5 md:px-2 py-0.5 rounded text-[9px] font-medium
              transition-all duration-200 cursor-pointer
              ${active
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              }
            `}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity"
              style={{
                backgroundColor: config.color,
                opacity: active ? 1 : 0.3,
              }}
            />
            <span className="hidden md:inline">{config.shortName}</span>
          </button>
        )
      })}
    </div>
  )
}
