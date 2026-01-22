import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { TrendingUp, TrendingDown, Network, Package, Layers, CheckCircle2 } from "lucide-react";

interface OptimizationJourneyProps {
  results: CalculationResult;
  totalInventoryValue: number;
}

export function OptimizationJourney({ results, totalInventoryValue }: OptimizationJourneyProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatCompact = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const optimalInventory = totalInventoryValue - results.totalReduction;
  const activeIncreases = results.activeOptimization * 0.4;
  const activeDecreases = results.activeOptimization * 0.6;

  const timelineData = [
    {
      name: "Starting\nInventory",
      value: totalInventoryValue,
      displayValue: formatCompact(totalInventoryValue),
      color: "#1e3a5f",
      icon: null,
      isPositive: true
    },
    {
      name: "Active\nIncreases",
      value: activeIncreases,
      displayValue: `+${formatCompact(activeIncreases)}`,
      color: "#22c55e",
      icon: TrendingUp,
      isPositive: true
    },
    {
      name: "Active\nDecreases",
      value: activeDecreases,
      displayValue: `-${formatCompact(activeDecreases)}`,
      color: "#3b82f6",
      icon: TrendingDown,
      isPositive: false
    },
    {
      name: "Network\nOptimization",
      value: results.networkOptimization,
      displayValue: `-${formatCompact(results.networkOptimization)}`,
      color: "#8b5cf6",
      icon: Network,
      isPositive: false
    },
    {
      name: "VMI\nDisposition",
      value: results.vmiDisposition,
      displayValue: `-${formatCompact(results.vmiDisposition)}`,
      color: "#f97316",
      icon: Package,
      isPositive: false
    },
    {
      name: "Deduplication\nSavings",
      value: results.deduplication,
      displayValue: `-${formatCompact(results.deduplication)}`,
      color: "#ec4899",
      icon: Layers,
      isPositive: false
    },
    {
      name: "Obsolete\nReduction",
      value: results.obsoleteReduction,
      displayValue: `-${formatCompact(results.obsoleteReduction)}`,
      color: "#ef4444",
      icon: TrendingDown,
      isPositive: false
    },
    {
      name: "Optimal\nInventory",
      value: optimalInventory,
      displayValue: formatCompact(optimalInventory),
      color: "#06b6d4",
      icon: CheckCircle2,
      isPositive: true
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name.replace('\n', ' ')}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>{data.displayValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold pb-4 border-b-4 border-accent inline-block">
          MRO Inventory Optimizer
        </h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Optimization Opportunity</p>
          <p className="text-3xl font-extrabold text-primary">{formatCurrency(results.totalReduction)}</p>
        </div>
      </div>

      <div>
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="pt-8 pb-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  margin={{ top: 30, right: 20, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                    height={60}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tickFormatter={formatCompact}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]}
                  >
                    {timelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="displayValue" 
                      position="top" 
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#1e3a5f" }} />
                <span className="text-xs text-muted-foreground">Starting Inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }} />
                <span className="text-xs text-muted-foreground">Risk Reduction (Increases)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8b5cf6" }} />
                <span className="text-xs text-muted-foreground">Optimization Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#06b6d4" }} />
                <span className="text-xs text-muted-foreground">Optimal Inventory</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
