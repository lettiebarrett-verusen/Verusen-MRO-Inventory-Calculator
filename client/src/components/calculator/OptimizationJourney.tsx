import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Network, Package, Layers } from "lucide-react";

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

  const savingsBreakdown = [
    {
      name: "Active Material Value Increases",
      shortName: "Active+",
      value: results.activeOptimization * 0.4,
      color: "#22c55e",
      icon: TrendingUp,
      description: "Reducing risk by increasing critical materials"
    },
    {
      name: "Active Material Value Decreases",
      shortName: "Active-",
      value: results.activeOptimization * 0.6,
      color: "#3b82f6",
      icon: TrendingDown,
      description: "Right-sizing active stock levels"
    },
    {
      name: "Network Optimization & Transfers",
      shortName: "Network",
      value: results.networkOptimization,
      color: "#8b5cf6",
      icon: Network,
      description: "Cross-site inventory balancing"
    },
    {
      name: "VMI Disposition",
      shortName: "VMI",
      value: results.vmiDisposition,
      color: "#f97316",
      icon: Package,
      description: "Vendor-managed inventory opportunities"
    },
    {
      name: "Deduplication Savings",
      shortName: "Dedup",
      value: results.deduplication,
      color: "#ec4899",
      icon: Layers,
      description: "Eliminating duplicate safety stock"
    },
    {
      name: "Obsolete Reduction",
      shortName: "Obsolete",
      value: results.obsoleteReduction,
      color: "#ef4444",
      icon: TrendingDown,
      description: "Clearing dead and slow-moving stock"
    }
  ].filter(item => item.value > 0);

  const chartData = savingsBreakdown.map(item => ({
    name: item.shortName,
    value: item.value,
    color: item.color
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>{formatCurrency(data.value)}</p>
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
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Compact Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <XAxis 
                      type="number"
                      tickFormatter={formatCompact}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      width={55}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3">
                {savingsBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: item.color }}>
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
