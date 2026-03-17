import { usePolicyStore } from '../../models/policyState'
import { Slider } from '../shared/Slider'

export function ReformControls() {
  const policy = usePolicyStore()

  return (
    <div>
      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Big Beautiful Bill Provisions
      </h3>
      <p className="text-[10px] text-white/30 mb-4">
        New tax breaks signed into law July 4, 2025
      </p>

      <Slider
        label="No Tax on Tips"
        helpText="Workers who earn tips can deduct up to this amount from taxable income. Helps servers, bartenders, and delivery workers."
        value={policy.noTaxOnTips}
        min={0}
        max={50_000}
        step={1000}
        format={(v) => v === 0 ? 'Off' : `$${(v / 1000).toFixed(0)}K`}
        onChange={(v) => policy.setPolicy({ noTaxOnTips: v })}
        color="#f59e0b"
      />

      <Slider
        label="No Tax on Overtime"
        helpText="Overtime pay excluded from income tax. Helps hourly workers who work extra hours."
        value={policy.noTaxOnOvertime}
        min={0}
        max={50_000}
        step={1000}
        format={(v) => v === 0 ? 'Off' : `$${(v / 1000).toFixed(0)}K`}
        onChange={(v) => policy.setPolicy({ noTaxOnOvertime: v })}
        color="#f59e0b"
      />

      <Slider
        label="SALT Deduction Cap"
        helpText="How much state/local taxes you can deduct from federal taxes. Raised from $10K to $40K under the Big Beautiful Bill."
        value={policy.saltCap}
        min={0}
        max={200_000}
        step={5000}
        format={(v) => v === 0 ? '$0' : `$${(v / 1000).toFixed(0)}K`}
        onChange={(v) => policy.setPolicy({ saltCap: v })}
        color="#f59e0b"
      />

      <Slider
        label="Child Tax Credit"
        helpText="Tax credit per child — directly reduces your tax bill. Increased to $2,200 under the Big Beautiful Bill."
        value={policy.childTaxCredit}
        min={0}
        max={5000}
        step={100}
        format={(v) => v === 0 ? '$0' : `$${v.toLocaleString()}`}
        onChange={(v) => policy.setPolicy({ childTaxCredit: v })}
        color="#f59e0b"
      />

      <Slider
        label="Senior Bonus Deduction"
        helpText="Extra tax deduction for Americans 65 and older. New provision in the Big Beautiful Bill."
        value={policy.seniorBonusDeduction}
        min={0}
        max={20_000}
        step={500}
        format={(v) => v === 0 ? '$0' : `$${(v / 1000).toFixed(1)}K`}
        onChange={(v) => policy.setPolicy({ seniorBonusDeduction: v })}
        color="#f59e0b"
      />

      <Slider
        label="Trump Accounts (Newborn Savings)"
        helpText="Government-funded savings account for every newborn. $1,000 contribution grows tax-free until age 18."
        value={policy.trumpAccountContribution}
        min={0}
        max={10_000}
        step={250}
        format={(v) => v === 0 ? '$0' : `$${v.toLocaleString()}`}
        onChange={(v) => policy.setPolicy({ trumpAccountContribution: v })}
        color="#f59e0b"
      />

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Worker Wealth Accelerators
      </h3>
      <p className="text-[10px] text-white/30 mb-4">
        Ideas to help wage earners build wealth faster
      </p>

      <Slider
        label="Employee Ownership Mandate"
        helpText="Require companies above this size to give employees stock. Lets workers build wealth alongside owners."
        value={policy.esopThreshold ?? 0}
        min={0}
        max={1000}
        step={100}
        format={(v) => v === 0 ? 'None' : `${v}+ employees`}
        onChange={(v) => policy.setPolicy({ esopThreshold: v === 0 ? null : v })}
        color="#8b5cf6"
      />

      <Slider
        label="Minimum Wage"
        helpText="Federal minimum hourly wage. Currently $7.25, unchanged since 2009."
        value={policy.minimumWage}
        min={7.25}
        max={30}
        step={0.25}
        format={(v) => `$${v.toFixed(2)}/hr`}
        onChange={(v) => policy.setPolicy({ minimumWage: v })}
        color="#8b5cf6"
      />

      <Slider
        label="Baby Bonds at Birth"
        helpText="Government savings bond given at birth to every child. Grows until age 18 to help with college, housing, or starting a business."
        value={policy.babyBondAmount}
        min={0}
        max={50_000}
        step={1000}
        format={(v) => v === 0 ? '$0' : `$${(v / 1000).toFixed(0)}K`}
        onChange={(v) => policy.setPolicy({ babyBondAmount: v })}
        color="#8b5cf6"
      />
    </div>
  )
}
