import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema, type CalculatorInputs, industryOptions } from "@/lib/calculator-logic";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function formatNumberWithCommas(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

interface InputStepProps {
  onComplete: (data: CalculatorInputs) => void;
  defaultValues?: Partial<CalculatorInputs>;
}

export function InputStep({ onComplete, defaultValues }: InputStepProps) {
  const [industry, setIndustry] = useState("");
  const form = useForm<CalculatorInputs>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      siteCount: 1,
      totalInventoryValue: 1000000,
      skuCount: 5000,
      activePercent: 50,
      obsoletePercent: 30,
      specialPercent: 20,
      ...defaultValues
    }
  });

  const activePct = form.watch("activePercent");
  const obsoletePct = form.watch("obsoletePercent");
  const specialPct = form.watch("specialPercent");

  const totalPct = activePct + obsoletePct + specialPct;
  const is100 = Math.abs(totalPct - 100) < 1;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Input Your MRO Inventory Profile</h2>
        <p className="text-muted-foreground">Enter a few high-level details to estimate your optimization potential.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="siteCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sites</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          inputMode="numeric"
                          data-testid="input-site-count"
                          value={formatNumberWithCommas(field.value)}
                          onChange={e => field.onChange(parseFormattedNumber(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="totalInventoryValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Inventory Value ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input 
                            type="text"
                            inputMode="numeric"
                            data-testid="input-inventory-value"
                            value={formatNumberWithCommas(field.value)}
                            onChange={e => field.onChange(parseFormattedNumber(e.target.value))}
                            className="text-lg font-medium pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="skuCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approx. SKU Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          inputMode="numeric"
                          data-testid="input-sku-count"
                          value={formatNumberWithCommas(field.value)}
                          onChange={e => field.onChange(parseFormattedNumber(e.target.value))}
                          className="text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Industry</label>
                  <Select onValueChange={setIndustry} value={industry}>
                    <SelectTrigger data-testid="select-industry" className="text-lg font-medium [&>span]:text-sm">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option} value={option} data-testid={`option-industry-${option}`}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                   Inventory Mix Breakdown
                   <Tooltip>
                     <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground"/></TooltipTrigger>
                     <TooltipContent>
                       Estimate the percentage of your inventory in each category. Must equal 100%.
                     </TooltipContent>
                   </Tooltip>
                 </h3>
                 <span className={`text-sm font-bold ${is100 ? 'text-green-600' : 'text-red-500'}`}>
                   Total: {totalPct}%
                 </span>
              </div>
              
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="activePercent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-2">
                        <FormLabel>Active & Slow Moving</FormLabel>
                        <span className="font-mono">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={0} max={100} step={1} 
                          value={[field.value]} 
                          onValueChange={vals => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Material consumed regularly or intermittently.</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="obsoletePercent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-2">
                        <FormLabel>Non-Moving / Obsolete</FormLabel>
                        <span className="font-mono">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={0} max={100} step={1} 
                          value={[field.value]} 
                          onValueChange={vals => field.onChange(vals[0])}
                          className="[&_.bg-primary]:bg-orange-500"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">No usage in 2+ years.</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialPercent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-2">
                        <FormLabel>Special Items</FormLabel>
                        <span className="font-mono">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={0} max={100} step={1} 
                          value={[field.value]} 
                          onValueChange={vals => field.onChange(vals[0])}
                          className="[&_.bg-primary]:bg-teal-500"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Consignment, Bulk, Fuel, Strategic Spares.</p>
                    </FormItem>
                  )}
                />
              </div>

              {!is100 && (
                <p className="text-red-500 text-sm mt-4 text-center font-medium">
                  Percentages must equal 100% (Current: {totalPct}%)
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              className="px-12 h-12 text-lg rounded-full"
              disabled={!is100}
            >
              Analyze Opportunity <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
