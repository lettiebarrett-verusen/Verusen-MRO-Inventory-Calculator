import { useRef } from "react";
import { type CalculationResult, type CalculatorInputs, type PainPoint } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, Phone, RotateCcw, Brain, ArrowLeft, Info } from "lucide-react";
import { JourneyChart } from "./JourneyChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  const resultsRef = useRef<HTMLDivElement>(null);

  const buckets = [
    hasInv && results.inventory ? { label: "Active Material Increases", color: "#6b7280", value: results.inventory.activeIncrease } : null,
    hasInv && results.inventory ? { label: "Inventory\nReduction", color: "#3ec26d", value: results.inventory.totalInvReduction } : null,
    hasSpend && results.spend ? { label: "Spend Reduction/Avoidance", color: "#0075c9", value: results.spend.totalSpend } : null,
    hasDowntime && results.downtime ? { label: "Downtime\nReduction", color: "#ed9b29", value: results.downtime.dtSavings } : null,
  ].filter(Boolean) as { label: string; color: string; value: number }[];

  const downloadPDF = async () => {
    const el = resultsRef.current;
    if (!el) return;

    const adjustBtn = el.querySelector('[data-testid="button-adjust-inputs"]') as HTMLElement | null;
    const footerBtns = el.querySelector('[data-pdf-hide="true"]') as HTMLElement | null;
    if (adjustBtn) adjustBtn.style.display = 'none';
    if (footerBtns) footerBtns.style.display = 'none';

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgW = canvas.width;
      const imgH = canvas.height;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentW = pw - margin * 2;
      const ratio = contentW / imgW;
      const scaledH = imgH * ratio;

      const pageContentH = ph - margin * 2;
      const totalPages = Math.ceil(scaledH / pageContentH);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();

        const srcY = (page * pageContentH) / ratio;
        const srcH = Math.min(pageContentH / ratio, imgH - srcY);
        const destH = srcH * ratio;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgW;
        sliceCanvas.height = Math.round(srcH);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, Math.round(srcY), imgW, Math.round(srcH), 0, 0, imgW, Math.round(srcH));
          const sliceData = sliceCanvas.toDataURL('image/png');
          doc.addImage(sliceData, 'PNG', margin, margin, contentW, destH);
        }
      }

      doc.save("Verusen AI for MRO Optimization Savings.pdf");
    } finally {
      if (adjustBtn) adjustBtn.style.display = '';
      if (footerBtns) footerBtns.style.display = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto" ref={resultsRef}>
      <div className="bg-[#003252] rounded-xl p-8 mb-8 relative overflow-hidden text-center">
        <p className="text-sm uppercase tracking-widest text-white mb-3 font-semibold" data-testid="text-results-label">
          Total MRO Optimization Opportunity
        </p>
        <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 relative" data-testid="text-grand-total">
          {fmt(results.grandTotal)}
        </p>
        <p className="text-sm text-white/70 relative max-w-2xl mx-auto leading-relaxed">
          Powered by your data, Verusen's advanced AI modeling, and industry benchmarks, this analysis reveals hidden stockout risks and untapped savings opportunities across your MRO inventory.
        </p>

        <div className={`mt-6 grid gap-px rounded-lg overflow-hidden border border-white/15`} style={{ gridTemplateColumns: `repeat(${buckets.length}, 1fr)` }}>
          {buckets.map((b) => (
            <div key={b.label} className="bg-white/5 backdrop-blur px-3 py-3 text-center">
              <p className="text-lg md:text-xl font-bold whitespace-nowrap mb-1" style={{ color: b.color, filter: "brightness(1.3)" }}>{fmt(b.value)}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/90 leading-tight whitespace-pre-line">{b.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onAdjustInputs}
          className="mt-4 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded px-4 py-2 transition-all inline-flex items-center gap-2"
          data-testid="button-adjust-inputs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Adjust my inputs
        </button>
      </div>

      {hasInv && results.inventory && (
        <ResultSection
          title="MRO Inventory Optimization"
          chart={<JourneyChart results={results} selectedPains={selectedPains} totalInventoryValue={totalInventoryValue} />}
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

      {hasSpend && results.spend && hasInv && <div className="border-t-2 border-gray-200 my-10" />}
      {hasSpend && results.spend && !hasInv && (
        <JourneyChart results={results} selectedPains={selectedPains} totalInventoryValue={totalInventoryValue} />
      )}
      {hasSpend && results.spend && (
        <ResultSection
          title="Spend Reduction/Avoidance"
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

      {hasDowntime && results.downtime && (hasInv || hasSpend) && <div className="border-t-2 border-gray-200 my-10" />}
      {hasDowntime && results.downtime && !hasInv && !hasSpend && (
        <JourneyChart results={results} selectedPains={selectedPains} totalInventoryValue={totalInventoryValue} />
      )}
      {hasDowntime && results.downtime && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ed9b29] bg-[#ed9b29]/5 px-4 py-2.5 rounded-t-lg border border-[#ed9b29]/20 border-b-0">
            <span>⚠️</span> Downtime Avoidance
          </div>
          <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
            <div>
              <p className="font-semibold text-[#003252]">Total Estimated Downtime Cost Avoidance</p>
              <p className="text-xs text-muted-foreground">Annual savings from reducing stockout-driven unplanned downtime</p>
            </div>
            <p className="text-2xl font-bold text-[#ed9b29]" data-testid="text-dt-savings">{fmt(results.downtime.dtSavings)}</p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-gray-50 px-4 py-2 border border-gray-200 border-t-0">
            How this savings is calculated — current vs. optimized state
          </div>
          <table className="w-full text-sm border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
            <thead>
              <tr className="bg-white">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Metric</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-gray-200">Current State</th>
                <th className="text-right text-xs font-medium text-[#ed9b29] uppercase tracking-wider px-4 py-2 border-b border-gray-200">Optimized State</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Org-Wide Unplanned Downtime Hours</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtInt(results.downtime.orgDtHours)} hrs</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#ed9b29] font-medium">{fmtInt(results.downtime.optimizedDtHours)} hrs</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Total Unplanned Downtime Cost</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmt(results.downtime.unplannedCost)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#ed9b29] font-medium">{fmt(results.downtime.optimizedDtCost)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2.5 font-medium text-[#003252]">Critical Spares Stockout Rate</td>
                <td className="px-4 py-2.5 text-muted-foreground">{(results.downtime.curStockoutRate * 100).toFixed(0)}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#ed9b29] font-medium">{(results.downtime.tgtStockoutRate * 100).toFixed(0)}%</td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-[#003252]" colSpan={2}>Avoidable Downtime Cost (stockout-attributed portion)</td>
                <td className="px-4 py-2.5 text-right font-mono text-[#ed9b29]">{fmt(results.downtime.dtSavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 mb-8 text-sm text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#003252]">How we calculated this.</strong> Estimates are based on your inputs and proven benchmarks, where customers have achieved 20% lower working capital and a 2.8% increase in asset uptime within months. Results may vary.
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 md:p-10 text-center border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-[#003252] mb-4">What's Next?</h3>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Most teams underestimate how much inventory value is tied up across their enterprise. A deeper conversation typically reveals even greater opportunity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
          <Button size="lg" className="h-14 flex-1 text-base font-bold bg-[#3ec26d] hover:bg-[#35a85e] shadow-lg shadow-[#3ec26d]/25 transition-all justify-center" asChild>
            <a href="https://verusen.com/talk-to-an-mro-expert/" target="_blank" rel="noopener noreferrer">
              <Phone className="mr-2 h-5 w-5" /> Talk to an MRO Expert
            </a>
          </Button>
          <Button size="lg" className="h-14 flex-1 text-base font-bold bg-[#003252] hover:bg-[#003252]/90 shadow-lg shadow-[#003252]/25 transition-all justify-center" asChild>
            <a href="https://verusen.com/ai-agent-explainability-for-mro-inventory-optimization/" target="_blank" rel="noopener noreferrer">
              <Brain className="mr-2 h-5 w-5" /> Explore the AI
            </a>
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-6" data-pdf-hide="true">
        <button className="text-sm text-muted-foreground hover:text-[#003252] transition-colors flex items-center gap-1.5" onClick={downloadPDF}>
          <Download className="w-3.5 h-3.5" /> Download Results
        </button>
        <button className="text-sm text-muted-foreground hover:text-[#003252] transition-colors flex items-center gap-1.5" onClick={onReset} data-testid="button-start-over">
          <RotateCcw className="w-3.5 h-3.5" /> Start Over
        </button>
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
  chart,
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
  chart?: React.ReactNode;
}) {
  const colorClass = color === "green" ? "text-[#3ec26d]" : "text-[#0075c9]";
  const headerBg = color === "green" ? "bg-[#3ec26d]/5 text-[#3ec26d] border-[#3ec26d]/20" : "bg-[#0075c9]/5 text-[#0075c9] border-[#0075c9]/20";

  return (
    <div className="mb-8">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-t-lg border border-b-0 ${headerBg}`}>
        <span>{icon}</span> {title}
      </div>

      {chart && (
        <div className="border border-gray-200 border-t-0 bg-white p-4">
          {chart}
        </div>
      )}

      <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
        <div>
          <p className="font-semibold text-[#003252]">{totalLabel}</p>
          <p className="text-xs text-muted-foreground">{totalSub}</p>
        </div>
        <p className={`text-2xl font-bold ${colorClass}`}>{fmt(totalValue)}</p>
      </div>

      {riskLabel && riskValue !== undefined && (
        <div className="flex items-center justify-between p-5 bg-[#6b7280]/5 border border-gray-200 border-t-0">
          <div>
            <p className="font-semibold text-[#003252]">⚠ {riskLabel}</p>
            <p className="text-xs text-muted-foreground">{riskSub}</p>
          </div>
          <p className="text-2xl font-bold text-[#6b7280]">{fmt(riskValue)}</p>
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
