export type ArchetypeId = 'w2worker' | 'highEarner' | 'techFounder' | 'vcPartner' | 'realEstateInvestor' | 'inheritor'

export type TrackType = 'labor' | 'capital' | 'crossover'

export interface ArchetypeConfig {
  id: ArchetypeId
  name: string
  shortName: string
  description: string
  color: string
  startingWealth: number
  primaryTrack: TrackType
  loopholes: string[]
  annualIncome: number
  incomeGrowthRate: number
  savingsRate: number
  investmentReturn: number
  // Special events
  exitYear?: number        // Year of liquidity event (tech founder)
  exitAmount?: number      // Amount from exit
  leverageRatio?: number   // For real estate
  propertyAppreciation?: number
  cashFlowIncome?: number
  carriedInterest?: number // Annual carried interest
  managementFees?: number  // Annual management fees
  withdrawalRate?: number  // For inheritor
  // Ramp-up / life events
  partnerYear?: number               // VC: year they make partner
  propertyAcquisitionYear?: number   // RE: year they buy first property
  initialEquity?: number             // RE: down payment for first property
  inheritanceYear?: number           // Inheritor: year they receive inheritance
  inheritanceAmount?: number         // Inheritor: amount inherited
}

export const ARCHETYPE_CONFIGS: Record<ArchetypeId, ArchetypeConfig> = {
  w2worker: {
    id: 'w2worker',
    name: 'W-2 Worker',
    shortName: 'W-2',
    description: '$75K salary, pure labor track, median earner',
    color: '#3b82f6',
    startingWealth: 0,
    primaryTrack: 'labor',
    loopholes: ['401(k) Deferral', 'HSA'],
    annualIncome: 75_000,
    incomeGrowthRate: 0.02,
    savingsRate: 0.15,
    investmentReturn: 0.07,
  },
  highEarner: {
    id: 'highEarner',
    name: 'High Earner',
    shortName: 'High-W2',
    description: '$300K salary, top bracket, some investment income',
    color: '#6366f1',
    startingWealth: 0,
    primaryTrack: 'labor',
    loopholes: ['Backdoor Roth', 'Deferred Compensation', 'Charitable Giving'],
    annualIncome: 300_000,
    incomeGrowthRate: 0.03,
    savingsRate: 0.25,
    investmentReturn: 0.07,
  },
  techFounder: {
    id: 'techFounder',
    name: 'Tech Founder',
    shortName: 'Founder',
    description: 'Starts at $120K salary, exits at year 7 with $20M in stock',
    color: '#8b5cf6',
    startingWealth: 0,
    primaryTrack: 'crossover',
    loopholes: ['QSBS Exclusion', 'Buy-Borrow-Die', '83(b) Election', 'Opportunity Zone', 'Charitable Stock Donation'],
    annualIncome: 120_000,
    incomeGrowthRate: 0.02,
    savingsRate: 0.10,
    investmentReturn: 0.10,
    exitYear: 7,
    exitAmount: 20_000_000,
  },
  vcPartner: {
    id: 'vcPartner',
    name: 'VC Partner',
    shortName: 'VC',
    description: 'Starts as analyst at $120K. Makes partner at 29 — $500K fees + $2M/yr carry',
    color: '#14b8a6',
    startingWealth: 0,
    primaryTrack: 'capital',
    loopholes: ['Carried Interest', 'GRAT Planning', 'Family LP', 'Opportunity Zone', 'Charitable Stock Donation'],
    annualIncome: 120_000,
    incomeGrowthRate: 0.03,
    savingsRate: 0.30,
    investmentReturn: 0.12,
    carriedInterest: 2_000_000,
    managementFees: 500_000,
    partnerYear: 5,
  },
  realEstateInvestor: {
    id: 'realEstateInvestor',
    name: 'Real Estate Investor',
    shortName: 'RE Inv.',
    description: 'Works a day job, buys first property at 28 with $200K equity. Builds portfolio via 1031s',
    color: '#10b981',
    startingWealth: 0,
    primaryTrack: 'capital',
    loopholes: ['1031 Exchange', 'Depreciation', 'Section 199A', 'Cost Segregation', 'Cash-Out Refinance', 'Installment Sale'],
    annualIncome: 65_000,
    incomeGrowthRate: 0.02,
    savingsRate: 0.25,
    investmentReturn: 0.05,
    leverageRatio: 4,
    propertyAppreciation: 0.05,
    cashFlowIncome: 80_000,
    propertyAcquisitionYear: 4,
    initialEquity: 200_000,
  },
  inheritor: {
    id: 'inheritor',
    name: 'Inheritor',
    shortName: 'Inherit.',
    description: 'Works a modest job until 30, then inherits $5M. Lives off portfolio returns',
    color: '#059669',
    startingWealth: 0,
    primaryTrack: 'capital',
    loopholes: ['Step-Up Basis', 'Buy-Borrow-Die', 'Dynasty Trust', 'PPLI', 'Charitable Lead Trust'],
    annualIncome: 50_000,
    incomeGrowthRate: 0.02,
    savingsRate: 0.15,
    investmentReturn: 0.08,
    withdrawalRate: 0.03,
    inheritanceYear: 6,
    inheritanceAmount: 5_000_000,
  },
}

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  'w2worker',
  'highEarner',
  'techFounder',
  'vcPartner',
  'realEstateInvestor',
  'inheritor',
]
