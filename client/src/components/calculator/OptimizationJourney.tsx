import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Network, Package, Layers } from "lucide-react";

interface OptimizationJourneyProps {
  results: CalculationResult;
  totalInventoryValue: number;
}

export function OptimizationJourney({ results, totalInventoryValue }: OptimizationJourneyProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const savingsBreakdown = [
    {
      name: "Active Material Value Increases",
      value: results.activeOptimization * 0.4,
      color: "#22c55e",
      icon: TrendingUp,
      description: "Improved forecasting on active items"
    },
    {
      name: "Active Material Value Decreases",
      value: results.activeOptimization * 0.6,
      color: "#3b82f6",
      icon: TrendingDown,
      description: "Right-sizing active stock levels"
    },
    {
      name: "Network Optimization & Transfers",
      value: results.networkOptimization,
      color: "#8b5cf6",
      icon: Network,
      description: "Cross-site inventory balancing"
    },
    {
      name: "VMI Disposition",
      value: results.vmiDisposition,
      color: "#f97316",
      icon: Package,
      description: "Vendor-managed inventory opportunities"
    },
    {
      name: "Deduplication Savings",
      value: results.deduplication,
      color: "#ec4899",
      icon: Layers,
      description: "Eliminating duplicate safety stock"
    },
    {
      name: "Obsolete Reduction",
      value: results.obsoleteReduction,
      color: "#ef4444",
      icon: TrendingDown,
      description: "Clearing dead and slow-moving stock"
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-sm text-primary">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold mb-2 pb-4 border-b-4 border-accent inline-block">
          MRO Inventory Optimizer
        </h2>
      </div>

      <div>
        {/* Total Savings & Donut Chart */}
        <div>
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Donut Chart */}
                <div className="h-72 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={savingsBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {savingsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-muted-foreground font-medium">TOTAL SAVINGS</p>
                    <p className="text-2xl font-extrabold text-primary">{formatCurrency(results.totalReduction)}</p>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-3">
                  {savingsBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center" 
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: item.color }}>
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
    </div>
  );
}
