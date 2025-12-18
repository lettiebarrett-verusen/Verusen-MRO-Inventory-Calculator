import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useState } from "react";

interface OptimizationJourneyProps {
  results: CalculationResult;
  totalInventoryValue: number;
}

export function OptimizationJourney({ results, totalInventoryValue }: OptimizationJourneyProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const improvedInventory = totalInventoryValue - results.totalReduction;
  const shortTermRealization = results.totalReduction * 0.35;
  const longTermPotential = results.totalReduction * 0.65;

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Create waterfall-style data
  const chartData = [
    {
      stage: "Starting\nInventory",
      value: totalInventoryValue,
      fill: "#1e293b",
      tooltip: `Starting SOH: ${formatCurrency(totalInventoryValue)}`
    },
    {
      stage: "Network\nOptimization",
      value: -results.networkOptimization,
      fill: "#ef4444",
      tooltip: `Network: -${formatCurrency(results.networkOptimization)}`
    },
    {
      stage: "VMI &\nConsignment",
      value: -results.vmiDisposition,
      fill: "#f97316",
      tooltip: `VMI: -${formatCurrency(results.vmiDisposition)}`
    },
    {
      stage: "Deduplication",
      value: -results.deduplication,
      fill: "#eab308",
      tooltip: `Dedup: -${formatCurrency(results.deduplication)}`
    },
    {
      stage: "Obsolete\nReduction",
      value: -results.obsoleteReduction,
      fill: "#ec4899",
      tooltip: `Obsolete: -${formatCurrency(results.obsoleteReduction)}`
    },
    {
      stage: "Improved\nInventory",
      value: improvedInventory,
      fill: "#0ea5e9",
      tooltip: `Improved SOH: ${formatCurrency(improvedInventory)}`
    },
    {
      stage: "Optimal\nInventory",
      value: improvedInventory * 0.95,
      fill: "#06b6d4",
      tooltip: `Optimal SOH: ${formatCurrency(improvedInventory * 0.95)}`
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm text-primary">{payload[0].payload.stage}</p>
          <p className="text-sm text-muted-foreground">{payload[0].payload.tooltip}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-2 pb-4 border-b-4 border-accent inline-block">
          Inventory Optimization Roadmap
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Interactive Bar Chart */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="pt-8">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="stage" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
                        return `$${val}`;
                      }}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      onMouseEnter={(data) => setHoveredCategory(data.stage)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          opacity={hoveredCategory === null || hoveredCategory === entry.stage ? 1 : 0.4}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1e293b" }} />
                  <span className="text-xs font-medium text-muted-foreground">Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-xs font-medium text-muted-foreground">Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }} />
                  <span className="text-xs font-medium text-muted-foreground">VMI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }} />
                  <span className="text-xs font-medium text-muted-foreground">Dedup</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="flex justify-between mt-8 gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 rounded-full border border-border/50 flex-1">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">📅</div>
              <span className="text-sm font-semibold">12-24 MONTHS</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 rounded-full border border-border/50 flex-1">
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
