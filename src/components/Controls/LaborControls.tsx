import { usePolicyStore } from '../../models/policyState'
import { Slider } from '../shared/Slider'

const BRACKET_LABELS = [
  'Lowest earners (under $11.6K)',
  'Lower-middle ($11.6K–$47.2K)',
  'Middle class ($47.2K–$100.5K)',
  'Upper-middle ($100.5K–$192K)',
  'High earners ($192K–$243.7K)',
  'Very high ($243.7K–$609.4K)',
  'Top earners ($609.4K+)',
]

const BRACKET_HELP = [
  'Rate on the first $11,600 of income — affects everyone',
  'Rate on income between $11.6K and $47.2K — most hourly workers',
  'Rate on income between $47.2K and $100.5K — salaried professionals',
  'Rate on income between $100.5K and $192K — senior professionals',
  'Rate on income between $192K and $243.7K — upper earners',
  'Rate on income between $243.7K and $609.4K — executives, doctors',
  'Rate on income above $609.4K — top 1% of earners',
]

export function LaborControls() {
  const policy = usePolicyStore()

  return (
    <div>
      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Income Tax Brackets
      </h3>
      <p className="text-[10px] text-white/30 mb-3">
        How much tax each income level pays on wages and salary
      </p>
      {policy.incomeTaxBrackets.map((bracket, i) => (
        <Slider
          key={i}
          label={BRACKET_LABELS[i] || `Bracket ${i + 1}`}
          helpText={BRACKET_HELP[i]}
          value={bracket.rate}
          min={0}
          max={0.60}
          step={0.01}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={(rate) => policy.setBracketRate(i, rate)}
          color="#3b82f6"
        />
      ))}

      <div className="border-t border-white/10 my-4" />

      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
        Other Paycheck Taxes
      </h3>

      <Slider
        label="Tax-Free Income Floor"
        helpText="Income below this amount is completely tax-free (standard deduction). Under current law, the first ~$14.6K is untaxed."
        value={policy.zeroTaxThreshold}
        min={0}
        max={150000}
        step={5000}
        format={(v) => v === 0 ? '$0' : `$${(v / 1000).toFixed(0)}K`}
        onChange={(v) => policy.setPolicy({ zeroTaxThreshold: v })}
        color="#3b82f6"
      />

      <Slider
        label="Social Security & Medicare Tax"
        helpText="Taken from every paycheck to fund Social Security and Medicare. Workers and employers each pay half."
        value={policy.ficaRate}
        min={0}
        max={0.15}
        step={0.0025}
        format={(v) => `${(v * 100).toFixed(1)}%`}
        onChange={(v) => policy.setPolicy({ ficaRate: v })}
        color="#3b82f6"
      />

      <Slider
        label="State Income Tax"
        helpText="Average state tax on income. Varies by state — some states like Texas have 0%, others like California go up to 13%."
        value={policy.stateIncomeTaxRate}
        min={0}
        max={0.13}
        step={0.005}
        format={(v) => `${(v * 100).toFixed(1)}%`}
        onChange={(v) => policy.setPolicy({ stateIncomeTaxRate: v })}
        color="#3b82f6"
      />
    </div>
  )
}
