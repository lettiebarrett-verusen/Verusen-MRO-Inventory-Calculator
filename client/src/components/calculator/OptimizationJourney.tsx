import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from "recharts";
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

  const chartData = [
    {
      stage: "Starting\nInventory",
      value: totalInventoryValue,
      fill: "#1e293b",
      tooltip: `Starting SOH: ${formatCurrency(totalInventoryValue)}`,
      timeline: null
    },
    {
      stage: "Network",
      value: -results.networkOptimization,
      fill: "#ef4444",
      tooltip: `Network: -${formatCurrency(results.networkOptimization)}`,
      timeline: null
    },
    {
      stage: "VMI",
      value: -results.vmiDisposition,
      fill: "#f97316",
      tooltip: `VMI: -${formatCurrency(results.vmiDisposition)}`,
      timeline: null
    },
    {
      stage: "Dedup",
      value: -results.deduplication,
      fill: "#eab308",
      tooltip: `Dedup: -${formatCurrency(results.deduplication)}`,
      timeline: null
    },
    {
      stage: "Obsolete",
      value: -results.obsoleteReduction,
      fill: "#ec4899",
      tooltip: `Obsolete: -${formatCurrency(results.obsoleteReduction)}`,
      timeline: null
    },
    {
      stage: "Improved\n12-24 Mo",
      value: improvedInventory,
      fill: "#0ea5e9",
      tooltip: `Improved SOH: ${formatCurrency(improvedInventory)}`,
      timeline: "12-24 MONTHS"
    },
    {
      stage: "Optimal\nLong Term",
      value: improvedInventory * 0.95,
      fill: "#06b6d4",
      tooltip: `Optimal SOH: ${formatCurrency(improvedInventory * 0.95)}`,
      timeline: "LONG TERM"
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm text-primary">{data.stage.replace('\n', ' ')}</p>
          <p className="text-sm text-muted-foreground">{data.tooltip}</p>
          {data.timeline && (
            <p className="text-xs text-accent font-medium mt-1">{data.timeline}</p>
          )}
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
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="stage" 
                      angle={-35}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      interval={0}
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
                    <ReferenceLine x="Improved\n12-24 Mo" stroke="#0ea5e9" strokeDasharray="3 3" strokeWidth={2}>
                      <Label value="📅 12-24 MONTHS" position="top" fill="#0ea5e9" fontSize={11} fontWeight={600} />
                    </ReferenceLine>
                    <ReferenceLine x="Optimal\nLong Term" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth={2}>
                      <Label value="📅 LONG TERM" position="top" fill="#06b6d4" fontSize={11} fontWeight={600} />
                    </ReferenceLine>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1e293b" }} />
                  <span className="text-xs font-medium text-muted-foreground">Current State</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-xs font-medium text-muted-foreground">Reductions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#0ea5e9" }} />
                  <span className="text-xs font-medium text-muted-foreground">Improved (12-24 Mo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#06b6d4" }} />
                  <span className="text-xs font-medium text-muted-foreground">Optimal (Long Term)</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
