import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputStep } from "./InputStep";
import { LeadForm } from "./LeadForm";
import { ResultsView } from "./ResultsView";
import { type CalculatorInputs, type LeadInputs, calculateSavings, type CalculationResult } from "@/lib/calculator-logic";

export function Calculator() {
  const [step, setStep] = useState<"input" | "lead" | "results">("input");
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const handleInputComplete = (data: CalculatorInputs) => {
    setInputs(data);
    setResults(calculateSavings(data));
    setStep("lead");
    window.scrollTo({ top: document.getElementById('calculator-section')?.offsetTop, behavior: 'smooth' });
  };

  const handleLeadComplete = (data: LeadInputs) => {
    // In a real app, we would submit 'data' and 'inputs' to an API here
    console.log("Lead captured:", data);
    setStep("results");
    window.scrollTo({ top: document.getElementById('calculator-section')?.offsetTop, behavior: 'smooth' });
  };

  return (
    <div id="calculator-section" className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <InputStep onComplete={handleInputComplete} defaultValues={inputs || undefined} />
            </motion.div>
          )}

          {step === "lead" && (
            <motion.div 
              key="lead"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <LeadForm onComplete={handleLeadComplete} onBack={() => setStep("input")} />
            </motion.div>
          )}

          {step === "results" && results && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ResultsView results={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
