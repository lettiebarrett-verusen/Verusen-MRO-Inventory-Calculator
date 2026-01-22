import { type CalculationResult, type CalculatorInputs } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, Phone, FileText } from "lucide-react";
import { OptimizationJourney } from "./OptimizationJourney";
import { CompactInputs } from "./CompactInputs";

interface ResultsViewProps {
  results: CalculationResult;
  onReset: () => void;
  totalInventoryValue?: number;
  inputs?: CalculatorInputs;
  onInputsChange?: (inputs: CalculatorInputs) => void;
}

export function ResultsView({ results, onReset, totalInventoryValue = 1000000, inputs, onInputsChange }: ResultsViewProps) {
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
        <h3 className="text-2xl font-bold mb-4">Want a More Accurate View?</h3>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Most organizations uncover even more value with a deeper analysis — including hidden duplication, misclassified materials, and underutilized inventory.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <Button size="lg" className="h-12 px-8">
            <FileText className="mr-2 h-4 w-4" /> Request Assessment
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8">
            <Phone className="mr-2 h-4 w-4" /> Talk to an Expert
          </Button>
          <Button size="lg" variant="ghost" className="h-12 px-8 text-muted-foreground">
            <Download className="mr-2 h-4 w-4" /> Download Results
          </Button>
          <Button size="lg" variant="ghost" onClick={onReset} className="h-12 px-8 text-muted-foreground">
            Start Over
          </Button>
        </div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-8">
        * Estimates are based on industry benchmarks and high-level inputs. Actual results may vary based on data quality and operational constraints.
      </p>
    </div>
  );
}
