import { type CalculationResult } from "@/lib/calculator-logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, Phone, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsViewProps {
  results: CalculationResult;
}

export function ResultsView({ results }: ResultsViewProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const chartData = [
    { name: "Active Opt.", value: results.activeOptimization, color: "hsl(var(--chart-1))" },
    { name: "Network", value: results.networkOptimization, color: "hsl(var(--chart-2))" },
    { name: "Deduplication", value: results.deduplication, color: "hsl(var(--chart-3))" },
    { name: "VMI", value: results.vmiDisposition, color: "hsl(var(--chart-4))" },
    { name: "Obsolete", value: results.obsoleteReduction, color: "hsl(var(--chart-5))" },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Your Estimated Inventory Value Opportunity</h2>
        <p className="text-muted-foreground">
          Based on your inputs, here’s a directional estimate of value you could unlock.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Main Highlight */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="lg:col-span-1"
        >
          <Card className="h-full bg-primary text-primary-foreground border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-blue-100 font-medium text-lg">Total Reduction Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[calc(100%-4rem)]">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">
                {formatCurrency(results.totalReduction)}
              </div>
              <p className="text-blue-200 text-sm">
                Potential working capital release
              </p>
              
              <div className="mt-8 space-y-3">
                 <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                   <span>Obsolete Reduction</span>
                   <span className="font-bold">{formatCurrency(results.obsoleteReduction)}</span>
                 </div>
                 <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                   <span>Network Optimization</span>
                   <span className="font-bold">{formatCurrency(results.networkOptimization)}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Optimization Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Network Transfers</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(results.networkOptimization)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">VMI Disposition</div>
            <div className="text-2xl font-bold text-teal-600">{formatCurrency(results.vmiDisposition)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Deduplication</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(results.deduplication)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Active Opt.</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(results.activeOptimization)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Value Reinforcement & CTA */}
      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center border border-border/50">
        <h3 className="text-2xl font-bold mb-4">Want a More Accurate View?</h3>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Most organizations uncover even more value with a deeper analysis — including hidden duplication, misclassified materials, and underutilized inventory.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="h-12 px-8">
            <FileText className="mr-2 h-4 w-4" /> Request Assessment
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8">
            <Phone className="mr-2 h-4 w-4" /> Talk to an Expert
          </Button>
          <Button size="lg" variant="ghost" className="h-12 px-8 text-muted-foreground">
            <Download className="mr-2 h-4 w-4" /> Download Results
          </Button>
        </div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-8">
        * Estimates are based on industry benchmarks and high-level inputs. Actual results may vary based on data quality and operational constraints.
      </p>
    </div>
  );
}
