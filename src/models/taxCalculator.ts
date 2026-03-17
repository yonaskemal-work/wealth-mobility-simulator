import type { PolicyState } from './policyState'
import { type ArchetypeConfig, type ArchetypeId } from '../data/archetypeConfigs'

const SS_WAGE_BASE = 168_600 // 2024 Social Security wage base
const SS_RATE = 0.062
const MEDICARE_RATE = 0.0145
const MEDICARE_SURTAX_THRESHOLD = 200_000
const MEDICARE_SURTAX_RATE = 0.009

export function calculateFederalIncomeTax(
  income: number,
  policy: PolicyState,
  deductions: { tips?: number; overtime?: number; seniorBonus?: number; archetypeId?: ArchetypeId } = {},
): number {
  if (income <= 0) return 0

  // Apply zero-tax threshold
  let taxableIncome = Math.max(0, income - policy.zeroTaxThreshold)

  // Apply OBBBA deductions
  if (deductions.tips && policy.noTaxOnTips > 0) {
    taxableIncome -= Math.min(deductions.tips, policy.noTaxOnTips)
  }
  if (deductions.overtime && policy.noTaxOnOvertime > 0) {
    taxableIncome -= Math.min(deductions.overtime, policy.noTaxOnOvertime)
  }
  if (deductions.seniorBonus && policy.seniorBonusDeduction > 0) {
    taxableIncome -= Math.min(deductions.seniorBonus, policy.seniorBonusDeduction)
  }

  // 401(k) + HSA tax deferral (W-2 workers and high earners)
  if (policy.retirementTaxBreaks && (deductions.archetypeId === 'w2worker' || deductions.archetypeId === 'highEarner')) {
    taxableIncome -= Math.min(income, 23_000) // 401(k) contribution limit
    if (deductions.archetypeId === 'w2worker') {
      taxableIncome -= Math.min(income * 0.02, 4_150) // HSA contribution
    }
  }

  // Deferred compensation (high earners defer up to 40% of income)
  if (policy.deferredCompEnabled && deductions.archetypeId === 'highEarner') {
    taxableIncome *= 0.60 // 40% deferred to future years
  }

  // Charitable giving deduction (high earners — up to 8% of AGI)
  if (policy.charitableStrategies && deductions.archetypeId === 'highEarner') {
    taxableIncome -= taxableIncome * 0.08
  }

  taxableIncome = Math.max(0, taxableIncome)
  if (taxableIncome <= 0) return 0

  let tax = 0
  const brackets = policy.incomeTaxBrackets

  for (let i = 0; i < brackets.length; i++) {
    const bracketStart = i === 0 ? 0 : brackets[i].threshold
    const bracketEnd = i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity
    const bracketRate = brackets[i].rate

    if (taxableIncome <= bracketStart) break

    const taxableInBracket = Math.min(taxableIncome, bracketEnd) - bracketStart
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracketRate
    }
  }

  // Note: Child tax credit is applied in wealthProjection.ts (income-dependent phase-out)
  return tax
}

export function calculateFICA(income: number, policy: PolicyState): number {
  if (income <= 0) return 0

  const ficaMultiplier = policy.ficaRate / 0.0765

  const ssIncome = Math.min(income, SS_WAGE_BASE)
  const ss = ssIncome * SS_RATE * ficaMultiplier

  let medicare = income * MEDICARE_RATE * ficaMultiplier

  if (income > MEDICARE_SURTAX_THRESHOLD) {
    medicare += (income - MEDICARE_SURTAX_THRESHOLD) * MEDICARE_SURTAX_RATE * ficaMultiplier
  }

  return ss + medicare
}

export function calculateStateTax(income: number, policy: PolicyState): number {
  return Math.max(0, income) * policy.stateIncomeTaxRate
}

export function calculateEffectiveLaborTaxRate(income: number, policy: PolicyState): number {
  if (income <= 0) return 0

  const federalTax = calculateFederalIncomeTax(income, policy)
  const fica = calculateFICA(income, policy)
  const stateTax = calculateStateTax(income, policy)
  const totalTax = federalTax + fica + stateTax

  return totalTax / income
}

export function calculateEffectiveCapitalTaxRate(
  gains: number,
  archetypeId: ArchetypeId,
  policy: PolicyState,
  config: ArchetypeConfig,
  year: number = 1,
  totalWealth: number = 0,
): number {
  if (gains <= 0) return 0

  let taxableGains = gains
  let effectiveRate = policy.ltcgRate

  // --- Loophole adjustments ---

  // QSBS Exclusion (tech founders, year of exit)
  // OBBBA: $15M cap, graduated exclusion (3yr/50%, 4yr/75%, 5yr/100%)
  if (archetypeId === 'techFounder' && config.exitYear && year === config.exitYear) {
    // Assume 5+ year holding for full exclusion
    const exclusion = Math.min(taxableGains, policy.qsbsExclusionCap)
    taxableGains = Math.max(0, taxableGains - exclusion)
  }

  // Carried interest treatment (only applies after making partner)
  const partnerYear = config.partnerYear || 1
  if (archetypeId === 'vcPartner' && config.carriedInterest && year >= partnerYear) {
    if (policy.carriedInterestAsOrdinary) {
      const yearsAsPartner = year - partnerYear
      const currentCarry = (config.carriedInterest || 0) * Math.pow(1 + (config.incomeGrowthRate || 0.03), yearsAsPartner)
      const currentFees = (config.managementFees || 0) * Math.pow(1 + (config.incomeGrowthRate || 0.03), yearsAsPartner)
      const carryPortion = Math.min(currentCarry, gains)
      const carryTax = calculateFederalIncomeTax(carryPortion + currentFees, policy) -
                        calculateFederalIncomeTax(currentFees, policy)
      const remainderTax = Math.max(0, taxableGains - carryPortion) * policy.ltcgRate
      const totalTax = carryTax + remainderTax
      return gains > 0 ? totalTax / gains : 0
    }
  }

  // 1031 Exchange (real estate — defers all gains)
  if (archetypeId === 'realEstateInvestor' && policy.exchange1031Cap !== 0) {
    if (policy.exchange1031Cap === null) {
      return 0
    } else {
      const deferred = Math.min(taxableGains, policy.exchange1031Cap)
      taxableGains = Math.max(0, taxableGains - deferred)
    }
  }

  // Depreciation (real estate — offsets income)
  if (archetypeId === 'realEstateInvestor' && policy.depreciationEnabled) {
    // Bonus depreciation rate affects how much can be written off
    const depreciationMultiplier = policy.bonusDepreciationRate > 0
      ? 0.3 + 0.2 * policy.bonusDepreciationRate // 30-50% write-off based on bonus rate
      : 0.3 // Base depreciation without bonus
    taxableGains = taxableGains * (1 - depreciationMultiplier)
  }

  // Section 199A deduction (real estate / pass-through)
  if (archetypeId === 'realEstateInvestor' && policy.section199AEnabled) {
    taxableGains = taxableGains * 0.80 // 20% deduction
  }

  // Buy-Borrow-Die (inheritor, tech founder post-exit)
  if (
    (archetypeId === 'inheritor' || (archetypeId === 'techFounder' && config.exitYear && year > config.exitYear))
  ) {
    if (policy.marginLoanCap === null) {
      if (policy.stepUpBasisEnabled) {
        return 0 // Full buy-borrow-die: no tax ever
      } else {
        effectiveRate = effectiveRate * 0.3
      }
    } else if (policy.marginLoanCap !== null && policy.marginLoanCap > 0) {
      const deferralRatio = Math.min(1, (policy.marginLoanCap * totalWealth) / (gains || 1))
      if (policy.stepUpBasisEnabled) {
        effectiveRate = effectiveRate * (1 - deferralRatio)
      } else {
        effectiveRate = effectiveRate * (1 - deferralRatio * 0.7)
      }
    }
  }

  // Step-up basis general benefit (inheritor receives stepped-up basis at inheritance)
  // In the inheritance year, gains from the inherited portfolio are tax-free due to basis reset
  if (archetypeId === 'inheritor' && policy.stepUpBasisEnabled) {
    const inhYear = config.inheritanceYear || 1
    if (year === inhYear) {
      return 0
    }
  }

  // --- New loopholes ---

  // Backdoor Roth (High Earner — portion of gains grow tax-free in Roth accounts)
  if (policy.rothConversionEnabled && archetypeId === 'highEarner') {
    taxableGains *= 0.85 // ~15% of portfolio in tax-free Roth accounts
  }

  // 83(b) Election (tech founder — established early basis reduces exit tax)
  if (policy.election83bEnabled && archetypeId === 'techFounder' && config.exitYear && year === config.exitYear) {
    taxableGains *= 0.70 // 30% reduction from early basis establishment
  }

  // Opportunity Zone deferral (tech founder, VC — defer + reduce gains)
  if (policy.opportunityZoneEnabled && (archetypeId === 'techFounder' || archetypeId === 'vcPartner')) {
    taxableGains *= 0.85 // ~15% reduction from OZ basis step-up + deferral
  }

  // GRAT Planning (VC, inheritor — appreciation above hurdle rate transfers tax-free)
  if (policy.gratEnabled && (archetypeId === 'vcPartner' || archetypeId === 'inheritor')) {
    effectiveRate *= 0.75 // 25% reduction — appreciation above IRS 7520 rate escapes tax
  }

  // Family LP Discounting (VC — transfer at 25% valuation discount)
  if (policy.familyLPEnabled && archetypeId === 'vcPartner') {
    effectiveRate *= 0.80 // 20% discount on transferred assets
  }

  // Charitable Stock Donation (tech founder, VC, high earner — donate appreciated stock)
  if (policy.charitableStrategies && (archetypeId === 'techFounder' || archetypeId === 'vcPartner' || archetypeId === 'highEarner')) {
    taxableGains *= 0.90 // ~10% donated at FMV, avoiding cap gains entirely
  }

  // Cost Segregation (RE investor — accelerated depreciation on components)
  if (policy.advancedREStrategies && archetypeId === 'realEstateInvestor' && policy.depreciationEnabled) {
    taxableGains *= 0.85 // Additional 15% front-loaded deductions from cost seg study
  }

  // Cash-Out Refinance (RE investor — access equity tax-free via new debt)
  if (policy.advancedREStrategies && archetypeId === 'realEstateInvestor') {
    effectiveRate *= 0.85 // 15% of gains effectively untaxed (accessed as debt proceeds)
  }

  // Installment Sale (RE investor — spread gains over years for lower effective rate)
  if (policy.advancedREStrategies && archetypeId === 'realEstateInvestor') {
    effectiveRate *= 0.90 // 10% reduction from income-averaging across years
  }

  // Dynasty Trust (inheritor — wealth compounds across generations, bypasses estate tax)
  if (policy.dynastyTrustEnabled && archetypeId === 'inheritor') {
    effectiveRate *= 0.80 // 20% reduction — trust shields from estate/generation-skipping tax
  }

  // PPLI (inheritor — invest inside insurance wrapper, grows tax-free)
  if (policy.ppliEnabled && archetypeId === 'inheritor') {
    taxableGains *= 0.80 // 20% of portfolio in PPLI grows tax-free
  }

  // Charitable Lead Trust (inheritor — transfer assets at reduced gift/estate tax)
  if (policy.charitableLeadTrustEnabled && archetypeId === 'inheritor') {
    effectiveRate *= 0.90 // 10% reduction from CLAT charitable annuity stream
  }

  return taxableGains > 0 ? (taxableGains * effectiveRate) / gains : 0
}

export function countOpenLoopholes(policy: PolicyState): number {
  const status = getLoopholeStatus(policy)
  return Object.values(status).filter(Boolean).length
}

export function getLoopholeStatus(policy: PolicyState): Record<string, boolean> {
  return {
    // Original loopholes
    'Carried Interest': !policy.carriedInterestAsOrdinary,
    'Step-Up Basis': policy.stepUpBasisEnabled,
    '1031 Exchange': policy.exchange1031Cap === null || (policy.exchange1031Cap !== null && policy.exchange1031Cap > 0),
    'QSBS Exclusion': policy.qsbsExclusionCap > 0,
    'Buy-Borrow-Die': policy.marginLoanCap === null || (policy.marginLoanCap !== null && policy.marginLoanCap > 0),
    'Section 199A': policy.section199AEnabled,
    'Depreciation': policy.depreciationEnabled,
    // Worker tax shelters
    '401(k) Deferral': policy.retirementTaxBreaks,
    'HSA': policy.retirementTaxBreaks,
    'Backdoor Roth': policy.rothConversionEnabled,
    'Deferred Compensation': policy.deferredCompEnabled,
    'Charitable Giving': policy.charitableStrategies,
    // Founder/investor strategies
    '83(b) Election': policy.election83bEnabled,
    'Opportunity Zone': policy.opportunityZoneEnabled,
    'Charitable Stock Donation': policy.charitableStrategies,
    // Trust & estate strategies
    'GRAT Planning': policy.gratEnabled,
    'Family LP': policy.familyLPEnabled,
    'Dynasty Trust': policy.dynastyTrustEnabled,
    'PPLI': policy.ppliEnabled,
    'Charitable Lead Trust': policy.charitableLeadTrustEnabled,
    // Advanced RE strategies
    'Cost Segregation': policy.advancedREStrategies,
    'Cash-Out Refinance': policy.advancedREStrategies,
    'Installment Sale': policy.advancedREStrategies,
  }
}
