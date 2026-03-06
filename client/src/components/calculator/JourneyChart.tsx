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

type PointColor = "#ed9b29" | "#3ec26d" | "#0075c9" | "#003252" | "#6b7280";

interface ChartPoint {
  label: string;
  value: number;
  tip: string;
  color: PointColor;
}

export function JourneyChart({ results, selectedPains, totalInventoryValue }: JourneyChartProps) {
  const hasInv = selectedPains.has("inventory");
  const hasSpend = selectedPains.has("spend");

  if (!hasInv && !hasSpend) return null;

  const inv = results.inventory;
  const spend = results.spend;

  const points: ChartPoint[] = [];
  let cur = totalInventoryValue;

  points.push({ label: "Now", value: cur, tip: `Starting On-Hand: ${fmt(cur)}`, color: "#003252" });

  if (hasInv && inv) {
    cur += inv.activeIncrease;
    points.push({ label: "Active+", value: cur, tip: `Active Material Increases: +${fmt(inv.activeIncrease)}`, color: "#6b7280" });

    cur -= inv.activeDecrease;
    points.push({ label: "Active-", value: cur, tip: `Active Material Decreases: -${fmt(inv.activeDecrease)}`, color: "#3ec26d" });

    cur -= inv.pooling;
    points.push({ label: "Pooling", value: cur, tip: `Parts Pooling: -${fmt(inv.pooling)}`, color: "#3ec26d" });
  }

  if (hasInv && inv) {
    cur -= inv.vmi;
    points.push({ label: "VMI", value: cur, tip: `VMI Disposition: -${fmt(inv.vmi)}`, color: "#3ec26d" });

    cur -= inv.dedup;
    points.push({ label: "Dedup", value: cur, tip: `Deduplication: -${fmt(inv.dedup)}`, color: "#3ec26d" });
  }

  const improvedVal = Math.max(cur, 0);
  points.push({ label: "Mo. 12", value: improvedVal, tip: `Improved On-Hand: ${fmt(improvedVal)}`, color: "#003252" });

  if (hasSpend && spend) {
    const additionalAvoidance = spend.holdingSavings + spend.waccSavings + spend.replenishmentSuppression + spend.expediting;
    const midV = Math.max(cur - additionalAvoidance / 2, 0);
    points.push({ label: "Mo. 18", value: midV, tip: `Additional Avoidance: -${fmt(additionalAvoidance)}/yr`, color: "#0075c9" });

    cur = Math.max(cur - additionalAvoidance, 0);
    points.push({ label: "Mo. 24", value: cur, tip: `Optimal On-Hand Inv: ${fmt(cur)}`, color: "#003252" });
    points.push({ label: "Long Term", value: cur, tip: `Optimal On-Hand Inv: ${fmt(cur)}`, color: "#003252" });
  }

  const lastIdx = points.length - 1;
  const data = points.map((p, i) => ({ name: p.label, value: Math.max(p.value, 0), tip: p.tip, barColor: p.color, isLast: i === lastIdx }));

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

  const DotWithArrow = (props: any) => {
    const { x, y, width, payload } = props;
    if (x === undefined || y === undefined) return null;
    const cx = x + width / 2;
    const cy = y;

    if (payload.isLast) {
      return (
        <g>
          <polygon
            points={`${cx + 12},${cy} ${cx - 4},${cy - 7} ${cx - 4},${cy + 7}`}
            fill={payload.barColor || "#003252"}
            stroke="white"
            strokeWidth={1.5}
          />
        </g>
      );
    }
    return (
      <circle cx={cx} cy={cy} r={5} fill={payload.barColor || "#003252"} stroke="white" strokeWidth={2} />
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

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 20, left: 20, bottom: 5 }}>
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
              <Bar dataKey="value" radius={[4, 4, 0, 0]} shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                return (
                  <g>
                    <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={payload.barColor} opacity={0.85} />
                    <DotWithArrow x={x} y={y} width={width} payload={payload} />
                  </g>
                );
              }}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
