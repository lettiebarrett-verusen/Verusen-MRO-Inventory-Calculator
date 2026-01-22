import { type CalculationResult, type CalculatorInputs } from "@/lib/calculator-logic";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, BookOpen } from "lucide-react";
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
          Most organizations uncover significantly more value through a deeper business and ROI assessment—addressing slow-moving and obsolete inventory, misclassified materials, and underutilized stock. Let's schedule time to discuss your MRO inventory challenges and explore how Verusen's AI platform can help drive measurable impact.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <Button size="lg" className="h-12 px-8">
            <ArrowRight className="mr-2 h-4 w-4" /> I'm Ready for a Deeper Dive Assessment
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8">
            <BookOpen className="mr-2 h-4 w-4" /> I'd Like to Learn More
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
