import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { type CalculatorInputs, type PainPoint, industryOptions } from "@/lib/calculator-logic";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

function formatNumberWithCommas(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('en-US');
}

function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

interface InputStepProps {
  selectedPains: Set<PainPoint>;
  onComplete: (data: CalculatorInputs) => void;
  defaultValues?: Partial<CalculatorInputs>;
}

export function InputStep({ selectedPains, onComplete, defaultValues }: InputStepProps) {
  const [industry, setIndustry] = useState("");
  const [values, setValues] = useState<CalculatorInputs>({
    siteCount: defaultValues?.siteCount || 0,
    totalInventoryValue: defaultValues?.totalInventoryValue || 0,
    skuCount: defaultValues?.skuCount || 0,
    activePercent: defaultValues?.activePercent ?? 67,
    obsoletePercent: defaultValues?.obsoletePercent ?? 23,
    specialPercent: defaultValues?.specialPercent ?? 10,
    annualSpend: defaultValues?.annualSpend || 0,
    holdingCostRate: defaultValues?.holdingCostRate ?? 15,
    waccRate: defaultValues?.waccRate ?? 7,
    downtimeHoursPerSite: defaultValues?.downtimeHoursPerSite || 0,
    downtimeCostPerHour: defaultValues?.downtimeCostPerHour || 0,
    currentServiceLevel: defaultValues?.currentServiceLevel ?? 88,
    targetServiceLevel: defaultValues?.targetServiceLevel ?? 95,
    stockoutPercent: defaultValues?.stockoutPercent ?? 50,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pctUserEdited, setPctUserEdited] = useState(false);

  const hasInvOrSpend = selectedPains.has("inventory") || selectedPains.has("spend");
  const hasSpend = selectedPains.has("spend");
  const hasDowntime = selectedPains.has("downtime");

  const updateField = useCallback((field: keyof CalculatorInputs, val: number) => {
    setValues(prev => ({ ...prev, [field]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const pctTotal = values.activePercent + values.obsoletePercent + values.specialPercent;
  const pctOk = Math.abs(pctTotal - 100) < 0.5;

  const skuWarning = hasInvOrSpend && values.totalInventoryValue > 0 && values.skuCount > 0
    ? (() => {
        const vps = values.totalInventoryValue / values.skuCount;
        return vps < 500 || vps > 2000
          ? `Value per SKU ($${Math.round(vps).toLocaleString()}) is outside the typical $500–$2,000 range — results may be less precise.`
          : null;
      })()
    : null;

  const spendWarning = hasSpend && values.totalInventoryValue > 0 && values.annualSpend && values.annualSpend > 0
    ? (() => {
        const ratio = values.annualSpend! / values.totalInventoryValue;
        return ratio < 0.35 || ratio > 0.75
          ? "Typical range is 35–75% of on-hand inventory value."
          : null;
      })()
    : null;

  const dtHoursWarning = hasDowntime && values.downtimeHoursPerSite && values.downtimeHoursPerSite > 0
    ? (values.downtimeHoursPerSite < 300 || values.downtimeHoursPerSite > 1200
        ? "Value is outside the typical 300–1,200 hr range."
        : null)
    : null;

  const dtCostWarning = hasDowntime && values.downtimeCostPerHour && values.downtimeCostPerHour > 0
    ? (values.downtimeCostPerHour < 5600 || values.downtimeCostPerHour > 22000
        ? "Value is outside the typical $5,600–$22,000/hr range."
        : null)
    : null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!industry) errs.industry = "Please select an industry";
    if (!values.siteCount || values.siteCount < 1) errs.siteCount = "Required";

    if (hasInvOrSpend) {
      if (!values.totalInventoryValue || values.totalInventoryValue < 1000) errs.totalInventoryValue = "Required";
      if (!values.skuCount || values.skuCount < 1) errs.skuCount = "Required";
    }
    if (hasSpend) {
      if (!values.annualSpend || values.annualSpend < 1) errs.annualSpend = "Required";
    }
    if (hasDowntime) {
      if (!values.downtimeHoursPerSite || values.downtimeHoursPerSite < 1) errs.downtimeHoursPerSite = "Required";
      if (!values.downtimeCostPerHour || values.downtimeCostPerHour < 1) errs.downtimeCostPerHour = "Required";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`inp-${firstKey}`)?.focus();
      return false;
    }

    if (pctUserEdited && !pctOk) {
      if (!window.confirm("Your inventory mix percentages don't total 100%. Continue with defaults (67% / 23% / 10%)?")) {
        return false;
      }
      setValues(prev => ({ ...prev, activePercent: 67, obsoletePercent: 23, specialPercent: 10 }));
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onComplete(values);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#003252] mb-1" data-testid="text-profile-title">
        Tell us about your operation
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Required fields are marked with a red dot. Optional fields improve accuracy — defaults are industry benchmarks.
      </p>

      <SectionHead>Core Information</SectionHead>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <FieldGroup label="Industry" required error={errors.industry}>
          <Select onValueChange={setIndustry} value={industry}>
            <SelectTrigger data-testid="select-industry" id="inp-industry">
              <SelectValue placeholder="Select your industry..." />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup label="Number of Sites" required error={errors.siteCount} hint="Facilities that hold or consume MRO inventory">
          <Input
            id="inp-siteCount"
            data-testid="input-site-count"
            type="text"
            inputMode="numeric"
            value={values.siteCount ? formatNumberWithCommas(values.siteCount) : ''}
            onChange={e => updateField("siteCount", parseFormattedNumber(e.target.value))}
            placeholder="e.g. 6"
          />
        </FieldGroup>
      </div>

      {hasInvOrSpend && (
        <>
          <SectionHead>Inventory Profile</SectionHead>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FieldGroup label="Value of On-Hand Inventory" required error={errors.totalInventoryValue}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input
                  id="inp-totalInventoryValue"
                  data-testid="input-inventory-value"
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  value={values.totalInventoryValue ? formatNumberWithCommas(values.totalInventoryValue) : ''}
                  onChange={e => updateField("totalInventoryValue", parseFormattedNumber(e.target.value))}
                  placeholder="e.g. 4,000,000"
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Number of On-Hand SKUs" required error={errors.skuCount} hint="Total unique part numbers in your MRO catalog" warning={skuWarning}>
              <Input
                id="inp-skuCount"
                data-testid="input-sku-count"
                type="text"
                inputMode="numeric"
                value={values.skuCount ? formatNumberWithCommas(values.skuCount) : ''}
                onChange={e => updateField("skuCount", parseFormattedNumber(e.target.value))}
                placeholder="e.g. 12,000"
              />
            </FieldGroup>
          </div>

          <SectionHead>Inventory Mix <span className="text-xs font-normal text-muted-foreground ml-2">— optional, must total 100%</span></SectionHead>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <FieldGroup label="Active & Slow" optional>
              <div className="relative">
                <Input
                  data-testid="input-active-percent"
                  type="number"
                  className="pr-7"
                  value={values.activePercent || ''}
                  onChange={e => { setPctUserEdited(true); updateField("activePercent", parseFloat(e.target.value) || 0); }}
                  placeholder="67"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <span className="text-xs text-muted-foreground">Default: 67%</span>
            </FieldGroup>

            <FieldGroup label="Non-Moving / Obsolete" optional>
              <div className="relative">
                <Input
                  data-testid="input-obsolete-percent"
                  type="number"
                  className="pr-7"
                  value={values.obsoletePercent || ''}
                  onChange={e => { setPctUserEdited(true); updateField("obsoletePercent", parseFloat(e.target.value) || 0); }}
                  placeholder="23"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <span className="text-xs text-muted-foreground">Default: 23%</span>
            </FieldGroup>

            <FieldGroup label="Special Items" optional>
              <div className="relative">
                <Input
                  data-testid="input-special-percent"
                  type="number"
                  className="pr-7"
                  value={values.specialPercent || ''}
                  onChange={e => { setPctUserEdited(true); updateField("specialPercent", parseFloat(e.target.value) || 0); }}
                  placeholder="10"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <span className="text-xs text-muted-foreground">Default: 10%</span>
            </FieldGroup>
          </div>
          <div className="flex justify-end items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className={`text-xs font-mono font-medium ${pctOk ? 'text-[#3ec26d]' : pctUserEdited ? 'text-red-500' : 'text-muted-foreground'}`}>
              {pctUserEdited ? `${pctTotal}%` : '—'}
            </span>
          </div>
        </>
      )}

      {hasSpend && (
        <>
          <SectionHead>Spend & Carrying Costs</SectionHead>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FieldGroup label="Annual MRO Replenishment Spend" required error={errors.annualSpend} hint="Total annual purchasing spend on MRO restocking" warning={spendWarning}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input
                  id="inp-annualSpend"
                  data-testid="input-annual-spend"
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  value={values.annualSpend ? formatNumberWithCommas(values.annualSpend) : ''}
                  onChange={e => updateField("annualSpend", parseFormattedNumber(e.target.value))}
                  placeholder="e.g. 2,500,000"
                />
              </div>
            </FieldGroup>
            <FieldGroup label="Average Holding Cost Rate" optional hint="Default: 15% of inventory value per year">
              <div className="relative">
                <Input
                  data-testid="input-holding-rate"
                  type="number"
                  className="pr-7"
                  value={values.holdingCostRate || ''}
                  onChange={e => updateField("holdingCostRate", parseFloat(e.target.value) || 0)}
                  placeholder="15"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </FieldGroup>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <FieldGroup label="Weighted Avg. Cost of Capital (WACC)" optional hint="Default: 7%">
              <div className="relative">
                <Input
                  data-testid="input-wacc-rate"
                  type="number"
                  className="pr-7"
                  value={values.waccRate || ''}
                  onChange={e => updateField("waccRate", parseFloat(e.target.value) || 0)}
                  placeholder="7"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </FieldGroup>
          </div>
        </>
      )}

      {hasDowntime && (
        <>
          <SectionHead>Downtime Profile</SectionHead>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FieldGroup label="Avg. Unplanned Downtime Hours / Site / Year" required error={errors.downtimeHoursPerSite} hint="Suggested range: 300–1,200 hrs/year" warning={dtHoursWarning}>
              <Input
                id="inp-downtimeHoursPerSite"
                data-testid="input-dt-hours"
                type="text"
                inputMode="numeric"
                value={values.downtimeHoursPerSite ? formatNumberWithCommas(values.downtimeHoursPerSite) : ''}
                onChange={e => updateField("downtimeHoursPerSite", parseFormattedNumber(e.target.value))}
                placeholder="e.g. 600"
              />
            </FieldGroup>
            <FieldGroup label="Avg. Downtime Cost / Hour / Site" required error={errors.downtimeCostPerHour} hint="Suggested range: $5,600–$22,000/hr" warning={dtCostWarning}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input
                  id="inp-downtimeCostPerHour"
                  data-testid="input-dt-cost"
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  value={values.downtimeCostPerHour ? formatNumberWithCommas(values.downtimeCostPerHour) : ''}
                  onChange={e => updateField("downtimeCostPerHour", parseFormattedNumber(e.target.value))}
                  placeholder="e.g. 12,000"
                />
              </div>
            </FieldGroup>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FieldGroup label="Current Service Level — Critical Spares" optional hint="Default: 88% (minimum: 75%)">
              <div className="relative">
                <Input
                  data-testid="input-svc-current"
                  type="number"
                  className="pr-7"
                  value={values.currentServiceLevel || ''}
                  onChange={e => updateField("currentServiceLevel", parseFloat(e.target.value) || 0)}
                  placeholder="88"
                  min={75}
                  max={100}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Desired Service Level — Critical Spares" optional hint="Default: 95% (maximum: 98%)">
              <div className="relative">
                <Input
                  data-testid="input-svc-target"
                  type="number"
                  className="pr-7"
                  value={values.targetServiceLevel || ''}
                  onChange={e => updateField("targetServiceLevel", parseFloat(e.target.value) || 0)}
                  placeholder="95"
                  min={0}
                  max={98}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </FieldGroup>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <FieldGroup label="% Downtime Attributed to Stockouts" optional hint="Default: 50% (maximum: 50%)">
              <div className="relative">
                <Input
                  data-testid="input-stockout-pct"
                  type="number"
                  className="pr-7"
                  value={values.stockoutPercent || ''}
                  onChange={e => updateField("stockoutPercent", parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  min={0}
                  max={50}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </FieldGroup>
          </div>
        </>
      )}

      <button type="button" id="step2-submit" onClick={handleSubmit} className="hidden" />
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldGroup({
  label,
  required,
  optional,
  error,
  hint,
  warning,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  warning?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#003252] flex items-center gap-1.5 flex-wrap">
        {required && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
        {label}
        {optional && <span className="text-xs text-muted-foreground font-normal bg-gray-100 px-1.5 py-0.5 rounded">optional</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
      {warning && (
        <span className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {warning}
        </span>
      )}
      {hint && !error && !warning && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

