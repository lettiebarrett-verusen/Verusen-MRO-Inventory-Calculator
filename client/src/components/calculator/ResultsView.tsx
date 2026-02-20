import { type CalculationResult, type CalculatorInputs, type PainPoint } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, Phone, RotateCcw, Brain, ArrowLeft, Info } from "lucide-react";
import { JourneyChart } from "./JourneyChart";
import { jsPDF } from "jspdf";
import { VERUSEN_LOGO_BASE64 } from "@/lib/verusen-logo";

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
    const ph = doc.internal.pageSize.getHeight();
    const mx = 15;
    const cw = pw - mx * 2;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b] as const;
    };

    const checkPage = (needed: number, y: number) => {
      if (y + needed > ph - 20) { doc.addPage(); return 30; }
      return y;
    };

    doc.setFillColor(0, 50, 82);
    doc.rect(0, 0, pw, 70, "F");
    try { doc.addImage(VERUSEN_LOGO_BASE64, "PNG", mx + 3, 5, 40, 9.6); } catch {}
    doc.setFontSize(7);
    doc.setTextColor(160, 185, 210);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pw - mx - 5, 11, { align: "right" });
    doc.setFontSize(8);
    doc.text("TOTAL MRO OPTIMIZATION OPPORTUNITY", mx + 5, 24);
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(fmt(results.grandTotal), mx + 5, 38);
    doc.setFontSize(8);
    doc.setTextColor(160, 185, 210);
    doc.text("Powered by your data, Verusen\u2019s advanced AI modeling, and industry benchmarks.", mx + 5, 48);

    const bucketW = cw / buckets.length;
    const bucketY = 56;
    buckets.forEach((b, i) => {
      const bx = mx + i * bucketW;
      doc.setFillColor(20, 60, 95);
      doc.rect(bx, bucketY, bucketW, 12, "F");
      doc.setFontSize(5.5);
      doc.setTextColor(160, 185, 210);
      doc.text(b.label.toUpperCase(), bx + 3, bucketY + 4);
      doc.setFontSize(9);
      const [cr, cg, cb] = hexToRgb(b.color);
      doc.setTextColor(cr, cg, cb);
      doc.text(fmt(b.value), bx + 3, bucketY + 10);
    });

    let y = 78;

    const drawSectionHeader = (title: string, _icon: string, color: string, yPos: number) => {
      const [r, g, b] = hexToRgb(color);
      doc.setFillColor(r + Math.round((255 - r) * 0.92), g + Math.round((255 - g) * 0.92), b + Math.round((255 - b) * 0.92));
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 8, "FD");
      doc.setFontSize(7);
      doc.setTextColor(r, g, b);
      doc.text(title.toUpperCase(), mx + 3, yPos + 5.5);
      return yPos + 8;
    };

    const drawTotalRow = (label: string, sub: string, value: number, color: string, yPos: number) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 14, "FD");
      doc.setFontSize(9);
      doc.setTextColor(0, 50, 82);
      doc.text(label, mx + 4, yPos + 6);
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text(sub, mx + 4, yPos + 11);
      const [r, g, b] = hexToRgb(color);
      doc.setFontSize(12);
      doc.setTextColor(r, g, b);
      doc.text(fmt(value), pw - mx - 4, yPos + 8, { align: "right" });
      return yPos + 14;
    };

    const drawRiskRow = (label: string, sub: string, value: number, yPos: number) => {
      doc.setFillColor(254, 249, 243);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 14, "FD");
      doc.setFontSize(9);
      doc.setTextColor(0, 50, 82);
      doc.text(`\u26A0 ${label}`, mx + 4, yPos + 6);
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text(sub, mx + 4, yPos + 11);
      doc.setFontSize(12);
      doc.setTextColor(237, 155, 41);
      doc.text(fmt(value), pw - mx - 4, yPos + 8, { align: "right" });
      return yPos + 14;
    };

    const drawBreakdownTable = (
      headerText: string,
      rows: { name: string; desc: string; value: number }[],
      total: number,
      color: string,
      yPos: number
    ) => {
      yPos = checkPage(10 + rows.length * 9 + 9, yPos);
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 7, "FD");
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text(headerText.toUpperCase(), mx + 4, yPos + 4.5);
      yPos += 7;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 6, "FD");
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text("INITIATIVE", mx + 4, yPos + 4);
      doc.text("DESCRIPTION", mx + 55, yPos + 4);
      doc.text("AMOUNT", pw - mx - 4, yPos + 4, { align: "right" });
      yPos += 6;

      const [cr, cg, cb] = hexToRgb(color);
      rows.forEach((row) => {
        yPos = checkPage(9, yPos);
        doc.setDrawColor(240, 240, 240);
        doc.rect(mx, yPos, cw, 9, "D");
        doc.setFontSize(7);
        doc.setTextColor(0, 50, 82);
        doc.text(row.name, mx + 4, yPos + 4);
        doc.setFontSize(6);
        doc.setTextColor(120, 120, 120);
        const descLines = doc.splitTextToSize(row.desc, 75);
        doc.text(descLines[0], mx + 55, yPos + 4);
        if (descLines[1]) doc.text(descLines[1], mx + 55, yPos + 7.5);
        doc.setFontSize(7);
        doc.setTextColor(cr, cg, cb);
        doc.text(fmt(row.value), pw - mx - 4, yPos + 5, { align: "right" });
        yPos += 9;
      });

      yPos = checkPage(8, yPos);
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, yPos, cw, 8, "FD");
      doc.setFontSize(8);
      doc.setTextColor(0, 50, 82);
      doc.text("Total", mx + 4, yPos + 5.5);
      doc.setTextColor(cr, cg, cb);
      doc.text(fmt(total), pw - mx - 4, yPos + 5.5, { align: "right" });
      yPos += 8;

      return yPos;
    };

    if (hasInv && results.inventory) {
      y = checkPage(60, y);
      y = drawSectionHeader("Inventory Imbalance", "\uD83D\uDCE6", "#3ec26d", y);
      y = drawTotalRow("Total Inventory Value Reduction Opportunity", "One-time reduction in on-hand inventory value through right-sizing initiatives", results.inventory.totalInvReduction, "#3ec26d", y);
      y = drawRiskRow("Active Materials Increase", "Active material investment to cover critical stockout gaps", results.inventory.activeIncrease, y);
      y = drawBreakdownTable(
        `Components of the ${fmt(results.inventory.totalInvReduction)} inventory reduction`,
        [
          { name: "Active Material Reduction", desc: "Excess active & slow-moving stock removed from balance sheet", value: results.inventory.activeDecrease },
          { name: "Deduplication", desc: "Cross-site SKU rationalization eliminates duplicate stock holdings", value: results.inventory.dedup },
          { name: "Parts Pooling & Network Sharing", desc: "Consolidated cross-site inventory reduces per-site overstocking", value: results.inventory.pooling },
          { name: "VMI Disposition", desc: "Vendor-managed inventory transfers stock ownership off your books", value: results.inventory.vmi },
        ],
        results.inventory.totalInvReduction,
        "#3ec26d",
        y
      );
      y += 6;
    }

    if (hasSpend && results.spend) {
      y = checkPage(60, y);
      y = drawSectionHeader("Spend Leakage", "\uD83D\uDCB8", "#0075c9", y);
      y = drawTotalRow("Total Annual Spend Reduction & Avoidance", "Ongoing annual savings from eliminating leakage across your MRO spend categories", results.spend.totalSpend, "#0075c9", y);
      y = drawBreakdownTable(
        `Components of the ${fmt(results.spend.totalSpend)} annual spend reduction`,
        [
          { name: "Carrying / Holding Cost Savings", desc: "Annual cost of carrying inventory eliminated as on-hand value drops", value: results.spend.holdingSavings },
          { name: "WACC Savings", desc: "Capital cost freed as inventory reduction releases working capital", value: results.spend.waccSavings },
          { name: "PPV & Tailspend Savings", desc: "Price variance and tail spend consolidation through supplier rationalization", value: results.spend.ppvSavings },
          { name: "Replenishment Suppression", desc: "Reduced reorder activity as optimized inventory eliminates unnecessary restocking", value: results.spend.replenishmentSuppression },
          { name: "Additional Repairable Materials", desc: "Parts identified as repairable rather than replaced, reducing new spend", value: results.spend.repairableMaterials },
          { name: "Expediting Cost Reduction", desc: "Emergency and rush order costs avoided through better stock positioning", value: results.spend.expediting },
        ],
        results.spend.totalSpend,
        "#0075c9",
        y
      );
      y += 6;
    }

    if (hasDowntime && results.downtime) {
      y = checkPage(50, y);
      y = drawSectionHeader("Downtime Risk", "\u26A0\uFE0F", "#6b7280", y);
      y = drawTotalRow("Total Estimated Downtime Cost Avoidance", "Annual savings from reducing stockout-driven unplanned downtime", results.downtime.dtSavings, "#6b7280", y);

      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, y, cw, 7, "FD");
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text("HOW THIS SAVINGS IS CALCULATED \u2014 CURRENT VS. OPTIMIZED STATE", mx + 4, y + 4.5);
      y += 7;

      doc.setFillColor(255, 255, 255);
      doc.rect(mx, y, cw, 6, "FD");
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text("METRIC", mx + 4, y + 4);
      doc.text("CURRENT STATE", mx + 75, y + 4);
      doc.text("OPTIMIZED STATE", pw - mx - 4, y + 4, { align: "right" });
      y += 6;

      const dtRows = [
        { metric: "Org-Wide Unplanned Downtime Hours", current: `${fmtInt(results.downtime.orgDtHours)} hrs`, optimized: `${fmtInt(results.downtime.optimizedDtHours)} hrs` },
        { metric: "Total Unplanned Downtime Cost", current: fmt(results.downtime.unplannedCost), optimized: fmt(results.downtime.optimizedDtCost) },
        { metric: "Critical Spares Stockout Rate", current: `${(results.downtime.curStockoutRate * 100).toFixed(0)}%`, optimized: `${(results.downtime.tgtStockoutRate * 100).toFixed(0)}%` },
      ];
      dtRows.forEach((row) => {
        doc.setDrawColor(240, 240, 240);
        doc.rect(mx, y, cw, 8, "D");
        doc.setFontSize(7);
        doc.setTextColor(0, 50, 82);
        doc.text(row.metric, mx + 4, y + 5);
        doc.setTextColor(120, 120, 120);
        doc.text(row.current, mx + 75, y + 5);
        doc.setTextColor(107, 114, 128);
        doc.text(row.optimized, pw - mx - 4, y + 5, { align: "right" });
        y += 8;
      });

      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 220, 220);
      doc.rect(mx, y, cw, 8, "FD");
      doc.setFontSize(7);
      doc.setTextColor(0, 50, 82);
      doc.text("Avoidable Downtime Cost (stockout-attributed portion)", mx + 4, y + 5);
      doc.setTextColor(107, 114, 128);
      doc.text(fmt(results.downtime.dtSavings), pw - mx - 4, y + 5, { align: "right" });
      y += 8;
      y += 6;
    }

    y = checkPage(20, y);
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(mx, y, cw, 22, 2, 2, "FD");
    doc.setFontSize(7);
    doc.setTextColor(0, 50, 82);
    doc.text("How we calculated this.", mx + 4, y + 5);
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    const methText = "Estimates are based on your inputs and proven benchmarks, where customers have achieved 20% lower working capital and a 2.8% increase in asset uptime within months. Results may vary.";
    const methLines = doc.splitTextToSize(methText, cw - 8);
    doc.text(methLines, mx + 4, y + 10);
    y += 26;

    y = checkPage(26, y);
    doc.setFillColor(0, 50, 82);
    doc.roundedRect(mx, y, cw, 22, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("Ready to unlock your MRO optimization potential?", pw / 2, y + 8, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(160, 185, 210);
    doc.text("Schedule a deeper conversation with our team by visiting", pw / 2, y + 14, { align: "center" });
    doc.text("https://verusen.com/talk-to-an-mro-expert/", pw / 2, y + 18, { align: "center" });

    doc.save("Verusen AI for MRO Optimization Savings.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#003252] rounded-xl p-8 mb-8 relative overflow-hidden">
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

      <div className="flex justify-center gap-6">
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
