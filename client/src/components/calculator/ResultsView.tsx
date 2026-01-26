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
    const activeIncreases = results.activeOptimization * 0.4;
    const activeDecreases = results.activeOptimization * 0.6;
    const reductionsWithoutObsolete = activeIncreases + activeDecreases + results.networkOptimization + results.vmiDisposition + results.deduplication;
    
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 95);
    doc.text("MRO Inventory Optimization Results", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Powered by Verusen AI", 20, 33);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 39);
    
    doc.setDrawColor(0, 166, 81);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text("Total Optimization Opportunity", 20, 58);
    doc.setFontSize(24);
    doc.setTextColor(0, 166, 81);
    doc.text(formatCurrency(reductionsWithoutObsolete), 20, 70);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 95);
    doc.text("Input Profile", 20, 90);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    let yPos = 100;
    if (inputs) {
      doc.text(`Number of Sites: ${inputs.siteCount.toLocaleString()}`, 25, yPos);
      yPos += 8;
      doc.text(`Total Inventory Value: ${formatCurrency(inputs.totalInventoryValue)}`, 25, yPos);
      yPos += 8;
      doc.text(`SKU Count: ${inputs.skuCount.toLocaleString()}`, 25, yPos);
      yPos += 8;
      doc.text(`Active Materials: ${inputs.activePercent}%`, 25, yPos);
      yPos += 8;
      doc.text(`Obsolete/Non-Moving: ${inputs.obsoletePercent}%`, 25, yPos);
      yPos += 8;
      doc.text(`Special/Critical Items: ${inputs.specialPercent}%`, 25, yPos);
    }
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 95);
    doc.text("Optimization Breakdown", 20, yPos);
    
    yPos += 12;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Active Material Value Increases: +${formatCurrency(activeIncreases)}`, 25, yPos);
    yPos += 8;
    doc.text(`Active Material Value Decreases: -${formatCurrency(activeDecreases)}`, 25, yPos);
    yPos += 8;
    doc.text(`Network Optimization & Transfers: -${formatCurrency(results.networkOptimization)}`, 25, yPos);
    yPos += 8;
    doc.text(`VMI Disposition: -${formatCurrency(results.vmiDisposition)}`, 25, yPos);
    yPos += 8;
    doc.text(`Deduplication Savings: -${formatCurrency(results.deduplication)}`, 25, yPos);
    
    yPos += 20;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("* Estimates are based on industry benchmarks and high-level inputs.", 20, yPos);
    doc.text("  Actual results may vary based on data quality and operational constraints.", 20, yPos + 5);
    
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 95);
    doc.text("Ready to unlock your MRO optimization potential?", 20, yPos);
    doc.text("Visit verusen.com or talk to an expert today.", 20, yPos + 6);
    
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
