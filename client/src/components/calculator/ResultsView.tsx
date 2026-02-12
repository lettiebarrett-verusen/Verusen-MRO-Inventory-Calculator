import { type CalculationResult, type CalculatorInputs } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, Phone, RotateCcw, Award } from "lucide-react";
import { OptimizationJourney } from "./OptimizationJourney";
import { CompactInputs } from "./CompactInputs";
import { jsPDF } from "jspdf";

interface ResultsViewProps {
  results: CalculationResult;
  onReset: () => void;
  totalInventoryValue?: number;
  inputs?: CalculatorInputs;
  onInputsChange?: (inputs: CalculatorInputs) => void;
}

export function ResultsView({ results, onReset, totalInventoryValue = 1000000, inputs, onInputsChange }: ResultsViewProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const activeIncreases = Math.abs(results.activeMaterialIncreases);
    const activeDecreases = results.activeMaterialDecreases;
    const totalOptimization = results.totalReduction;
    const optimalInventory = totalInventoryValue - totalOptimization;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b] as const;
    };

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 50, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("MRO Inventory Optimizer", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(180, 200, 220);
    doc.text("Powered by Verusen AI", 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);

    doc.setFontSize(10);
    doc.setTextColor(180, 200, 220);
    doc.text("Total Optimization Opportunity", pageWidth - 20, 20, { align: "right" });
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(formatCurrency(totalOptimization), pageWidth - 20, 35, { align: "right" });

    let yPos = 65;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 35, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(100, 110, 120);
    doc.text("INPUT PROFILE", 20, yPos + 3);

    yPos += 12;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    if (inputs) {
      const col1X = 22;
      const col2X = 80;
      const col3X = 140;
      doc.text(`Sites: ${inputs.siteCount.toLocaleString()}`, col1X, yPos);
      doc.text(`Inventory Value: ${formatCurrency(inputs.totalInventoryValue)}`, col2X, yPos);
      doc.text(`SKU Count: ${inputs.skuCount.toLocaleString()}`, col3X, yPos);
      yPos += 8;
      doc.text(`Active & Slow: ${inputs.activePercent}%`, col1X, yPos);
      doc.text(`Non-Moving: ${inputs.obsoletePercent}%`, col2X, yPos);
      doc.text(`Special Items: ${inputs.specialPercent}%`, col3X, yPos);
    }

    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 95);
    doc.text("Optimization Breakdown", 20, yPos);

    yPos += 10;

    const breakdownItems = [
      { name: "Active Material Value Increases", value: activeIncreases, color: "#ef4444", sign: "+", desc: "Reducing risk by increasing critical materials" },
      { name: "Active Material Value Decreases", value: activeDecreases, color: "#3b82f6", sign: "-", desc: "Right-sizing active stock levels" },
      { name: "Network Optimization & Transfer Opportunity", value: results.networkOptimization, color: "#8b5cf6", sign: "-", desc: "Cross-site inventory balancing" },
      { name: "VMI Disposition", value: results.vmiDisposition, color: "#f97316", sign: "-", desc: "Vendor-managed inventory opportunities" },
      { name: "Deduplication Savings", value: results.deduplication, color: "#ec4899", sign: "-", desc: "Eliminating duplicate safety stock" },
    ];

    breakdownItems.forEach((item) => {
      const [r, g, b] = hexToRgb(item.color);

      doc.setFillColor(r, g, b);
      doc.roundedRect(20, yPos - 4, 4, 22, 2, 2, "F");

      doc.setFillColor(248, 249, 252);
      doc.roundedRect(28, yPos - 6, pageWidth - 48, 26, 3, 3, "F");

      doc.setFontSize(10);
      doc.setTextColor(30, 40, 60);
      doc.text(item.name, 33, yPos + 3);

      doc.setFontSize(8);
      doc.setTextColor(120, 130, 140);
      doc.text(item.desc, 33, yPos + 12);

      doc.setFontSize(11);
      doc.setTextColor(r, g, b);
      doc.text(`${item.sign}${formatCurrency(item.value)}`, pageWidth - 25, yPos + 7, { align: "right" });

      yPos += 30;
    });

    yPos += 5;
    const barWidth = pageWidth - 50;
    const barHeight = 20;
    const barX = 25;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPos - 8, pageWidth - 30, barHeight + 35, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.text("INVENTORY VALUE WATERFALL", 20, yPos);
    yPos += 8;

    doc.setFillColor(30, 58, 95);
    doc.roundedRect(barX, yPos, barWidth, barHeight, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Starting: ${formatCurrency(totalInventoryValue)}`, barX + 5, yPos + 13);

    yPos += barHeight + 4;
    const optimalWidth = totalInventoryValue > 0 ? (optimalInventory / totalInventoryValue) * barWidth : 0;
    doc.setFillColor(0, 166, 81);
    doc.roundedRect(barX, yPos, optimalWidth, barHeight, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Optimal: ${formatCurrency(optimalInventory)}`, barX + 5, yPos + 13);

    const savedWidth = barWidth - optimalWidth;
    if (savedWidth > 0) {
      doc.setFillColor(220, 230, 240);
      doc.roundedRect(barX + optimalWidth, yPos, savedWidth, barHeight, 0, 0, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 110, 120);
      if (savedWidth > 30) {
        doc.text(`-${formatCurrency(totalOptimization)}`, barX + optimalWidth + 5, yPos + 13);
      }
    }

    yPos += barHeight + 15;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("* Estimates are based on industry benchmarks and high-level inputs. Actual results may vary.", 20, yPos);

    yPos += 15;
    doc.setFillColor(30, 58, 95);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 25, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Ready to unlock your MRO optimization potential?", pageWidth / 2, yPos + 4, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 220);
    doc.text("Visit verusen.com or talk to an expert today.", pageWidth / 2, yPos + 13, { align: "center" });

    doc.save("MRO-Optimization-Results.pdf");
  };
  return (
    <div className="max-w-6xl mx-auto">
      <OptimizationJourney results={results} totalInventoryValue={totalInventoryValue} />
      
      {inputs && onInputsChange && (
        <div className="mt-8">
          <CompactInputs inputs={inputs} onChange={onInputsChange} />
        </div>
      )}

      {/* Value Reinforcement & CTA */}
      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center border border-border/50 mt-16">
        <h3 className="text-2xl font-bold mb-4">What's Next?</h3>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Most organizations underestimate how much inventory value is tied up across sites, SKUs, and material categories. A deeper conversation typically reveals even greater opportunity. Request a free MRO opportunity assessment or speak with our team today.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <Button size="lg" className="h-12 px-8" asChild>
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

      <div className="text-center mt-8">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
    </div>
  );
}
