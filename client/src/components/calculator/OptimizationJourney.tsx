import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { TrendingUp, TrendingDown, Network, Package, Layers, Square } from "lucide-react";

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

  const waterfallData = [
    { name: "Starting", value: totalInventoryValue, color: "#1e3a5f", label: formatCompact(totalInventoryValue) },
    { name: "Active+", value: activeIncreases, color: "#ef4444", label: `-${formatCompact(activeIncreases)}` },
    { name: "Active-", value: activeDecreases, color: "#3b82f6", label: `-${formatCompact(activeDecreases)}` },
    { name: "Network", value: results.networkOptimization, color: "#22c55e", label: `-${formatCompact(results.networkOptimization)}` },
    { name: "VMI", value: results.vmiDisposition, color: "#f97316", label: `-${formatCompact(results.vmiDisposition)}` },
    { name: "Dedup", value: results.deduplication, color: "#8b5cf6", label: `-${formatCompact(results.deduplication)}` },
    { name: "Obsolete", value: results.obsoleteReduction, color: "#ec4899", label: `-${formatCompact(results.obsoleteReduction)}` },
    { name: "Optimal", value: optimalInventory, color: "#1e3a5f", label: formatCompact(optimalInventory) }
  ];

  const breakdownItems = [
    {
      name: "Starting Inventory",
      value: totalInventoryValue,
      color: "#1e3a5f",
      icon: Square,
      description: null,
      isTotal: true
    },
    {
      name: "Active Material Value Increases",
      value: activeIncreases,
      color: "#ef4444",
      icon: TrendingUp,
      description: "Reducing risk by increasing critical materials"
    },
    {
      name: "Active Material Value Decreases",
      value: activeDecreases,
      color: "#3b82f6",
      icon: TrendingDown,
      description: "Right-sizing active stock levels"
    },
    {
      name: "VMI Disposition",
      value: results.vmiDisposition,
      color: "#f97316",
      icon: Package,
      description: "Vendor-managed inventory opportunities"
    },
    {
      name: "Obsolete Reduction",
      value: results.obsoleteReduction,
      color: "#ec4899",
      icon: TrendingDown,
      description: "Clearing dead and slow-moving stock"
    },
    {
      name: "Optimal Inventory",
      value: optimalInventory,
      color: "#1e3a5f",
      icon: Square,
      description: null,
      isTotal: true
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>{data.label}</p>
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
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Waterfall Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={waterfallData}
                    margin={{ top: 30, right: 10, left: 10, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList 
                        dataKey="label" 
                        position="top" 
                        fill="hsl(var(--foreground))"
                        fontSize={9}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3">
                {breakdownItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${item.isTotal ? 'bg-muted/50' : 'bg-background/50'} border border-border/30`}
                  >
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: item.isTotal ? item.color : `${item.color}20` }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.isTotal ? 'white' : item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.isTotal ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <p 
                      className={`text-sm font-bold flex-shrink-0 ${item.isTotal ? 'text-foreground' : ''}`} 
                      style={{ color: item.isTotal ? undefined : item.color }}
                    >
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
