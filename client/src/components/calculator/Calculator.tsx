import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputStep } from "./InputStep";
import { LeadForm } from "./LeadForm";
import { ResultsView } from "./ResultsView";
import { type CalculatorInputs, type LeadInputs, calculateSavings, type CalculationResult } from "@/lib/calculator-logic";
import { useMutation } from "@tanstack/react-query";

async function submitLead(data: { lead: LeadInputs; calculation: CalculatorInputs & CalculationResult }) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead: data.lead,
      calculation: {
        siteCount: data.calculation.siteCount,
        totalInventoryValue: data.calculation.totalInventoryValue,
        skuCount: data.calculation.skuCount,
        activePercent: data.calculation.activePercent,
        obsoletePercent: data.calculation.obsoletePercent,
        specialPercent: data.calculation.specialPercent,
        activeOptimization: data.calculation.activeOptimization,
        networkOptimization: data.calculation.networkOptimization,
        vmiDisposition: data.calculation.vmiDisposition,
        deduplication: data.calculation.deduplication,
        obsoleteReduction: data.calculation.obsoleteReduction,
        totalReduction: data.calculation.totalReduction,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit lead");
  }

  return response.json();
}

export function Calculator() {
  const [step, setStep] = useState<"input" | "lead" | "results">("input");
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [totalInventoryValue, setTotalInventoryValue] = useState<number>(1000000);

  const leadMutation = useMutation({
    mutationFn: submitLead,
    onSuccess: () => {
      setStep("results");
      window.scrollTo({ top: document.getElementById('calculator-section')?.offsetTop, behavior: 'smooth' });
    },
    onError: (error) => {
      console.error("Lead submission error:", error);
      setStep("results");
      window.scrollTo({ top: document.getElementById('calculator-section')?.offsetTop, behavior: 'smooth' });
    },
  });

  const handleInputComplete = (data: CalculatorInputs) => {
    setInputs(data);
    setTotalInventoryValue(data.totalInventoryValue);
    setResults(calculateSavings(data));
    setStep("lead");
    window.scrollTo({ top: document.getElementById('calculator-section')?.offsetTop, behavior: 'smooth' });
  };

  const handleLeadComplete = (leadData: LeadInputs) => {
    if (!inputs || !results) return;
    
    leadMutation.mutate({
      lead: leadData,
      calculation: { ...inputs, ...results },
    });
  };

  const handleInputsChange = (newInputs: CalculatorInputs) => {
    const totalPct = newInputs.activePercent + newInputs.obsoletePercent + newInputs.specialPercent;
    if (Math.abs(totalPct - 100) < 1 && newInputs.totalInventoryValue >= 1000 && newInputs.siteCount >= 1) {
      setInputs(newInputs);
      setTotalInventoryValue(newInputs.totalInventoryValue);
      setResults(calculateSavings(newInputs));
    } else {
      setInputs(newInputs);
    }
  };

  const handleReset = () => {
    setStep("input");
    setInputs(null);
    setResults(null);
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
              <LeadForm 
                onComplete={handleLeadComplete} 
                onBack={() => setStep("input")} 
                isSubmitting={leadMutation.isPending}
              />
            </motion.div>
          )}

          {step === "results" && results && inputs && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ResultsView 
                results={results} 
                onReset={handleReset} 
                totalInventoryValue={totalInventoryValue}
                inputs={inputs}
                onInputsChange={handleInputsChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
