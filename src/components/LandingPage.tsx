import { motion } from 'framer-motion'

interface LandingPageProps {
  onEnter: () => void
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: 'blur(10px)',
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2 } },
}

export function LandingPage({ onEnter }: LandingPageProps) {
  // Star field positions with pre-computed opacity (avoids Math.random() in render)
  const stars: [number, number, number][] = [
    [8, 5, 0.20], [15, 12, 0.30], [25, 3, 0.18], [35, 18, 0.25], [45, 7, 0.32],
    [55, 14, 0.22], [65, 4, 0.28], [75, 20, 0.17], [85, 9, 0.35], [92, 16, 0.24],
    [20, 28, 0.19], [40, 25, 0.26], [60, 32, 0.31], [80, 27, 0.21], [50, 35, 0.27],
  ]

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#0c1a2e] flex items-center justify-center"
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Star dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(([x, y, opacity], i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{ left: `${x}%`, top: `${y}%`, opacity }}
            variants={fadeIn}
          />
        ))}
        {/* Subtle radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
          }}
        />
        {/* Mountain silhouette hint */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[200px]"
          style={{
            background: 'linear-gradient(to top, rgba(30, 58, 95, 0.15) 0%, transparent 100%)',
            clipPath: 'polygon(0% 100%, 50% 30%, 100% 100%)',
          }}
        />
      </div>

      {/* Centered content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        <motion.h1
          variants={fadeUp}
          className="font-mono text-3xl md:text-4xl font-bold text-white/90 leading-tight mb-6"
        >
          Wealth Mobility Tax Simulator
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-sm md:text-[15px] text-white/40 leading-relaxed mb-10"
        >
          Explore how tax policy shapes wealth over a lifetime. Six people start at age 25
          — same economy, same 40 years, but different rules apply to each. Adjust policy
          constraints and watch how small structural advantages compound into massive wealth gaps.
        </motion.p>

        <motion.div variants={fadeUp}>
          <motion.button
            onClick={onEnter}
            className="px-8 py-3.5 rounded-full text-sm font-semibold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.35), 0 6px 16px rgba(0, 0, 0, 0.3)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            Enter the Simulator →
          </motion.button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[10px] text-white/20 mt-6 leading-relaxed"
        >
          Drag the timeline. Click any climber for their story.
        </motion.p>
      </div>
    </motion.div>
  )
}
