import { type CalculatorInputs } from "@/lib/calculator-logic";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2 } from "lucide-react";

interface CompactInputsProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export function CompactInputs({ inputs, onChange }: CompactInputsProps) {
  const totalPct = inputs.activePercent + inputs.obsoletePercent + inputs.specialPercent;
  const is100 = Math.abs(totalPct - 100) < 1;

  const handleChange = (field: keyof CalculatorInputs, value: number) => {
    onChange({ ...inputs, [field]: value });
  };

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(val);

  const parseFormattedNumber = (str: string) => {
    const cleaned = str.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <Card className="border-border/50 bg-muted/20 mb-8">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Adjust Inputs</span>
        </div>
        
        <div className="grid md:grid-cols-6 gap-4 items-end">
          {/* Core Inputs */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sites</label>
            <Input 
              type="text" 
              value={formatNumber(inputs.siteCount)}
              onChange={e => handleChange("siteCount", parseFormattedNumber(e.target.value))}
              className="h-9 text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Inventory Value</label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-xs text-muted-foreground">$</span>
              <Input 
                type="text" 
                value={formatNumber(inputs.totalInventoryValue)}
                onChange={e => handleChange("totalInventoryValue", parseFormattedNumber(e.target.value))}
                className="h-9 text-sm pl-5"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">SKUs</label>
            <Input 
              type="text" 
              value={formatNumber(inputs.skuCount)}
              onChange={e => handleChange("skuCount", parseFormattedNumber(e.target.value))}
              className="h-9 text-sm"
            />
          </div>

          {/* Percentage Sliders */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-muted-foreground">Active</label>
              <span className="text-xs font-mono">{inputs.activePercent}%</span>
            </div>
            <Slider 
              min={0} max={100} step={1} 
              value={[inputs.activePercent]} 
              onValueChange={vals => handleChange("activePercent", vals[0])}
              className="h-9"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-muted-foreground">Obsolete</label>
              <span className="text-xs font-mono">{inputs.obsoletePercent}%</span>
            </div>
            <Slider 
              min={0} max={100} step={1} 
              value={[inputs.obsoletePercent]} 
              onValueChange={vals => handleChange("obsoletePercent", vals[0])}
              className="h-9"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-muted-foreground">Special</label>
              <span className={`text-xs font-mono ${is100 ? '' : 'text-red-500'}`}>{inputs.specialPercent}%</span>
            </div>
            <Slider 
              min={0} max={100} step={1} 
              value={[inputs.specialPercent]} 
              onValueChange={vals => handleChange("specialPercent", vals[0])}
              className="h-9"
            />
          </div>
        </div>
        
        {!is100 && (
          <p className="text-red-500 text-xs mt-2">Percentages must equal 100% (Current: {totalPct}%)</p>
        )}
      </CardContent>
    </Card>
  );
}
