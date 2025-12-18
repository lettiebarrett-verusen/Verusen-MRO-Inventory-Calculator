import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface OptimizationJourneyProps {
  results: CalculationResult;
  totalInventoryValue: number;
}

export function OptimizationJourney({ results, totalInventoryValue }: OptimizationJourneyProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const improvedInventory = totalInventoryValue - results.totalReduction;
  const shortTermRealization = results.totalReduction * 0.35; // 35% in first 12 months
  const longTermPotential = results.totalReduction * 0.65; // 65% long term

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-2 pb-4 border-b-4 border-accent inline-block">
          Inventory Optimization Roadmap
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Journey Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-muted/30 rounded-2xl p-12 border border-border/50 overflow-x-auto">
            <div className="flex items-end justify-between min-w-max gap-8 h-96">
              {/* Starting State */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-80 w-24 bg-gradient-to-t from-primary to-blue-600 rounded-lg flex items-end justify-center pb-4 shadow-lg">
                  <span className="text-white font-bold text-lg">{formatCurrency(totalInventoryValue)}</span>
                </div>
                <p className="text-sm font-semibold text-center text-primary">Starting<br/>SOH Inventory</p>
              </div>

              {/* Optimization Steps */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary">Active Increases</div>
                  <div className="text-orange-500">+{formatCurrency(results.activeOptimization)}</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary">Network</div>
                  <div className="text-red-500">-{formatCurrency(results.networkOptimization)}</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary">VMI</div>
                  <div className="text-red-500">-{formatCurrency(results.vmiDisposition)}</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary">Deduplication</div>
                  <div className="text-red-500">-{formatCurrency(results.deduplication)}</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="font-semibold text-primary">Obsolete</div>
                  <div className="text-red-500">-{formatCurrency(results.obsoleteReduction)}</div>
                </div>
              </div>

              {/* Improved State */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-64 w-24 bg-gradient-to-t from-primary to-blue-500 rounded-lg flex items-end justify-center pb-4 shadow-lg">
                  <span className="text-white font-bold text-sm">{formatCurrency(improvedInventory)}</span>
                </div>
                <p className="text-sm font-semibold text-center text-primary">Improved<br/>SOH Inventory</p>
              </div>

              {/* Optimal State */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-60 w-24 bg-gradient-to-t from-primary to-blue-400 rounded-lg flex items-end justify-center pb-4 shadow-lg">
                    <span className="text-white font-bold text-sm">{formatCurrency(improvedInventory * 0.95)}</span>
                  </div>
                  <CheckCircle2 className="absolute -top-6 -right-6 w-12 h-12 text-green-500 bg-white rounded-full p-1" />
                </div>
                <p className="text-sm font-semibold text-center text-primary">Optimal<br/>SOH Inventory</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex justify-between mt-8 gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 rounded-full border border-border/50">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">📅</div>
              <span className="text-sm font-semibold">12-24 MONTHS</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 rounded-full border border-border/50">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">📅</div>
              <span className="text-sm font-semibold">LONG TERM & BEYOND</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div>
          <Card className="bg-primary text-primary-foreground border-none h-full">
            <CardContent className="pt-8 space-y-6">
              <div>
                <div className="text-5xl font-extrabold mb-2">{formatCurrency(results.totalReduction)}</div>
                <p className="text-blue-100 font-semibold">Optimization Opportunity</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-sm text-blue-200 mb-2 font-semibold">
                    {formatCurrency(shortTermRealization)} Realized in &lt;12 months
                  </p>
                  <ul className="text-xs text-blue-100 space-y-1">
                    <li>✓ Acceptance of recommendations (site and network level stocking policies)</li>
                    <li>✓ Leverage of the Verusen Trusted Ecosystem</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-blue-200 mb-2 font-semibold">
                    {formatCurrency(longTermPotential)}+ Long Term Potential
                  </p>
                  <ul className="text-xs text-blue-100 space-y-1">
                    <li>✓ Continued network/spare parts sharing</li>
                    <li>✓ Realizing burndown on slower moving inventory</li>
                    <li>✓ Continued rundown of nonstock</li>
                    <li>✓ Ongoing repositioning of SLOB targeting additional value</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
