import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { type ArchetypeId, ARCHETYPE_CONFIGS } from '../../data/archetypeConfigs'
import { usePolicyStore } from '../../models/policyState'
import { projectWealth, getYearsToMilestone, getAverageEffectiveTaxRate } from '../../models/wealthProjection'
import { getLoopholeStatus } from '../../models/taxCalculator'
import { formatWealth } from '../../utils/formatters'

interface ArchetypeStoryModalProps {
  archetypeId: ArchetypeId
  selectedYear: number
  onClose: () => void
}

interface LoopholeDetail {
  explanation: string
  example: string
}

interface ArchetypeStory {
  tagline: string
  background: string
  incomeStrategy: string
  loopholeDetails: Record<string, LoopholeDetail>
}

const ARCHETYPE_STORIES: Record<ArchetypeId, ArchetypeStory> = {
  w2worker: {
    tagline: 'The Backbone of America',
    background: 'A 25-year-old starting their career earning $75K/year. Works a steady job, gets ~2% annual raises, and saves 15% of take-home pay into index funds. Every dollar of income is taxed as ordinary income plus FICA.',
    incomeStrategy: 'Pure salary — no equity, no capital gains strategies, no pass-through deductions. The only tax shelters available are retirement accounts, which are modest compared to what the capital track offers.',
    loopholeDetails: {
      '401(k) Deferral': {
        explanation: 'Contributes pre-tax dollars to a 401(k), reducing current taxable income. The money grows tax-deferred until withdrawal in retirement.',
        example: 'Contributes $23K/year pre-tax, reducing taxable income from $75K to $52K. At a 22% bracket, saves ~$5,060/year in federal tax.',
      },
      'HSA': {
        explanation: 'Health Savings Account offers triple tax advantage: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.',
        example: 'Contributes $4,150/year pre-tax. At a 22% bracket, saves ~$913/year. Over 40 years at 7% returns, the HSA alone grows to ~$900K.',
      },
    },
  },
  highEarner: {
    tagline: 'Top of the Ladder, Still on the Clock',
    background: 'A 25-year-old surgeon, corporate lawyer, or senior software engineer earning $300K/year. Top-bracket income with 3% annual raises. Saves 25% of take-home pay. Despite the high salary, still fundamentally trading time for money.',
    incomeStrategy: 'High W-2 salary taxed at top marginal rates (32-37%). Also generates investment returns on accumulated savings, but the majority of wealth comes from labor — not capital.',
    loopholeDetails: {
      'Backdoor Roth': {
        explanation: 'Income is too high for direct Roth IRA contributions, so contributes to a traditional IRA then immediately converts to Roth. All future growth is completely tax-free.',
        example: '~$7K/year grows tax-free. Over 40 years at 7% returns, that single strategy shelters ~$1.5M from all future taxation.',
      },
      'Deferred Compensation': {
        explanation: 'Defers up to 40% of salary to future years when their tax rate may be lower (e.g., retirement). The deferred amount is not taxed until received.',
        example: 'Deferring $120K/year at a 37% bracket saves ~$44K/year in current taxes. If withdrawn at a 24% bracket in retirement, the rate arbitrage saves ~$15K/year.',
      },
      'Charitable Giving': {
        explanation: 'Donates appreciated stock to charity. Deducts the full market value from income while paying zero capital gains on the appreciation.',
        example: 'Donates ~8% of AGI ($24K) in appreciated stock. Gets a $24K income tax deduction (~$8,880 saved) AND avoids ~$3,600 in capital gains tax on the appreciation.',
      },
    },
  },
  techFounder: {
    tagline: 'From Garage to Capital Track',
    background: 'A 25-year-old who starts a tech company. Takes a modest $120K salary for 7 years while building the business. At age 31 (year 7), the company is acquired and they receive $20M in stock — instantly jumping from the labor track to the capital track.',
    incomeStrategy: 'Pre-exit: modest $120K salary, mostly reinvesting in the company. Post-exit: lives entirely off investment returns from the $20M windfall. No earned income — pure capital gains.',
    loopholeDetails: {
      'QSBS Exclusion': {
        explanation: 'Section 1202 excludes up to $10M (or 10x basis) of gains from qualified small business stock held 5+ years. Under OBBBA, the cap rises to $15M with graduated exclusion.',
        example: 'On a $20M exit, shields up to $15M from the 20% LTCG rate. Tax saved: up to $3M — the single biggest tax break available to founders.',
      },
      'Buy-Borrow-Die': {
        explanation: 'Post-exit, instead of selling stock (triggering capital gains), borrows against the portfolio at low interest rates. Lives off loan proceeds — which are not taxable income.',
        example: 'Borrows $500K/year against a $20M portfolio at 5% interest. Pays $25K in interest but avoids $100K in capital gains tax. When they die, heirs get a step-up basis and repay the loan.',
      },
      '83(b) Election': {
        explanation: 'Files an 83(b) election at founding, paying tax on the stock\'s value at grant ($1,000) instead of at vesting ($20M). Converts what would be ordinary income into long-term capital gains.',
        example: 'Pays tax on $1,000 of stock at founding. Without 83(b), would owe ordinary income tax on $20M at vesting (~$7.4M). With 83(b) + LTCG rate: ~$4M. Savings: ~$3.4M.',
      },
      'Opportunity Zone': {
        explanation: 'Invests capital gains into a Qualified Opportunity Zone fund. After 10 years, all appreciation on the OZ investment is permanently tax-free.',
        example: 'Invests $2M of exit proceeds into an OZ fund. Over 10 years, it grows to $5M. The $3M in appreciation is completely tax-free — saving ~$600K in capital gains tax.',
      },
      'Charitable Stock Donation': {
        explanation: 'Donates highly appreciated stock to charity or a donor-advised fund. Gets a full fair-market-value income tax deduction and pays zero capital gains.',
        example: 'Donates $1M of stock (cost basis: $10K) to charity. Gets a $1M deduction (~$370K tax benefit) AND avoids $198K in capital gains tax. Total benefit: ~$568K.',
      },
    },
  },
  vcPartner: {
    tagline: 'The Carried Interest Play',
    background: 'Starts at 25 as a venture capital analyst earning $120K. Over 4 years, works their way up through associate to principal. At age 29 (year 5), makes partner — earning $500K in management fees plus $2M/year in carried interest from successful fund investments.',
    incomeStrategy: 'Pre-partner: $120K analyst salary (pure labor). Post-partner: $500K management fees (ordinary income) + $2M carried interest (taxed as capital gains at 20% instead of the 37% income rate). The carry is where the real wealth is built.',
    loopholeDetails: {
      'Carried Interest': {
        explanation: 'Profit share from fund investments taxed at 20% long-term capital gains rate instead of 37% ordinary income rate. VC partners earn this "carry" on investments they manage, not their own money.',
        example: '$2M/year taxed at 20% instead of 37%. Saves $340K/year in taxes — the single largest legal tax arbitrage in the U.S. tax code.',
      },
      'GRAT Planning': {
        explanation: 'Transfers assets into a Grantor Retained Annuity Trust. Any appreciation above the IRS 7520 hurdle rate passes to heirs completely free of gift and estate tax.',
        example: 'Transfers $5M of fund interests into a GRAT. It appreciates to $8M. The $3M above the hurdle rate passes to heirs tax-free, saving ~$1.2M in estate tax.',
      },
      'Family LP': {
        explanation: 'Transfers assets into a Family Limited Partnership. Minority interests can be transferred to family at a 20-35% valuation discount because recipients lack control and marketability.',
        example: 'Transfers $10M into a Family LP. Minority interests valued at 75% ($7.5M for tax purposes). The $2.5M discount saves ~$1M in gift/estate tax.',
      },
      'Opportunity Zone': {
        explanation: 'Defers carried interest gains by reinvesting into a Qualified Opportunity Zone fund. After 10 years, all OZ appreciation is permanently tax-free.',
        example: 'Defers $1M in carry gains into an OZ fund. Over 10 years, it grows to $2.5M. The $1.5M in OZ appreciation is tax-free — saving ~$300K.',
      },
      'Charitable Stock Donation': {
        explanation: 'Donates appreciated fund shares to a donor-advised fund. Gets full fair-market-value deduction and pays zero capital gains on the donated shares.',
        example: 'Donates $500K in appreciated fund shares. Deducts $500K (~$185K tax benefit) and avoids $100K in capital gains. Total benefit: ~$285K.',
      },
    },
  },
  realEstateInvestor: {
    tagline: 'The Depreciation Machine',
    background: 'Starts at 25 working a day job ($65K/year), saving aggressively for a down payment. At age 28 (year 4), buys their first rental property — $200K equity with 4x leverage ($800K property). Over the next 36 years, builds a portfolio through cash flow, appreciation, and 1031 exchanges.',
    incomeStrategy: 'Pre-acquisition: $65K salary, saving 25% toward first property. Post-acquisition: rental cash flow ($80K+/year) + property appreciation. All income flows through LLCs. The magic: properties appreciate in value while depreciation creates paper losses that reduce taxes.',
    loopholeDetails: {
      '1031 Exchange': {
        explanation: 'Sells an investment property and rolls all proceeds into a "like-kind" replacement property. All capital gains are deferred indefinitely — can be repeated every few years, compounding tax-free.',
        example: 'Sells a $1.5M property with $500K in gains. 1031s into a $2M property. The $500K in gains is deferred — saving $100K in taxes. Repeated 5-6 times over a career, defers $2M+ in total gains.',
      },
      'Depreciation': {
        explanation: 'The IRS allows you to deduct the "wear and tear" on buildings over 27.5 years — even though most properties appreciate in value. Creates paper losses that offset real income.',
        example: 'An $800K building depreciated over 27.5 years = $29K/year in paper losses. At a 24% bracket, saves ~$7K/year in taxes on income that didn\'t actually cost anything.',
      },
      'Section 199A': {
        explanation: 'The qualified business income deduction gives a 20% deduction on net rental income from pass-through entities. Made permanent under OBBBA.',
        example: 'On $100K of net rental income, deducts $20K — saving ~$4,800/year at the 24% bracket. Over 36 years of property ownership, that\'s ~$170K+ in cumulative savings.',
      },
      'Cost Segregation': {
        explanation: 'A cost segregation study reclassifies building components (appliances, carpeting, paving, fixtures) into shorter depreciation schedules (5 or 15 years instead of 27.5).',
        example: 'On an $800K property, reclassifies $200K into 5-year property. Instead of $7K/year in depreciation, front-loads $40K+ in year-one deductions — a massive early tax shield.',
      },
      'Cash-Out Refinance': {
        explanation: 'When property appreciates, refinance to pull out equity as loan proceeds. Debt is not income — so you access your wealth completely tax-free.',
        example: 'Property appreciates from $800K to $1.2M. Refinances and pulls out $250K in equity. Zero taxes on $250K of spendable cash — because it\'s technically a loan.',
      },
      'Installment Sale': {
        explanation: 'Instead of selling a property in one year (triggering a large capital gains hit), structures the sale over 5-10 years. Spreads gains across multiple tax years for a lower effective rate.',
        example: 'Sells a $2M property with $800K in gains over 10 years ($80K/year). Each year stays in a lower bracket. Saves ~$40K-80K vs. recognizing all $800K in one year.',
      },
    },
  },
  inheritor: {
    tagline: 'Born on the Capital Track',
    background: 'Works a modest job ($50K/year) through their 20s. At age 30 (year 6), a parent passes away and they inherit $5M in assets. The inherited portfolio receives a "stepped-up" cost basis — erasing all of the parent\'s unrealized gains. From that point forward, lives entirely off portfolio returns.',
    incomeStrategy: 'Pre-inheritance: $50K salary, modest savings. Post-inheritance: ~$400K/year in investment returns (8% on $5M), withdrawing 3%/year for living expenses. Zero earned income — all wealth comes from capital, taxed at preferential rates.',
    loopholeDetails: {
      'Step-Up Basis': {
        explanation: 'When you inherit assets, the cost basis "steps up" to fair market value at the date of death. All of the prior owner\'s unrealized gains are permanently erased — never taxed by anyone.',
        example: 'Parent bought $1M in stock that grew to $5M over 30 years. The $4M in gains is wiped clean on inheritance. If sold the next day, zero capital gains tax. Tax saved: $800K.',
      },
      'Buy-Borrow-Die': {
        explanation: 'Instead of selling investments (triggering 20% capital gains tax), borrows against the portfolio at low interest rates. Lives off loan proceeds. When they die, heirs get another step-up basis and repay the loan from the estate.',
        example: 'Borrows $150K/year against $5M portfolio at 5% interest ($7,500/year). Avoids $30K/year in capital gains tax. Over 34 years, avoids ~$1M+ in total taxes. Heirs inherit with a fresh step-up.',
      },
      'Dynasty Trust': {
        explanation: 'Places wealth in a trust designed to last for multiple generations (or perpetually in some states). Assets compound outside the estate, bypassing the 40% estate tax at each generational transfer.',
        example: '$5M in a dynasty trust growing at 8% for 3 generations. Without the trust, each generation loses 40% to estate tax. With it: $5M → $50M+ over 80 years, all estate-tax-free.',
      },
      'PPLI': {
        explanation: 'Private Placement Life Insurance — invests inside a custom insurance wrapper. All gains grow tax-free (like a Roth but with no contribution limits). Death benefit passes to heirs income-tax-free.',
        example: 'Places $1M in a PPLI policy. Over 30 years at 8% returns, grows to ~$10M. The $9M in gains is never taxed — saving ~$1.8M in capital gains tax.',
      },
      'Charitable Lead Trust': {
        explanation: 'Creates a Charitable Lead Annuity Trust (CLAT) that pays a fixed amount to charity for a set period. After the term, remaining assets pass to heirs at a deeply discounted gift tax valuation.',
        example: 'Funds a 15-year CLAT with $3M. Pays $150K/year to charity. After 15 years, $4M+ passes to heirs at a gift-tax value of ~$800K. Saves ~$880K in gift/estate tax.',
      },
    },
  },
}

function Sparkline({ snapshots, selectedYear, color }: { snapshots: { wealth: number }[]; selectedYear: number; color: string }) {
  const maxWealth = Math.max(...snapshots.map(s => s.wealth), 1)
  const w = 240
  const h = 60

  const points = snapshots.map((s, i) => {
    const x = (i / (snapshots.length - 1)) * w
    const y = h - (s.wealth / maxWealth) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const selectedX = ((selectedYear - 1) / (snapshots.length - 1)) * w
  const selectedY = h - (snapshots[selectedYear - 1]?.wealth || 0) / maxWealth * (h - 4) - 2

  return (
    <svg width={w} height={h + 10} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* Fill under curve */}
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={color}
        opacity={0.1}
      />
      {/* Selected year marker */}
      <circle cx={selectedX} cy={selectedY} r={4} fill={color} stroke="white" strokeWidth={1.5} />
      <text x={selectedX} y={selectedY - 8} textAnchor="middle" fill="white" fontSize={9} fontWeight={600} fontFamily="Inter, sans-serif">
        {formatWealth(snapshots[selectedYear - 1]?.wealth || 0)}
      </text>
      {/* Year labels */}
      <text x={0} y={h + 10} fill="white" opacity={0.3} fontSize={8} fontFamily="Inter, sans-serif">Age 25</text>
      <text x={w} y={h + 10} textAnchor="end" fill="white" opacity={0.3} fontSize={8} fontFamily="Inter, sans-serif">Age 64</text>
    </svg>
  )
}

export function ArchetypeStoryModal({ archetypeId, selectedYear, onClose }: ArchetypeStoryModalProps) {
  const config = ARCHETYPE_CONFIGS[archetypeId]
  const policy = usePolicyStore()
  const story = ARCHETYPE_STORIES[archetypeId]

  const snapshots = useMemo(() => projectWealth(config, policy), [config, policy])
  const loopholes = useMemo(() => getLoopholeStatus(policy), [policy])
  const avgTaxRate = useMemo(() => getAverageEffectiveTaxRate(snapshots), [snapshots])
  const yearsTo1M = useMemo(() => getYearsToMilestone(snapshots, 1_000_000), [snapshots])

  const currentSnapshot = snapshots[selectedYear - 1]
  const terminalWealth = snapshots[snapshots.length - 1]?.wealth || 0

  // getLoopholeStatus now uses the same keys as config.loopholes
  const activeLoopholes = config.loopholes.filter(l => loopholes[l] ?? false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const trackLabel = config.primaryTrack === 'labor' ? 'Labor Track' : config.primaryTrack === 'capital' ? 'Capital Track' : 'Crossover'
  const trackColor = config.primaryTrack === 'labor' ? '#3b82f6' : config.primaryTrack === 'capital' ? '#10b981' : '#8b5cf6'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${config.name} story`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-[min(340px,calc(100vw-32px))] max-h-[85vh] bg-[#0f172a] border border-white/15 rounded-2xl shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <h2 className="text-base font-bold text-white/90">{config.name}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/80 text-sm transition-colors cursor-pointer"
            >
              &#215;
            </button>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border" style={{
            color: trackColor,
            backgroundColor: `${trackColor}20`,
            borderColor: `${trackColor}30`,
          }}>
            {trackLabel}
          </span>
        </div>

        {/* Story */}
        <div className="px-5 pb-3">
          <p className="text-xs font-semibold text-white/70 italic mb-1">"{story.tagline}"</p>
          <p className="text-[11px] text-white/50 leading-relaxed mb-2">{story.background}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">How They Make Money</p>
          <p className="text-[11px] text-white/50 leading-relaxed">{story.incomeStrategy}</p>
        </div>

        {/* Sparkline */}
        <div className="px-5 pb-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">Wealth Over 40 Years</p>
          <Sparkline snapshots={snapshots} selectedYear={selectedYear} color={config.color} />
        </div>

        {/* Stats grid */}
        <div className="px-5 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <div className="text-[9px] text-white/40 uppercase tracking-wider">Current (Year {selectedYear})</div>
              <div className="text-sm font-bold text-white/90 tabular-nums">{formatWealth(currentSnapshot?.wealth || 0)}</div>
              <div className="text-[9px] text-white/30">Age {24 + selectedYear}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <div className="text-[9px] text-white/40 uppercase tracking-wider">At Retirement</div>
              <div className="text-sm font-bold text-white/90 tabular-nums">{formatWealth(terminalWealth)}</div>
              <div className="text-[9px] text-white/30">Age 64</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <div className="text-[9px] text-white/40 uppercase tracking-wider">Avg Tax Rate</div>
              <div className="text-sm font-bold tabular-nums" style={{ color: trackColor }}>{(avgTaxRate * 100).toFixed(1)}%</div>
              <div className="text-[9px] text-white/30">over career</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <div className="text-[9px] text-white/40 uppercase tracking-wider">Years to $1M</div>
              <div className="text-sm font-bold text-white/90 tabular-nums">{yearsTo1M !== null ? `${yearsTo1M} yrs` : '40+'}</div>
              <div className="text-[9px] text-white/30">{yearsTo1M ? `Age ${24 + yearsTo1M}` : 'not reached'}</div>
            </div>
          </div>
        </div>

        {/* Year snapshot */}
        {currentSnapshot && (
          <div className="px-5 pb-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">Year {selectedYear} Breakdown</p>
            <div className="space-y-1 text-[11px]">
              {currentSnapshot.laborIncome > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Labor Income</span>
                  <span className="text-white/70 tabular-nums">{formatWealth(currentSnapshot.laborIncome)}</span>
                </div>
              )}
              {currentSnapshot.capitalGains > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Capital Gains</span>
                  <span className="text-white/70 tabular-nums">{formatWealth(currentSnapshot.capitalGains)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Total Tax</span>
                <span className="text-red-400/70 tabular-nums">-{formatWealth(currentSnapshot.totalTax)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1">
                <span className="text-white/50 font-medium">Effective Rate</span>
                <span className="text-white/80 font-semibold tabular-nums">{(currentSnapshot.effectiveTaxRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Loopholes — expanded with explanations and examples */}
        <div className="px-5 pb-5">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">
            Tax Loopholes ({activeLoopholes.length}/{config.loopholes.length} open)
          </p>
          {config.loopholes.length === 0 ? (
            <p className="text-[11px] text-white/30 italic">No loopholes available — pays full rate on all income</p>
          ) : (
            <div className="space-y-2.5">
              {config.loopholes.map((l) => {
                const isOpen = activeLoopholes.includes(l)
                const detail = story.loopholeDetails[l]
                return (
                  <div key={l} className={`rounded-lg border p-2.5 ${isOpen ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/10'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOpen ? 'bg-emerald-400' : 'bg-red-400/60'}`} />
                      <span className={`text-[11px] font-semibold ${isOpen ? 'text-white/70' : 'text-white/30 line-through'}`}>{l}</span>
                      <span className={`text-[9px] ml-auto ${isOpen ? 'text-emerald-400/70' : 'text-red-400/50'}`}>{isOpen ? 'OPEN' : 'CLOSED'}</span>
                    </div>
                    {detail && (
                      <>
                        <p className="text-[10px] text-white/40 leading-relaxed mb-1">{detail.explanation}</p>
                        <p className="text-[10px] leading-relaxed" style={{ color: isOpen ? '#34d399' : '#94a3b8' }}>
                          <span className="font-semibold">Example: </span>{detail.example}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
