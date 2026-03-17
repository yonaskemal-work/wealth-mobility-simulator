interface WealthTierProps {
  label: string
  y: number
  leftX: number
  rightX: number
}

export function WealthTier({ label, y, leftX, rightX }: WealthTierProps) {
  return (
    <g>
      <line
        x1={leftX}
        y1={y}
        x2={rightX}
        y2={y}
        stroke="#4a6a8a"
        strokeWidth={0.3}
        strokeDasharray="3 5"
        opacity={0.3}
      />
      <text
        x={leftX - 6}
        y={y + 3}
        textAnchor="end"
        fill="#5a7a98"
        fontSize={8.5}
        fontWeight={400}
        fontFamily="'Space Grotesk', Inter, sans-serif"
        opacity={0.6}
      >
        {label}
      </text>
    </g>
  )
}
