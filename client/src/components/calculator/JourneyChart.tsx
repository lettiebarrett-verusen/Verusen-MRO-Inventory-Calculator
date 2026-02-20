import { type CalculationResult, type PainPoint } from "@/lib/calculator-logic";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface JourneyChartProps {
  results: CalculationResult;
  selectedPains: Set<PainPoint>;
  totalInventoryValue: number;
}

const fmt = (n: number) => {
  if (!n || isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString('en-US');
};

const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
};

export function JourneyChart({ results, selectedPains, totalInventoryValue }: JourneyChartProps) {
  const hasInv = selectedPains.has("inventory");
  const hasSpend = selectedPains.has("spend");
  const hasDowntime = selectedPains.has("downtime");

  if (!hasInv && !hasSpend) return null;

  const inv = results.inventory;
  const spend = results.spend;

  const points: { label: string; value: number; tip: string }[] = [];
  let cur = totalInventoryValue;

  points.push({ label: "Now", value: cur, tip: `Starting On-Hand: ${fmt(cur)}` });

  if (hasInv && inv) {
    cur += inv.activeIncrease;
    points.push({ label: "Active+", value: cur, tip: `Active Material Increases: +${fmt(inv.activeIncrease)}` });

    cur -= inv.activeDecrease;
    points.push({ label: "Active-", value: cur, tip: `Active Material Decreases: -${fmt(inv.activeDecrease)}` });

    cur -= inv.pooling;
    points.push({ label: "Pooling", value: cur, tip: `Parts Pooling: -${fmt(inv.pooling)}` });
  }

  if (hasSpend && spend) {
    cur -= spend.repairableMaterials;
    points.push({ label: "Repairable", value: cur, tip: `Repairable Materials: -${fmt(spend.repairableMaterials)}` });
  }

  if (hasInv && inv) {
    cur -= inv.vmi;
    points.push({ label: "VMI", value: cur, tip: `VMI Disposition: -${fmt(inv.vmi)}` });

    cur -= inv.dedup;
    points.push({ label: "Dedup", value: cur, tip: `Deduplication: -${fmt(inv.dedup)}` });
  }

  if (hasSpend && spend) {
    cur -= spend.ppvSavings;
    points.push({ label: "PPV", value: cur, tip: `PPV & Tailspend: -${fmt(spend.ppvSavings)}` });
  }

  const improvedVal = Math.max(cur, 0);
  points.push({ label: "Mo. 12", value: improvedVal, tip: `Improved On-Hand: ${fmt(improvedVal)}` });

  if (hasSpend && spend) {
    const additionalAvoidance = spend.holdingSavings + spend.waccSavings + spend.replenishmentSuppression + spend.expediting;
    const midV = Math.max(cur - additionalAvoidance / 2, 0);
    points.push({ label: "Mo. 18", value: midV, tip: `Additional Avoidance: ${fmt(additionalAvoidance)}/yr` });

    cur = Math.max(cur - additionalAvoidance, 0);
    points.push({ label: "Mo. 24", value: cur, tip: `Optimal: ${fmt(cur)}` });
    points.push({ label: "Long Term", value: cur, tip: "Ongoing savings maintained" });
  }

  const data = points.map(p => ({ name: p.label, value: Math.max(p.value, 0), tip: p.tip }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#003252] text-white rounded-lg px-4 py-3 shadow-lg text-sm max-w-xs">
          <p className="font-semibold mb-1">{d.name}</p>
          <p className="text-white/80">{d.tip}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#003252]">MRO Roadmap</h3>
            <p className="text-xs text-muted-foreground">Projected value trajectory through Month 12 and beyond</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active Material Increases", color: "#ed9b29" },
              { label: "Inventory Reduction", color: "#3ec26d" },
              { label: "Spend Reduction", color: "#0075c9" },
              ...(hasDowntime ? [{ label: "Downtime Reduction", color: "#6b7280" }] : []),
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmtCompact(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#003252"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#003252", stroke: "white", strokeWidth: 2 }}
                activeDot={{ r: 8, fill: "#0075c9", stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
