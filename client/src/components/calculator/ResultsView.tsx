import { type CalculationResult, type CalculatorInputs, type PainPoint } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, Phone, RotateCcw, Award, ArrowLeft, Info } from "lucide-react";
import { JourneyChart } from "./JourneyChart";
import { jsPDF } from "jspdf";

interface ResultsViewProps {
  results: CalculationResult;
  inputs: CalculatorInputs;
  selectedPains: Set<PainPoint>;
  onReset: () => void;
  onAdjustInputs: () => void;
  totalInventoryValue: number;
}

const fmt = (n: number) => {
  if (!n || isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString('en-US');
};

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

export function ResultsView({ results, inputs, selectedPains, onReset, onAdjustInputs, totalInventoryValue }: ResultsViewProps) {
  const hasInv = selectedPains.has("inventory");
  const hasSpend = selectedPains.has("spend");
  const hasDowntime = selectedPains.has("downtime");

  const buckets = [
    hasInv && results.inventory ? { label: "Active Material Increases", color: "#ed9b29", value: results.inventory.activeIncrease } : null,
    hasInv && results.inventory ? { label: "Inventory Reduction Savings", color: "#3ec26d", value: results.inventory.totalInvReduction } : null,
    hasSpend && results.spend ? { label: "Spend Reduction/Avoidance", color: "#0075c9", value: results.spend.totalSpend } : null,
    hasDowntime && results.downtime ? { label: "Downtime Reduction", color: "#6b7280", value: results.downtime.dtSavings } : null,
  ].filter(Boolean) as { label: string; color: string; value: number }[];

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 50, 82);
    doc.rect(0, 0, pw, 50, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("MRO Optimization Calculator", 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 220);
    doc.text("Powered by Verusen AI", 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 220);
    doc.text("Total Estimated Annual Opportunity", pw - 20, 20, { align: "right" });
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(fmt(results.grandTotal), pw - 20, 35, { align: "right" });

    let y = 60;
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, y, pw - 30, 25, 3, 3, "F");
    doc.text("INPUT PROFILE", 20, y + 8);
    y += 14;
    doc.setTextColor(60, 60, 60);
    doc.text(`Sites: ${inputs.siteCount}  |  Inventory: ${fmt(inputs.totalInventoryValue)}  |  SKUs: ${fmtInt(inputs.skuCount)}  |  Active: ${inputs.activePercent}%  Non-Moving: ${inputs.obsoletePercent}%  Special: ${inputs.specialPercent}%`, 20, y);

    y += 20;
    if (hasInv && results.inventory) {
      doc.setFontSize(11);
      doc.setTextColor(0, 50, 82);
      doc.text("Inventory Reduction: " + fmt(results.inventory.totalInvReduction), 20, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Risk Investment: +${fmt(results.inventory.activeIncrease)}  |  Active Reduction: ${fmt(results.inventory.activeDecrease)}  |  Pooling: ${fmt(results.inventory.pooling)}  |  VMI: ${fmt(results.inventory.vmi)}  |  Dedup: ${fmt(results.inventory.dedup)}`, 20, y);
      y += 12;
    }
    if (hasSpend && results.spend) {
      doc.setFontSize(11);
      doc.setTextColor(0, 50, 82);
      doc.text("Spend Reduction: " + fmt(results.spend.totalSpend), 20, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Holding: ${fmt(results.spend.holdingSavings)}  |  WACC: ${fmt(results.spend.waccSavings)}  |  PPV: ${fmt(results.spend.ppvSavings)}  |  Replen: ${fmt(results.spend.replenishmentSuppression)}`, 20, y);
      y += 12;
    }
    if (hasDowntime && results.downtime) {
      doc.setFontSize(11);
      doc.setTextColor(0, 50, 82);
      doc.text("Downtime Savings: " + fmt(results.downtime.dtSavings), 20, y);
      y += 12;
    }

    y += 5;
    doc.setFillColor(0, 50, 82);
    doc.roundedRect(15, y, pw - 30, 25, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Ready to unlock your MRO optimization potential?", pw / 2, y + 10, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 220);
    doc.text("Visit verusen.com or talk to an expert today.", pw / 2, y + 18, { align: "center" });
    doc.save("MRO-Optimization-Results.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#003252] rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-[#0075c9]/15" />
        <p className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium" data-testid="text-results-label">
          Total MRO Optimization Opportunity
        </p>
        <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 relative" data-testid="text-grand-total">
          {fmt(results.grandTotal)}
        </p>
        <p className="text-sm text-white/70 relative max-w-2xl leading-relaxed">
          Powered by your data, Verusen's advanced AI modeling, and industry benchmarks, this analysis reveals hidden stockout risks and untapped savings opportunities across your MRO inventory.
        </p>

        <div className={`mt-6 grid gap-px rounded-lg overflow-hidden border border-white/15`} style={{ gridTemplateColumns: `repeat(${buckets.length}, 1fr)` }}>
          {buckets.map((b) => (
            <div key={b.label} className="bg-white/5 backdrop-blur px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1 leading-tight">{b.label}</p>
              <p className="text-base md:text-lg font-bold whitespace-nowrap" style={{ color: b.color }}>{fmt(b.value)}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onAdjustInputs}
          className="mt-4 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded px-4 py-2 transition-all flex items-center gap-2"
          data-testid="button-adjust-inputs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Adjust my inputs
        </button>
      </div>

      <JourneyChart results={results} selectedPains={selectedPains} totalInventoryValue={totalInventoryValue} />

      {hasInv && results.inventory && (
        <ResultSection
          title="Inventory Imbalance"
          icon="📦"
          color="green"
          totalLabel="Total Inventory Value Reduction Opportunity"
          totalSub="One-time reduction in on-hand inventory value through right-sizing initiatives"
          totalValue={results.inventory.totalInvReduction}
          riskLabel="Active Materials Increase"
          riskSub="Active material investment to cover critical stockout gaps"
          riskValue={results.inventory.activeIncrease}
          breakdownLabel={`Components of the ${fmt(results.inventory.totalInvReduction)} inventory reduction`}
          rows={[
            { name: "Active Material Reduction", desc: "Excess active & slow-moving stock removed from balance sheet", value: results.inventory.activeDecrease },
            { name: "Deduplication", desc: "Cross-site SKU rationalization eliminates duplicate stock holdings", value: results.inventory.dedup },
            { name: "Parts Pooling & Network Sharing", desc: "Consolidated cross-site inventory reduces per-site overstocking", value: results.inventory.pooling },
            { name: "VMI Disposition", desc: "Vendor-managed inventory transfers stock ownership off your books", value: results.inventory.vmi },
          ]}
          totalRowValue={results.inventory.totalInvReduction}
        />
      )}

      {hasSpend && results.spend && (
        <ResultSection
          title="Spend Leakage"
          icon="💸"
          color="blue"
          totalLabel="Total Annual Spend Reduction & Avoidance"
          totalSub="Ongoing annual savings from eliminating leakage across your MRO spend categories"
          totalValue={results.spend.totalSpend}
          breakdownLabel={`Components of the ${fmt(results.spend.totalSpend)} annual spend reduction`}
          rows={[
            { name: "Carrying / Holding Cost Savings", desc: "Annual cost of carrying inventory eliminated as on-hand value drops", value: results.spend.holdingSavings },
            { name: "WACC Savings", desc: "Capital cost freed as inventory reduction releases working capital", value: results.spend.waccSavings },
            { name: "PPV & Tailspend Savings", desc: "Price variance and tail spend consolidation through supplier rationalization", value: results.spend.ppvSavings },
            { name: "Replenishment Suppression", desc: "Reduced reorder activity as optimized inventory eliminates unnecessary restocking", value: results.spend.replenishmentSuppression },
            { name: "Additional Repairable Materials", desc: "Parts identified as repairable rather than replaced, reducing new spend", value: results.spend.repairableMaterials },
            { name: "Expediting Cost Reduction", desc: "Emergency and rush order costs avoided through better stock positioning", value: results.spend.expediting },
          ]}
          totalRowValue={results.spend.totalSpend}
        />
      )}

      {hasDowntime && results.downtime && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280] bg-gray-50 px-4 py-2.5 rounded-t-lg border border-gray-200 border-b-0">
            <span>⚠️</span> Downtime Risk
          </div>
          <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
            <div>
              <p className="font-semibold text-[#003252]">Total Estimated Downtime Cost Avoidance</p>
              <p className="text-xs text-muted-foreground">Annual savings from reducing stockout-driven unplanned downtime</p>
            </div>
            <p className="text-2xl font-bold text-[#6b7280]" data-testid="text-dt-savings">{fmt(results.downtime.dtSavings)}</p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-gray-50 px-4 py-2 border border-gray-200 border-t-0">
            How this savings is calculated — current vs. optimized state
          </div>
          <table className="w-full text-sm border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
            <thead>
              <tr className="bg-white">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Metric</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Current State</th>
                <th className="text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider px-4 py-2 border-b border-gray-200">Optimized State</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Org-Wide Unplanned Downtime Hours</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtInt(results.downtime.orgDtHours)} hrs</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#6b7280] font-medium">{fmtInt(results.downtime.optimizedDtHours)} hrs</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Total Unplanned Downtime Cost</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmt(results.downtime.unplannedCost)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#6b7280] font-medium">{fmt(results.downtime.optimizedDtCost)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Critical Spares Stockout Rate</td>
                <td className="px-4 py-2.5 text-muted-foreground">{(results.downtime.curStockoutRate * 100).toFixed(0)}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#6b7280] font-medium">{(results.downtime.tgtStockoutRate * 100).toFixed(0)}%</td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-[#003252]" colSpan={2}>Avoidable Downtime Cost (stockout-attributed portion)</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#6b7280]">{fmt(results.downtime.dtSavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 mb-8 text-sm text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#003252]">How we calculated this.</strong> Sliding factors for Parts Pooling, VMI, Deduplication, and PPV Savings scale with your number of sites and SKU count using conservative industry benchmarks. Inventory mix defaults to 67% active/slow, 23% non-moving, 10% special items. Downtime savings use your service level inputs directly per the stockout rate optimization formula. Your actual results may vary.
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 md:p-10 text-center border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-[#003252] mb-4">What's Next?</h3>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Most organizations underestimate how much inventory value is tied up across sites, SKUs, and material categories. A deeper conversation typically reveals even greater opportunity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <Button size="lg" className="h-12 px-8 bg-[#003252] hover:bg-[#003252]/90" asChild>
            <a href="https://verusen.com/talk-to-an-mro-expert/" target="_blank" rel="noopener noreferrer">
              <Phone className="mr-2 h-4 w-4" /> Talk to an Expert
            </a>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8" asChild>
            <a href="https://verusen.com/mro-inventory-optimization-platforms-compared-why-verusen-outperforms-sap-ibm-xtivity-and-sparetech-in-2025/" target="_blank" rel="noopener noreferrer">
              <Award className="mr-2 h-4 w-4" /> Learn Why Customers Choose Verusen
            </a>
          </Button>
          <Button size="lg" variant="ghost" className="h-12 px-8 text-muted-foreground" onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" /> Download Results
          </Button>
        </div>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground" data-testid="button-start-over">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  icon,
  color,
  totalLabel,
  totalSub,
  totalValue,
  riskLabel,
  riskSub,
  riskValue,
  breakdownLabel,
  rows,
  totalRowValue,
}: {
  title: string;
  icon: string;
  color: "green" | "blue";
  totalLabel: string;
  totalSub: string;
  totalValue: number;
  riskLabel?: string;
  riskSub?: string;
  riskValue?: number;
  breakdownLabel: string;
  rows: { name: string; desc: string; value: number }[];
  totalRowValue: number;
}) {
  const colorClass = color === "green" ? "text-[#3ec26d]" : "text-[#0075c9]";
  const headerBg = color === "green" ? "bg-[#3ec26d]/5 text-[#3ec26d] border-[#3ec26d]/20" : "bg-[#0075c9]/5 text-[#0075c9] border-[#0075c9]/20";

  return (
    <div className="mb-8">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-t-lg border border-b-0 ${headerBg}`}>
        <span>{icon}</span> {title}
      </div>

      <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
        <div>
          <p className="font-semibold text-[#003252]">{totalLabel}</p>
          <p className="text-xs text-muted-foreground">{totalSub}</p>
        </div>
        <p className={`text-2xl font-bold ${colorClass}`}>{fmt(totalValue)}</p>
      </div>

      {riskLabel && riskValue !== undefined && (
        <div className="flex items-center justify-between p-5 bg-[#ed9b29]/5 border border-gray-200 border-t-0">
          <div>
            <p className="font-semibold text-[#003252]">⚠ {riskLabel}</p>
            <p className="text-xs text-muted-foreground">{riskSub}</p>
          </div>
          <p className="text-2xl font-bold text-[#ed9b29]">{fmt(riskValue)}</p>
        </div>
      )}

      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-gray-50 px-4 py-2 border border-gray-200 border-t-0">
        {breakdownLabel}
      </div>
      <table className="w-full text-sm border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
        <thead>
          <tr className="bg-white">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Initiative</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Description</th>
            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200 w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-4 py-2.5 font-medium text-[#003252] whitespace-nowrap">{row.name}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{row.desc}</td>
              <td className={`px-4 py-2.5 text-right font-mono font-medium ${colorClass}`}>{fmt(row.value)}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-4 py-2.5 text-[#003252]" colSpan={2}>Total</td>
            <td className={`px-4 py-2.5 text-right font-mono ${colorClass}`}>{fmt(totalRowValue)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
