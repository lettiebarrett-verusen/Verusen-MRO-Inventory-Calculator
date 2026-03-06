import { type CalculationResult, type PainPoint } from "@/lib/calculator-logic";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

interface WaterfallPoint {
  name: string;
  base: number;
  change: number;
  total: number;
  tip: string;
  color: string;
  isTotal: boolean;
  isLast: boolean;
}

export function JourneyChart({ results, selectedPains, totalInventoryValue }: JourneyChartProps) {
  const hasInv = selectedPains.has("inventory");
  const hasSpend = selectedPains.has("spend");

  if (!hasInv && !hasSpend) return null;

  const inv = results.inventory;
  const spend = results.spend;

  const steps: { label: string; delta: number; color: string; tip: string; isTotal?: boolean }[] = [];
  let cur = totalInventoryValue;

  steps.push({ label: "Now", delta: cur, color: "#003252", tip: `Starting On-Hand: ${fmt(cur)}`, isTotal: true });

  if (hasInv && inv) {
    steps.push({ label: "Active+", delta: inv.activeIncrease, color: "#6b7280", tip: `Active Material Increases: +${fmt(inv.activeIncrease)}` });
    cur += inv.activeIncrease;

    steps.push({ label: "Active-", delta: -inv.activeDecrease, color: "#3ec26d", tip: `Active Material Decreases: -${fmt(inv.activeDecrease)}` });
    cur -= inv.activeDecrease;

    steps.push({ label: "Pooling", delta: -inv.pooling, color: "#3ec26d", tip: `Parts Pooling: -${fmt(inv.pooling)}` });
    cur -= inv.pooling;

    steps.push({ label: "VMI", delta: -inv.vmi, color: "#3ec26d", tip: `VMI Disposition: -${fmt(inv.vmi)}` });
    cur -= inv.vmi;

    steps.push({ label: "Dedup", delta: -inv.dedup, color: "#3ec26d", tip: `Deduplication: -${fmt(inv.dedup)}` });
    cur -= inv.dedup;
  }

  const improvedVal = Math.max(cur, 0);
  steps.push({ label: "Mo. 12", delta: improvedVal, color: "#003252", tip: `Improved On-Hand: ${fmt(improvedVal)}`, isTotal: true });

  if (hasSpend && spend) {
    const additionalAvoidance = spend.holdingSavings + spend.waccSavings + spend.replenishmentSuppression + spend.expediting;

    steps.push({ label: "Mo. 18", delta: -additionalAvoidance / 2, color: "#0075c9", tip: `Additional Avoidance: -${fmt(additionalAvoidance)}/yr` });
    const mo18Val = Math.max(improvedVal - additionalAvoidance / 2, 0);

    const mo24Val = Math.max(improvedVal - additionalAvoidance, 0);
    steps.push({ label: "Mo. 24", delta: mo24Val, color: "#003252", tip: `Optimal On-Hand Inv: ${fmt(mo24Val)}`, isTotal: true });

    steps.push({ label: "Long Term", delta: mo24Val, color: "#003252", tip: `Optimal On-Hand Inv: ${fmt(mo24Val)}`, isTotal: true });
  }

  let running = 0;
  const data: WaterfallPoint[] = steps.map((s, i) => {
    const isLast = i === steps.length - 1;
    if (s.isTotal) {
      const point: WaterfallPoint = {
        name: s.label,
        base: 0,
        change: s.delta,
        total: s.delta,
        tip: s.tip,
        color: s.color,
        isTotal: true,
        isLast,
      };
      running = s.delta;
      return point;
    } else {
      const base = s.delta >= 0 ? running : running + s.delta;
      const change = Math.abs(s.delta);
      running += s.delta;
      return {
        name: s.label,
        base: Math.max(base, 0),
        change,
        total: running,
        tip: s.tip,
        color: s.color,
        isTotal: false,
        isLast,
      };
    }
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload;
      if (!d) return null;
      return (
        <div className="bg-[#003252] text-white rounded-lg px-4 py-3 shadow-lg text-sm max-w-xs">
          <p className="font-semibold mb-1">{d.name}</p>
          <p className="text-white/80">{d.tip}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.max(height, 1)} rx={3} ry={3} fill={payload.color} opacity={0.85} />
      </g>
    );
  };

  const legendItems = [
    ...(hasInv ? [{ label: "Active Material Increases", color: "#6b7280" }] : []),
    ...(hasInv ? [{ label: "Inventory Reduction", color: "#3ec26d" }] : []),
    ...(hasSpend ? [{ label: "Spend Reduction", color: "#0075c9" }] : []),
  ];

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#003252]">MRO Roadmap</h3>
            <p className="text-xs text-muted-foreground">Projected value trajectory achievable within 12 months and beyond</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {legendItems.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 20, left: 20, bottom: 5 }} stackOffset="none">
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
              <Bar dataKey="change" stackId="waterfall" isAnimationActive={false} shape={<CustomBar />}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
