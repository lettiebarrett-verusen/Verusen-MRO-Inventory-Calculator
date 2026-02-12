import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
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

  const activeIncreases = Math.abs(results.activeMaterialIncreases);
  const activeDecreases = results.activeMaterialDecreases;
  
  const totalOptimization = results.totalReduction;
  const optimalInventory = totalInventoryValue - totalOptimization;

  // Build waterfall data with base (invisible) and visible portions
  let runningTotal = totalInventoryValue;
  
  const waterfallData = [
    { 
      name: "Starting", 
      base: 0, 
      value: totalInventoryValue, 
      color: "#1e3a5f", 
      label: formatCompact(totalInventoryValue),
      isEndpoint: true
    },
    { 
      name: "Active+", 
      base: runningTotal, 
      value: activeIncreases, 
      color: "#ef4444", 
      label: `+${formatCompact(activeIncreases)}`,
      isEndpoint: false
    },
  ];
  runningTotal += activeIncreases;
  
  waterfallData.push({ 
    name: "Active-", 
    base: runningTotal - activeDecreases, 
    value: activeDecreases, 
    color: "#3b82f6", 
    label: `-${formatCompact(activeDecreases)}`,
    isEndpoint: false
  });
  runningTotal -= activeDecreases;
  
  waterfallData.push({ 
    name: "Network", 
    base: runningTotal - results.networkOptimization, 
    value: results.networkOptimization, 
    color: "#8b5cf6", 
    label: `-${formatCompact(results.networkOptimization)}`,
    isEndpoint: false
  });
  runningTotal -= results.networkOptimization;
  
  waterfallData.push({ 
    name: "VMI", 
    base: runningTotal - results.vmiDisposition, 
    value: results.vmiDisposition, 
    color: "#f97316", 
    label: `-${formatCompact(results.vmiDisposition)}`,
    isEndpoint: false
  });
  runningTotal -= results.vmiDisposition;
  
  waterfallData.push({ 
    name: "Dedup", 
    base: runningTotal - results.deduplication, 
    value: results.deduplication, 
    color: "#ec4899", 
    label: `-${formatCompact(results.deduplication)}`,
    isEndpoint: false
  });
  
  waterfallData.push({ 
    name: "Optimal", 
    base: 0, 
    value: optimalInventory, 
    color: "#1e3a5f", 
    label: formatCompact(optimalInventory),
    isEndpoint: true
  });

  const breakdownItems = [
    {
      name: "Active Material Value Increases",
      value: activeIncreases,
      color: "#ef4444",
      icon: TrendingUp,
      description: "Reducing risk by increasing critical materials",
      isIncrease: true
    },
    {
      name: "Active Material Value Decreases",
      value: activeDecreases,
      color: "#3b82f6",
      icon: TrendingDown,
      description: "Right-sizing active stock levels",
      isIncrease: false
    },
    {
      name: "Network Optimization & Transfer Opportunity",
      value: results.networkOptimization,
      color: "#8b5cf6",
      icon: Network,
      description: "Cross-site inventory balancing",
      isIncrease: false
    },
    {
      name: "VMI Disposition",
      value: results.vmiDisposition,
      color: "#f97316",
      icon: Package,
      description: "Vendor-managed inventory opportunities",
      isIncrease: false
    },
    {
      name: "Deduplication Savings",
      value: results.deduplication,
      color: "#ec4899",
      icon: Layers,
      description: "Eliminating duplicate safety stock",
      isIncrease: false
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
        <div>
          <img src="/verusen-logo.png" alt="Verusen" className="h-6 mb-3" />
          <h2 className="text-3xl font-bold pb-4 border-b-4 border-accent inline-block">
            MRO Inventory Calculator
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl">
            Powered by Verusen AI, this directional estimate illustrates how improved MRO visibility and optimization can unlock measurable inventory value across your network.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Optimization Opportunity</p>
          <p className="text-3xl font-extrabold text-primary">{formatCurrency(totalOptimization)}</p>
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
                    <YAxis hide domain={[0, totalInventoryValue * 1.1]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                    {/* Invisible base bar */}
                    <Bar dataKey="base" stackId="stack" fill="transparent" />
                    {/* Visible value bar */}
                    <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
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
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                  >
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <p 
                      className="text-sm font-bold flex-shrink-0" 
                      style={{ color: item.color }}
                    >
                      {item.isIncrease ? '+' : '-'}{formatCurrency(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">
          * Estimates are based on industry benchmarks and high-level inputs. Actual results may vary based on data quality and operational constraints.
        </p>
      </div>
    </div>
  );
}
