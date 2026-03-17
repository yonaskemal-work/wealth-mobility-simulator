import type { PolicyState } from './policyState'
import { type ArchetypeConfig, type ArchetypeId } from '../data/archetypeConfigs'
import {
  calculateFederalIncomeTax,
  calculateFICA,
  calculateStateTax,
  calculateEffectiveCapitalTaxRate,
} from './taxCalculator'

export interface YearlySnapshot {
  year: number
  age: number
  laborIncome: number
  capitalGains: number
  totalPreTaxIncome: number
  laborTax: number
  capitalTax: number
  totalTax: number
  effectiveTaxRate: number
  netIncome: number
  savings: number
  wealth: number
  track: 'labor' | 'capital' | 'crossover'
}

export function projectWealth(
  config: ArchetypeConfig,
  policy: PolicyState,
  years: number = 40,
): YearlySnapshot[] {
  const snapshots: YearlySnapshot[] = []
  let wealth = config.startingWealth + policy.babyBondAmount
  const startAge = 25

  // Trump Account: add government contribution at birth (simplified as initial wealth boost)
  if (policy.trumpAccountContribution > 0 && config.startingWealth === 0) {
    wealth += policy.trumpAccountContribution
  }

  for (let year = 1; year <= years; year++) {
    const age = startAge + year - 1
    let laborIncome = 0
    let capitalGains = 0
    let track: 'labor' | 'capital' | 'crossover' = config.primaryTrack === 'crossover' ? 'labor' : config.primaryTrack

    // --- Calculate income by archetype ---
    switch (config.id) {
      case 'w2worker': {
        laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
        capitalGains = wealth * config.investmentReturn
        track = 'labor'
        break
      }

      case 'highEarner': {
        laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
        capitalGains = wealth * config.investmentReturn
        track = laborIncome > capitalGains ? 'labor' : 'capital'
        break
      }

      case 'techFounder': {
        if (config.exitYear && year < config.exitYear) {
          // Pre-exit: earning salary + small investment returns
          laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
          capitalGains = wealth * config.investmentReturn
          track = 'labor'
        } else if (config.exitYear && year === config.exitYear) {
          // Exit year: salary + investment returns + exit proceeds
          laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
          capitalGains = (config.exitAmount || 0) + wealth * config.investmentReturn
          track = 'crossover'
        } else {
          // Post-exit: living off capital
          capitalGains = wealth * config.investmentReturn
          track = 'capital'
        }
        break
      }

      case 'vcPartner': {
        const partnerYear = config.partnerYear || 1
        if (year < partnerYear) {
          // Pre-partner: working as analyst/associate in venture capital
          laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
          capitalGains = wealth > 0 ? wealth * config.investmentReturn : 0
          track = 'labor'
        } else {
          // Post-partner: management fees + carried interest
          const yearsAsPartner = year - partnerYear
          laborIncome = (config.managementFees || 0) * Math.pow(1 + config.incomeGrowthRate, yearsAsPartner)
          capitalGains = (config.carriedInterest || 0) * Math.pow(1 + config.incomeGrowthRate, yearsAsPartner)
          capitalGains += wealth * config.investmentReturn
          track = 'capital'
        }
        break
      }

      case 'realEstateInvestor': {
        const acqYear = config.propertyAcquisitionYear || 1
        if (year < acqYear) {
          // Pre-acquisition: working a day job, saving for down payment
          laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
          capitalGains = wealth > 0 ? wealth * 0.05 : 0
          track = 'labor'
        } else {
          // Post-acquisition: property income
          const yearsOwned = year - acqYear
          const equity = config.initialEquity || 200_000
          const propertyValue = equity * (config.leverageRatio || 4) *
            Math.pow(1 + (config.propertyAppreciation || 0.05), yearsOwned)
          capitalGains = propertyValue * (config.propertyAppreciation || 0.05)
          laborIncome = 0
          const cashFlow = (config.cashFlowIncome || 0) * Math.pow(1.02, yearsOwned)
          capitalGains += cashFlow
          track = 'capital'
        }
        break
      }

      case 'inheritor': {
        const inhYear = config.inheritanceYear || 1
        // Add inheritance at the start of the inheritance year
        if (year === inhYear && config.inheritanceAmount) {
          wealth += config.inheritanceAmount
        }
        if (year < inhYear) {
          // Pre-inheritance: working a modest job
          laborIncome = config.annualIncome * Math.pow(1 + config.incomeGrowthRate, year - 1)
          capitalGains = wealth > 0 ? wealth * 0.05 : 0
          track = 'labor'
        } else {
          // Post-inheritance: living off portfolio
          capitalGains = wealth * config.investmentReturn
          const withdrawal = wealth * (config.withdrawalRate || 0.03)
          capitalGains -= withdrawal
          track = 'capital'
        }
        break
      }
    }

    // --- Calculate deductions for OBBBA ---
    const deductions: { tips?: number; overtime?: number; seniorBonus?: number; archetypeId?: ArchetypeId } = {
      archetypeId: config.id,
    }

    // Tips deduction: W-2 workers in service industry (simplified: 15% of income for W-2)
    if (config.id === 'w2worker' && laborIncome > 0) {
      deductions.tips = laborIncome * 0.15
    }

    // Overtime deduction: workers earning hourly (simplified: 10% of income for W-2/high earner)
    if ((config.id === 'w2worker' || config.id === 'highEarner') && laborIncome > 0) {
      deductions.overtime = laborIncome * 0.10
    }

    // Senior bonus deduction for 65+
    if (age >= 65 && laborIncome > 0) {
      deductions.seniorBonus = policy.seniorBonusDeduction
    }

    // --- Calculate taxes ---
    let federalIncomeTax = laborIncome > 0
      ? calculateFederalIncomeTax(laborIncome, policy, deductions)
      : 0

    // Apply child tax credit — only for workers with income below $200K phase-out
    // CTC phases out at $50 per $1,000 over $200K (single filer)
    if (policy.childTaxCredit > 0 && laborIncome > 0 && laborIncome < 200_000) {
      federalIncomeTax = Math.max(0, federalIncomeTax - policy.childTaxCredit)
    }

    const laborTax = laborIncome > 0
      ? federalIncomeTax +
        calculateFICA(laborIncome, policy) +
        calculateStateTax(laborIncome, policy)
      : 0

    const effectiveCapRate = calculateEffectiveCapitalTaxRate(
      capitalGains,
      config.id as ArchetypeId,
      policy,
      config,
      year,
      wealth,
    )
    const capitalTax = Math.max(0, capitalGains * effectiveCapRate)

    const totalTax = laborTax + capitalTax
    const totalPreTaxIncome = laborIncome + Math.max(0, capitalGains)
    const effectiveTaxRate = totalPreTaxIncome > 0 ? totalTax / totalPreTaxIncome : 0

    // --- Calculate savings and wealth accumulation ---
    const netLaborIncome = laborIncome - laborTax
    const netCapitalGains = capitalGains - capitalTax

    let savings = 0
    switch (config.id) {
      case 'w2worker':
      case 'highEarner':
        savings = netLaborIncome * config.savingsRate
        wealth += savings + netCapitalGains
        break

      case 'techFounder':
        if (config.exitYear && year < config.exitYear) {
          savings = netLaborIncome * config.savingsRate
          wealth += savings + netCapitalGains
        } else if (config.exitYear && year === config.exitYear) {
          // Exit year: save salary portion + all capital (exit proceeds)
          savings = netLaborIncome * config.savingsRate
          wealth += savings + netCapitalGains
        } else {
          // Post-exit: living off capital returns
          wealth += netCapitalGains
        }
        break

      case 'vcPartner':
        if (config.partnerYear && year < config.partnerYear) {
          // Pre-partner: save like a worker
          savings = netLaborIncome * config.savingsRate
          wealth += savings + netCapitalGains
        } else {
          savings = (netLaborIncome + netCapitalGains) * config.savingsRate
          wealth += savings + netCapitalGains * (1 - config.savingsRate)
        }
        break

      case 'realEstateInvestor':
        if (config.propertyAcquisitionYear && year < config.propertyAcquisitionYear) {
          // Pre-acquisition: save from day job toward down payment
          savings = netLaborIncome * config.savingsRate
          wealth += savings + netCapitalGains
        } else {
          wealth += netCapitalGains
        }
        break

      case 'inheritor':
        if (config.inheritanceYear && year < config.inheritanceYear) {
          // Pre-inheritance: save from modest job
          savings = netLaborIncome * (config.savingsRate || 0.15)
          wealth += savings + netCapitalGains
        } else {
          wealth += netCapitalGains
        }
        break
    }

    wealth = Math.max(0, wealth)

    snapshots.push({
      year,
      age,
      laborIncome,
      capitalGains: Math.max(0, capitalGains),
      totalPreTaxIncome,
      laborTax,
      capitalTax,
      totalTax,
      effectiveTaxRate,
      netIncome: netLaborIncome + netCapitalGains,
      savings,
      wealth,
      track,
    })
  }

  return snapshots
}

export function getYearsToMilestone(snapshots: YearlySnapshot[], milestone: number): number | null {
  const snapshot = snapshots.find(s => s.wealth >= milestone)
  return snapshot ? snapshot.year : null
}

export function getTerminalWealth(snapshots: YearlySnapshot[]): number {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1].wealth : 0
}

export function getAverageEffectiveTaxRate(snapshots: YearlySnapshot[]): number {
  const withIncome = snapshots.filter(s => s.totalPreTaxIncome > 0)
  if (withIncome.length === 0) return 0
  const totalTax = withIncome.reduce((sum, s) => sum + s.totalTax, 0)
  const totalIncome = withIncome.reduce((sum, s) => sum + s.totalPreTaxIncome, 0)
  return totalIncome > 0 ? totalTax / totalIncome : 0
}
