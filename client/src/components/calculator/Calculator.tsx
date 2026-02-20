import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PainSelector } from "./PainSelector";
import { InputStep } from "./InputStep";
import { LeadForm } from "./LeadForm";
import { ResultsView } from "./ResultsView";
import { type CalculatorInputs, type LeadInputs, type PainPoint, calculateSavings, type CalculationResult } from "@/lib/calculator-logic";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

async function submitLead(data: { lead: LeadInputs; calculation: any }) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to submit lead");
  return response.json();
}

type Step = 1 | 2 | 3;

export function Calculator() {
  const [step, setStep] = useState<Step>(1);
  const [selectedPains, setSelectedPains] = useState<Set<PainPoint>>(new Set());
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const inputStepRef = useRef<{ getValues: () => CalculatorInputs } | null>(null);

  const leadMutation = useMutation({
    mutationFn: submitLead,
    onSuccess: () => setGateUnlocked(true),
    onError: () => setGateUnlocked(true),
  });

  const togglePain = (pain: PainPoint) => {
    setSelectedPains(prev => {
      const next = new Set(prev);
      next.has(pain) ? next.delete(pain) : next.add(pain);
      return next;
    });
  };

  const goToStep = (n: Step) => {
    setStep(n);
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStep1Next = () => {
    if (selectedPains.size === 0) {
      alert("Please select at least one area to continue.");
      return;
    }
    goToStep(2);
  };

  const handleStep2Complete = (data: CalculatorInputs) => {
    setInputs(data);
    const result = calculateSavings(data, selectedPains);
    setResults(result);
    goToStep(3);
  };

  const handleLeadSubmit = (leadData: LeadInputs) => {
    if (!inputs || !results) return;
    leadMutation.mutate({
      lead: leadData,
      calculation: {
        siteCount: inputs.siteCount,
        totalInventoryValue: inputs.totalInventoryValue,
        skuCount: inputs.skuCount,
        activePercent: inputs.activePercent,
        obsoletePercent: inputs.obsoletePercent,
        specialPercent: inputs.specialPercent,
        activeMaterialIncreases: results.activeMaterialIncreases,
        activeMaterialDecreases: results.activeMaterialDecreases,
        networkOptimization: results.networkOptimization,
        vmiDisposition: results.vmiDisposition,
        deduplication: results.deduplication,
        totalReduction: results.totalReduction,
      },
    });
  };

  const handleReset = () => {
    setStep(1);
    setSelectedPains(new Set());
    setInputs(null);
    setResults(null);
    setGateUnlocked(false);
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stepLabels = [
    { num: 1, label: "Your Priorities" },
    { num: 2, label: "Your Profile" },
    { num: 3, label: "Your Savings" },
  ];

  return (
    <div id="calculator-section" className="py-8 bg-white relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
              {stepLabels.map((s) => {
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => { if (isDone) goToStep(s.num as Step); }}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-[3px] border-r border-r-gray-200 last:border-r-0 transition-all ${
                      isActive
                        ? "text-[#0075c9] border-b-[#0075c9] bg-white"
                        : isDone
                          ? "text-[#3ec26d] border-b-[#3ec26d] cursor-pointer hover:bg-white"
                          : "text-muted-foreground border-b-transparent"
                    }`}
                    data-testid={`step-tab-${s.num}`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isActive
                        ? "bg-[#0075c9] text-white"
                        : isDone
                          ? "bg-[#3ec26d] text-white"
                          : "bg-gray-300 text-white"
                    }`}>
                      {isDone ? <Check className="w-3 h-3" /> : s.num}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <PainSelector selected={selectedPains} onToggle={togglePain} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <InputStep
                    selectedPains={selectedPains}
                    onComplete={handleStep2Complete}
                    defaultValues={inputs || undefined}
                  />
                </motion.div>
              )}

              {step === 3 && results && inputs && !gateUnlocked && (
                <motion.div key="step3-gated" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <GatedResults
                    results={results}
                    selectedPains={selectedPains}
                    inputs={inputs}
                    totalInventoryValue={inputs.totalInventoryValue}
                    onLeadSubmit={handleLeadSubmit}
                    isSubmitting={leadMutation.isPending}
                    onAdjustInputs={() => goToStep(2)}
                  />
                </motion.div>
              )}

              {step === 3 && results && inputs && gateUnlocked && (
                <motion.div key="step3-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <ResultsView
                    results={results}
                    inputs={inputs}
                    selectedPains={selectedPains}
                    onReset={handleReset}
                    onAdjustInputs={() => goToStep(2)}
                    totalInventoryValue={inputs.totalInventoryValue}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step < 3 && (
            <div className="flex justify-between items-center px-6 md:px-8 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => goToStep((step - 1) as Step)}
                className={`flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#003252] transition-colors ${step === 1 ? 'invisible' : ''}`}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={step === 1 ? handleStep1Next : () => {
                  const form = document.getElementById('step2-submit');
                  if (form) form.click();
                }}
                className="flex items-center gap-1.5 bg-[#003252] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#003252]/90 transition-colors"
                data-testid="button-next"
              >
                {step === 2 ? "Calculate My Savings" : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GatedResults({
  results,
  selectedPains,
  inputs,
  totalInventoryValue,
  onLeadSubmit,
  isSubmitting,
  onAdjustInputs,
}: {
  results: CalculationResult;
  selectedPains: Set<PainPoint>;
  inputs: CalculatorInputs;
  totalInventoryValue: number;
  onLeadSubmit: (data: LeadInputs) => void;
  isSubmitting: boolean;
  onAdjustInputs: () => void;
}) {
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  return (
    <div>
      <div className="bg-[#003252] rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-[#0075c9]/15" />
        <p className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium">Total MRO Optimization Opportunity</p>
        <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 relative" data-testid="text-gated-total">{fmt(results.grandTotal)}</p>
        <p className="text-sm text-white/70 relative max-w-2xl leading-relaxed">Powered by your data, Verusen's advanced AI modeling, and industry benchmarks, this analysis reveals hidden stockout risks and untapped savings opportunities across your MRO inventory.</p>
      </div>

      <div className="relative">
        <div className="blur-[6px] pointer-events-none select-none" aria-hidden="true">
          {selectedPains.has("inventory") && results.inventory && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3ec26d] bg-[#3ec26d]/5 px-4 py-2.5 rounded-t-lg border border-[#3ec26d]/20 border-b-0">
                <span>📦</span> Inventory Imbalance
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
                <div>
                  <p className="font-semibold text-[#003252]">Total Inventory Value Reduction</p>
                  <p className="text-xs text-muted-foreground">One-time reduction in on-hand inventory value</p>
                </div>
                <p className="text-2xl font-bold text-[#3ec26d]">{fmt(results.inventory.totalInvReduction)}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">Active Reduction</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.inventory.activeDecrease)}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">Parts Pooling</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.inventory.pooling)}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">VMI Disposition</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.inventory.vmi)}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">Deduplication</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.inventory.dedup)}</p>
                </div>
              </div>
            </div>
          )}

          {selectedPains.has("spend") && results.spend && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ed9b29] bg-[#ed9b29]/5 px-4 py-2.5 rounded-t-lg border border-[#ed9b29]/20 border-b-0">
                <span>💸</span> Spend Leakage
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
                <div>
                  <p className="font-semibold text-[#003252]">Total Annual Spend Reduction</p>
                  <p className="text-xs text-muted-foreground">Ongoing annual savings from spend optimization</p>
                </div>
                <p className="text-2xl font-bold text-[#ed9b29]">{fmt(results.spend.totalSpend)}</p>
              </div>
              <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">Holding Costs</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.spend.holdingSavings)}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">PPV Savings</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.spend.ppvSavings)}</p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs text-muted-foreground">Expediting</p>
                  <p className="text-sm font-semibold text-[#003252]">{fmt(results.spend.expediting)}</p>
                </div>
              </div>
            </div>
          )}

          {selectedPains.has("downtime") && results.downtime && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0075c9] bg-[#0075c9]/5 px-4 py-2.5 rounded-t-lg border border-[#0075c9]/20 border-b-0">
                <span>⚠️</span> Downtime Risk
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0 rounded-b-lg">
                <div>
                  <p className="font-semibold text-[#003252]">Total Downtime Cost Avoidance</p>
                  <p className="text-xs text-muted-foreground">Annual savings from reducing stockout-driven downtime</p>
                </div>
                <p className="text-2xl font-bold text-[#0075c9]">{fmt(results.downtime.dtSavings)}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <p className="text-sm font-bold text-[#003252] mb-2">Your Optimization Journey</p>
            <div className="h-24 flex items-end gap-1">
              {[100, 95, 88, 80, 72, 65, 58, 52].map((h, i) => (
                <div key={i} className="flex-1 bg-[#003252]/20 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-start justify-center pt-6" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,1) 70%)' }}>
          <div className="w-full max-w-md mx-4 bg-white border-2 border-[#003252] rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-[#003252] mb-1 text-center">Unlock Your Full Savings Report</h3>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              Get the complete breakdown, optimization timeline, and downloadable PDF.
            </p>
            <LeadForm onComplete={onLeadSubmit} onBack={onAdjustInputs} isSubmitting={isSubmitting} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
