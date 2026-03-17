import { usePolicyStore } from '../../models/policyState'
import { Slider } from '../shared/Slider'
import { Toggle } from '../shared/Toggle'

export function CapitalControls() {
  const policy = usePolicyStore()

  return (
    <div>
      <Slider
        label="Investment Profit Tax Rate"
        helpText="Tax on profits from selling stocks, real estate, or businesses held over a year. Currently much lower than wage tax rates."
        value={policy.ltcgRate}
        min={0}
        max={0.40}
        step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => policy.setPolicy({ ltcgRate: v })}
        color="#10b981"
      />

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Original Tax Loopholes
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        Legal strategies that let wealthy investors reduce or avoid taxes
      </p>

      <Toggle
        label="Fund Manager Tax Loophole"
        helpText="Hedge fund and PE managers pay the low investment tax rate (20%) on their profits instead of the income rate (37%)."
        checked={!policy.carriedInterestAsOrdinary}
        onChange={(checked) => policy.setPolicy({ carriedInterestAsOrdinary: !checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Inherited Gains Tax Erasure"
        helpText="When you inherit assets, all the gains are erased. A stock bought at $1M and now worth $100M? You pay $0 tax on that $99M."
        checked={policy.stepUpBasisEnabled}
        onChange={(checked) => policy.setPolicy({ stepUpBasisEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Slider
        label="Property Swap Tax Deferral"
        helpText="Sell an investment property and buy another — pay zero tax on the gain. Can be repeated indefinitely, deferring taxes forever."
        value={policy.exchange1031Cap === null ? 20_000_000 : policy.exchange1031Cap}
        min={0}
        max={20_000_000}
        step={500_000}
        format={(v) => {
          if (policy.exchange1031Cap === null || v >= 20_000_000) return 'Unlimited'
          if (v === 0) return '$0 (Closed)'
          return `$${(v / 1_000_000).toFixed(1)}M`
        }}
        onChange={(v) => policy.setPolicy({
          exchange1031Cap: v >= 20_000_000 ? null : v,
        })}
        color="#10b981"
      />

      <Slider
        label="Startup Stock Tax Break"
        helpText="Founders can exclude up to $15M in startup stock gains from tax. Raised from $10M under the Big Beautiful Bill."
        value={policy.qsbsExclusionCap}
        min={0}
        max={20_000_000}
        step={500_000}
        format={(v) => v === 0 ? '$0 (Closed)' : `$${(v / 1_000_000).toFixed(1)}M`}
        onChange={(v) => policy.setPolicy({ qsbsExclusionCap: v })}
        color="#10b981"
      />

      <Slider
        label="Borrow-to-Avoid-Taxes Limit"
        helpText="Billionaires borrow against their stocks instead of selling. They never pay tax because they never 'realize' gains. This is how they live tax-free."
        value={policy.marginLoanCap === null ? 10 : policy.marginLoanCap}
        min={0}
        max={10}
        step={1}
        format={(v) => {
          if (policy.marginLoanCap === null || v >= 10) return 'Unlimited'
          if (v === 0) return 'None'
          return `${v}x Net Worth`
        }}
        onChange={(v) => policy.setPolicy({
          marginLoanCap: v >= 10 ? null : v,
        })}
        color="#10b981"
      />

      <Toggle
        label="Business Owner Tax Break"
        helpText="Pass-through business owners (LLCs, S-corps) get a free 20% deduction. Made permanent under the Big Beautiful Bill."
        checked={policy.section199AEnabled}
        onChange={(checked) => policy.setPolicy({ section199AEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Property Value Write-Off"
        helpText="Real estate investors deduct 'depreciation' on paper while the property actually gains value. Reduces taxable income significantly."
        checked={policy.depreciationEnabled}
        onChange={(checked) => policy.setPolicy({ depreciationEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      {policy.depreciationEnabled && (
        <Slider
          label="Bonus Depreciation Rate"
          helpText="Allows writing off the full cost of assets in year one instead of spreading over decades. 100% = full write-off immediately."
          value={policy.bonusDepreciationRate}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={(v) => policy.setPolicy({ bonusDepreciationRate: v })}
          color="#10b981"
        />
      )}

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Worker Tax Shelters
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        Tax-advantaged accounts available to W-2 workers and high earners
      </p>

      <Toggle
        label="401(k) & HSA Benefits"
        helpText="Pre-tax 401(k) contributions ($23K/yr) reduce taxable income. HSA provides triple tax advantage for medical expenses."
        checked={policy.retirementTaxBreaks}
        onChange={(checked) => policy.setPolicy({ retirementTaxBreaks: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Backdoor Roth Conversion"
        helpText="High earners convert traditional IRA to Roth, bypassing income limits. Investment growth becomes permanently tax-free."
        checked={policy.rothConversionEnabled}
        onChange={(checked) => policy.setPolicy({ rothConversionEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Deferred Compensation"
        helpText="Executives defer up to 40% of salary to future years — often into retirement when they're in a lower tax bracket."
        checked={policy.deferredCompEnabled}
        onChange={(checked) => policy.setPolicy({ deferredCompEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Founder & Investor Strategies
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        Tax optimization tools for startup founders and fund managers
      </p>

      <Toggle
        label="83(b) Election"
        helpText="Founders pay tax on stock at grant (penny value) instead of at vesting (millions). Converts future gains to long-term capital gains."
        checked={policy.election83bEnabled}
        onChange={(checked) => policy.setPolicy({ election83bEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Opportunity Zone Deferral"
        helpText="Defer and reduce capital gains by investing in designated opportunity zones. 10% basis step-up after 5 years."
        checked={policy.opportunityZoneEnabled}
        onChange={(checked) => policy.setPolicy({ opportunityZoneEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Charitable Stock Strategies"
        helpText="Donate appreciated stock to charity — deduct full market value while paying zero capital gains tax on the appreciation."
        checked={policy.charitableStrategies}
        onChange={(checked) => policy.setPolicy({ charitableStrategies: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Trust & Estate Planning
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        Wealth transfer strategies that reduce or eliminate estate and gift taxes
      </p>

      <Toggle
        label="GRAT Planning"
        helpText="Grantor Retained Annuity Trust — transfer investment appreciation above the IRS hurdle rate to heirs completely tax-free."
        checked={policy.gratEnabled}
        onChange={(checked) => policy.setPolicy({ gratEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Family LP Discounting"
        helpText="Transfer assets via family limited partnerships at 20-35% valuation discounts, reducing gift and estate tax liability."
        checked={policy.familyLPEnabled}
        onChange={(checked) => policy.setPolicy({ familyLPEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Dynasty Trust"
        helpText="Wealth compounds across generations inside a trust, bypassing estate tax at each generational transfer. Can last centuries."
        checked={policy.dynastyTrustEnabled}
        onChange={(checked) => policy.setPolicy({ dynastyTrustEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="PPLI (Insurance Wrapper)"
        helpText="Private placement life insurance — invest inside an insurance policy wrapper. Growth is completely tax-free, accessible via policy loans."
        checked={policy.ppliEnabled}
        onChange={(checked) => policy.setPolicy({ ppliEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <Toggle
        label="Charitable Lead Trust"
        helpText="Pay a charitable annuity for a fixed period, then transfer remaining assets to heirs at drastically reduced gift/estate tax."
        checked={policy.charitableLeadTrustEnabled}
        onChange={(checked) => policy.setPolicy({ charitableLeadTrustEnabled: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Advanced Real Estate
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        Specialized strategies for real estate investors beyond basic depreciation
      </p>

      <Toggle
        label="Cost Segregation & Advanced RE"
        helpText="Cost segregation studies, cash-out refinancing (tax-free equity access), and installment sales (spread gains over years)."
        checked={policy.advancedREStrategies}
        onChange={(checked) => policy.setPolicy({ advancedREStrategies: checked })}
        onLabel="Open"
        offLabel="Closed"
        color="#10b981"
      />
    </div>
  )
}
