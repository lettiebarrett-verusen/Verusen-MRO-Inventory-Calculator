import { type CalculatorInputs } from "@/lib/calculator-logic";
import { Input } from "@/components/ui/input";
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

  const parsePercent = (str: string) => {
    const cleaned = str.replace(/[^0-9]/g, '');
    const val = cleaned ? parseInt(cleaned, 10) : 0;
    return Math.min(100, val);
  };

  return (
    <Card className="border-border/50 bg-muted/20 mb-8">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Adjust Inputs</span>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-end">
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

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Active %</label>
            <div className="relative">
              <Input 
                type="text"
                inputMode="numeric"
                value={inputs.activePercent}
                onChange={e => handleChange("activePercent", parsePercent(e.target.value))}
                className="h-9 text-sm font-mono pr-6 text-right"
              />
              <span className="absolute right-2 top-2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Non-Moving %</label>
            <div className="relative">
              <Input 
                type="text"
                inputMode="numeric"
                value={inputs.obsoletePercent}
                onChange={e => handleChange("obsoletePercent", parsePercent(e.target.value))}
                className="h-9 text-sm font-mono pr-6 text-right"
              />
              <span className="absolute right-2 top-2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          
          <div>
            <label className={`text-xs mb-1 block ${is100 ? 'text-muted-foreground' : 'text-red-500'}`}>Special %</label>
            <div className="relative">
              <Input 
                type="text"
                inputMode="numeric"
                value={inputs.specialPercent}
                onChange={e => handleChange("specialPercent", parsePercent(e.target.value))}
                className={`h-9 text-sm font-mono pr-6 text-right ${!is100 ? 'border-red-500' : ''}`}
              />
              <span className="absolute right-2 top-2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        
        {!is100 && (
          <p className="text-red-500 text-xs mt-2">Percentages must equal 100% (Current: {totalPct}%)</p>
        )}
      </CardContent>
    </Card>
  );
}
