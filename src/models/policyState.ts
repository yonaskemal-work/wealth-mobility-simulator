import { create } from 'zustand'

export interface TaxBracket {
  threshold: number
  rate: number
}

export interface PolicyState {
  // Labor taxes
  incomeTaxBrackets: TaxBracket[]
  zeroTaxThreshold: number
  ficaRate: number
  stateIncomeTaxRate: number

  // Capital taxes
  ltcgRate: number
  carriedInterestAsOrdinary: boolean
  stepUpBasisEnabled: boolean
  exchange1031Cap: number | null // null = unlimited
  qsbsExclusionCap: number
  marginLoanCap: number | null // null = unlimited
  section199AEnabled: boolean
  depreciationEnabled: boolean

  // Worker tax shelters
  retirementTaxBreaks: boolean     // 401(k), HSA — reduces taxable income for workers
  rothConversionEnabled: boolean   // Backdoor Roth — tax-free growth
  deferredCompEnabled: boolean     // Deferred compensation for high earners

  // Founder/investor strategies
  election83bEnabled: boolean      // 83(b) election for founders
  opportunityZoneEnabled: boolean  // OZ deferral/reduction for founders + VCs

  // Trust & estate strategies
  gratEnabled: boolean             // GRAT planning
  familyLPEnabled: boolean         // Family LP discounting
  dynastyTrustEnabled: boolean     // Multi-generation wealth transfer
  charitableLeadTrustEnabled: boolean // CLAT for inheritors

  // Advanced strategies
  charitableStrategies: boolean    // Charitable stock donation / giving
  advancedREStrategies: boolean    // Cost segregation, cash-out refi, installment sales
  ppliEnabled: boolean             // Private placement life insurance

  // Labor accelerators
  esopThreshold: number | null // null = none
  minimumWage: number
  babyBondAmount: number

  // OBBBA provisions (One Big Beautiful Bill Act 2025)
  noTaxOnTips: number          // max annual deduction (0 = off, 25000 = full)
  noTaxOnOvertime: number      // max annual deduction (0 = off, 25000 = full)
  saltCap: number              // SALT deduction cap (10000-100000)
  childTaxCredit: number       // per-child credit amount
  trumpAccountContribution: number // annual newborn savings contribution
  seniorBonusDeduction: number // additional deduction for 65+
  bonusDepreciationRate: number // 0-1.0 (100% = full expensing)
}

export interface PolicyStore extends PolicyState {
  setPolicy: (partial: Partial<PolicyState>) => void
  setBracketRate: (index: number, rate: number) => void
  loadPreset: (preset: PolicyState) => void
}

export const DEFAULT_BRACKETS: TaxBracket[] = [
  { threshold: 0, rate: 0.10 },
  { threshold: 11600, rate: 0.12 },
  { threshold: 47150, rate: 0.22 },
  { threshold: 100525, rate: 0.24 },
  { threshold: 191950, rate: 0.32 },
  { threshold: 243725, rate: 0.35 },
  { threshold: 609350, rate: 0.37 },
]

// Current law reflecting OBBBA (signed July 4, 2025)
// zeroTaxThreshold = standard deduction ($14,600 single filer 2024)
export const CURRENT_LAW: PolicyState = {
  incomeTaxBrackets: DEFAULT_BRACKETS,
  zeroTaxThreshold: 14_600,
  ficaRate: 0.0765,
  stateIncomeTaxRate: 0.05,
  ltcgRate: 0.20,
  carriedInterestAsOrdinary: false,
  stepUpBasisEnabled: true,
  exchange1031Cap: null,
  qsbsExclusionCap: 15_000_000, // Raised from $10M under OBBBA
  marginLoanCap: null,
  section199AEnabled: true, // Made permanent under OBBBA
  depreciationEnabled: true,
  // Worker tax shelters — all legal and widely used
  retirementTaxBreaks: true,
  rothConversionEnabled: true,
  deferredCompEnabled: true,
  // Founder/investor strategies
  election83bEnabled: true,
  opportunityZoneEnabled: true,
  // Trust & estate strategies
  gratEnabled: true,
  familyLPEnabled: true,
  dynastyTrustEnabled: true,
  charitableLeadTrustEnabled: true,
  // Advanced strategies
  charitableStrategies: true,
  advancedREStrategies: true,
  ppliEnabled: true,

  esopThreshold: null,
  minimumWage: 7.25,
  babyBondAmount: 0,
  // OBBBA provisions
  noTaxOnTips: 25_000,
  noTaxOnOvertime: 25_000,
  saltCap: 40_000, // Raised from $10K under OBBBA
  childTaxCredit: 2_200, // Permanent at $2,200 under OBBBA
  trumpAccountContribution: 1_000, // $1K government contribution for newborns
  seniorBonusDeduction: 6_000, // Additional deduction for 65+
  bonusDepreciationRate: 1.0, // 100% restored permanently under OBBBA
}

export const usePolicyStore = create<PolicyStore>((set) => ({
  ...CURRENT_LAW,
  setPolicy: (partial) => set(partial),
  setBracketRate: (index, rate) =>
    set((state) => {
      const brackets = [...state.incomeTaxBrackets]
      brackets[index] = { ...brackets[index], rate }
      return { incomeTaxBrackets: brackets }
    }),
  loadPreset: (preset) => set(preset),
}))
