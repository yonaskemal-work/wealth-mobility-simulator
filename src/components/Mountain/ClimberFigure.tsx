interface ClimberFigureProps {
  color: string
  direction: 'up' | 'down' | 'idle'
  walkPose: boolean // alternates for walk cycle
  hovered: boolean
}

export function ClimberFigure({ color, direction, walkPose, hovered }: ClimberFigureProps) {
  const scale = hovered ? 1.2 : 1

  // Limb angles based on direction and walk pose
  let leftArmAngle = 0
  let rightArmAngle = 0
  let leftLegAngle = 0
  let rightLegAngle = 0

  if (direction === 'up') {
    if (walkPose) {
      leftArmAngle = -35; rightArmAngle = 25
      leftLegAngle = -20; rightLegAngle = 15
    } else {
      leftArmAngle = 25; rightArmAngle = -35
      leftLegAngle = 15; rightLegAngle = -20
    }
  } else if (direction === 'down') {
    if (walkPose) {
      leftArmAngle = 20; rightArmAngle = -15
      leftLegAngle = 10; rightLegAngle = -10
    } else {
      leftArmAngle = -15; rightArmAngle = 20
      leftLegAngle = -10; rightLegAngle = 10
    }
  } else {
    // idle: arms slightly out, legs straight
    leftArmAngle = -10; rightArmAngle = 10
    leftLegAngle = -5; rightLegAngle = 5
  }

  // Figure dimensions (centered at 0,0 with feet at bottom)
  const headY = -14
  const headR = 2.8
  const neckY = headY + headR + 0.5
  const waistY = -2
  const armY = neckY + 2
  const armLen = 5
  const legLen = 6

  return (
    <g transform={`scale(${scale})`} style={{ transition: 'transform 0.15s' }}>
      {/* Glow behind figure */}
      <circle
        cx={0}
        cy={-6}
        r={10}
        fill={color}
        opacity={0.12}
      />

      {/* Head */}
      <circle
        cx={0}
        cy={headY}
        r={headR}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
      />

      {/* Body */}
      <line
        x1={0} y1={neckY}
        x2={0} y2={waistY}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Left arm */}
      <line
        x1={0} y1={armY}
        x2={Math.sin(leftArmAngle * Math.PI / 180) * armLen}
        y2={armY + Math.cos(leftArmAngle * Math.PI / 180) * armLen}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />

      {/* Right arm */}
      <line
        x1={0} y1={armY}
        x2={Math.sin(rightArmAngle * Math.PI / 180) * armLen}
        y2={armY + Math.cos(rightArmAngle * Math.PI / 180) * armLen}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />

      {/* Left leg */}
      <line
        x1={0} y1={waistY}
        x2={Math.sin(leftLegAngle * Math.PI / 180) * legLen}
        y2={waistY + Math.cos(leftLegAngle * Math.PI / 180) * legLen}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />

      {/* Right leg */}
      <line
        x1={0} y1={waistY}
        x2={Math.sin(rightLegAngle * Math.PI / 180) * legLen}
        y2={waistY + Math.cos(rightLegAngle * Math.PI / 180) * legLen}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  )
}
