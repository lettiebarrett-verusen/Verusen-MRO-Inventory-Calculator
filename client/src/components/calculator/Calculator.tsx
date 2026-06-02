import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputStep } from "./InputStep";
import { LeadForm } from "./LeadForm";
import { ResultsView } from "./ResultsView";
import { type CalculatorInputs, type LeadInputs, type PainPoint, calculateSavings, type CalculationResult, industrySlugMap, industryOptions } from "@/lib/calculator-logic";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, LockOpen, FileText, ListChecks, TrendingUp } from "lucide-react";

async function submitLead(data: {
  lead: LeadInputs;
  industry: string;
  campaign: string;
  selectedPains: PainPoint[];
  inputs: CalculatorInputs;
  results: {
    inventory: CalculationResult["inventory"];
    spend: CalculationResult["spend"];
    downtime: CalculationResult["downtime"];
    grandTotal: number;
  };
}): Promise<{ success: boolean; leadId: string; calculationId: string; contactId?: string; pdfUploadToken?: string }> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to submit lead");
  return response.json();
}

function getUrlParams(): { industry: string; campaign: string } {
  if (typeof window === "undefined") return { industry: "", campaign: "" };
  const params = new URLSearchParams(window.location.search);
  const industryParam = (params.get("industry") || "").toLowerCase().trim();
  const mappedIndustry = industrySlugMap[industryParam] || "";
  // Also accept exact full-name match for direct matches
  const exactIndustry = industryOptions.find(opt => opt.toLowerCase() === industryParam) || "";
  return {
    industry: mappedIndustry || exactIndustry || "",
    campaign: (params.get("campaign") || "").trim(),
  };
}

type Step = 1 | 2;

export function Calculator() {
  const initialParams = getUrlParams();
  const [step, setStep] = useState<Step>(1);
  const [includeDowntime, setIncludeDowntime] = useState(false);
  const [industry, setIndustry] = useState<string>(initialParams.industry);
  const [campaign] = useState<string>(initialParams.campaign);
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<LeadInputs | null>(null);
  const [pdfUploadToken, setPdfUploadToken] = useState<string | undefined>(undefined);

  const selectedPains: Set<PainPoint> = new Set<PainPoint>(
    includeDowntime ? ["inventory", "spend", "downtime"] : ["inventory", "spend"]
  );

  const leadMutation = useMutation({
    mutationFn: submitLead,
    onSuccess: (data) => {
      if (data.pdfUploadToken) setPdfUploadToken(data.pdfUploadToken);
      setGateUnlocked(true);
    },
    onError: () => setGateUnlocked(true),
  });

  const goToStep = (n: Step) => {
    setStep(n);
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputComplete = (data: CalculatorInputs) => {
    setInputs(data);
    const result = calculateSavings(data, selectedPains);
    setResults(result);
    goToStep(2);
  };

  const handleLeadSubmit = (leadData: LeadInputs) => {
    if (!inputs || !results) return;
    setSubmittedLead(leadData);
    leadMutation.mutate({
      lead: leadData,
      industry,
      campaign,
      selectedPains: Array.from(selectedPains),
      inputs,
      results: {
        inventory: results.inventory,
        spend: results.spend,
        downtime: results.downtime,
        grandTotal: results.grandTotal,
      },
    });
  };

  const handleReset = () => {
    setStep(1);
    setIncludeDowntime(false);
    setIndustry(initialParams.industry);
    setInputs(null);
    setResults(null);
    setGateUnlocked(false);
    setSubmittedLead(null);
    setPdfUploadToken(undefined);
    leadMutation.reset();
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stepLabels = [
    { num: 1, label: "Your Operation" },
    { num: 2, label: "Your Savings" },
  ];

  return (
    <div id="calculator-section" className="py-8 bg-transparent relative">
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
                        ? (step === 2 ? "text-[#3ec26d] border-b-[#3ec26d] bg-white" : "text-[#0075c9] border-b-[#0075c9] bg-white")
                        : isDone
                          ? "text-[#3ec26d] border-b-[#3ec26d] cursor-pointer hover:bg-white"
                          : "text-muted-foreground border-b-transparent"
                    }`}
                    data-testid={`step-tab-${s.num}`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isActive && step === 2
                        ? "bg-[#3ec26d] text-white"
                        : isActive
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
                  <InputStep
                    industry={industry}
                    onIndustryChange={setIndustry}
                    includeDowntime={includeDowntime}
                    onToggleDowntime={setIncludeDowntime}
                    onComplete={handleInputComplete}
                    defaultValues={inputs || undefined}
                  />
                </motion.div>
              )}

              {step === 2 && results && inputs && !gateUnlocked && (
                <motion.div key="step2-gated" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <GatedResults
                    results={results}
                    selectedPains={selectedPains}
                    inputs={inputs}
                    totalInventoryValue={inputs.totalInventoryValue}
                    onLeadSubmit={handleLeadSubmit}
                    isSubmitting={leadMutation.isPending}
                    onAdjustInputs={() => goToStep(1)}
                  />
                </motion.div>
              )}

              {step === 2 && results && inputs && gateUnlocked && (
                <motion.div key="step2-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <ResultsView
                    results={results}
                    inputs={inputs}
                    industry={industry}
                    selectedPains={selectedPains}
                    onReset={handleReset}
                    onAdjustInputs={() => goToStep(1)}
                    totalInventoryValue={inputs.totalInventoryValue}
                    uploadToken={pdfUploadToken}
                    uploadCompany={submittedLead?.company}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step < 2 && (
            <div className="flex justify-end items-center px-6 md:px-8 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  const form = document.getElementById('input-submit');
                  if (form) form.click();
                }}
                className="flex items-center gap-1.5 bg-[#003252] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#003252]/90 transition-colors"
                data-testid="button-next"
              >
                Calculate My Savings <ArrowRight className="w-4 h-4" />
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
  const coreTotal = (results.inventory?.totalInvReduction ?? 0) + (results.spend?.totalSpend ?? 0);
  const hasDowntime = selectedPains.has("downtime") && results.downtime;

  return (
    <div>
      <div className="bg-[#003252] rounded-2xl p-2.5 sm:p-3 md:p-4 mb-6 md:mb-8 relative overflow-hidden">
        <div className="bg-white/[0.06] rounded-xl py-2.5 sm:py-3 px-4 text-center mb-2.5 sm:mb-3">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Total MRO Optimization Opportunity</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight" data-testid="text-gated-total">{fmt(coreTotal)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {results.inventory && (
            <div className="bg-[#3ec26d]/15 border border-[#3ec26d]/40 rounded-xl py-3 px-4 text-center">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#5fd991] mb-1">Inventory Right-Sizing</p>
              <p className="text-xl sm:text-2xl font-extrabold text-white">{fmt(results.inventory.totalInvReduction)}</p>
            </div>
          )}
          {results.spend && (
            <div className="bg-[#0075c9]/20 border border-[#0075c9]/50 rounded-xl py-3 px-4 text-center">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#6cb8ee] mb-1">Spend Reduction</p>
              <p className="text-xl sm:text-2xl font-extrabold text-white">{fmt(results.spend.totalSpend)}</p>
            </div>
          )}
        </div>

        {hasDowntime && results.downtime && (
          <div className="bg-black/25 rounded-xl py-3 px-4 text-center mt-2.5 sm:mt-3">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#ed9b29] mb-1">Additional Estimated Avoidable Downtime</p>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{fmt(results.downtime.dtSavings)}</p>
            <p className="text-xs italic text-white/50 mt-0.5">*Not included in optimization above</p>
          </div>
        )}
      </div>

      <div className="relative" style={{ minHeight: '480px' }}>
        <div className="blur-[6px] pointer-events-none select-none" aria-hidden="true">
          {results.inventory && (
            <div className="mb-4">
              <div className="text-sm font-bold uppercase tracking-wider text-white bg-[#3ec26d] px-4 py-3 rounded-t-lg">
                Inventory Right-Sizing
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
                <div>
                  <p className="font-semibold text-[#003252]">Total Inventory Value Reduction</p>
                  <p className="text-xs text-muted-foreground">One-time reduction in on-hand inventory value</p>
                </div>
                <p className="text-2xl font-bold text-[#3ec26d]">{fmt(results.inventory.totalInvReduction)}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Active Reduction</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.inventory.activeDecrease)}</p>
                </div>
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Parts Pooling</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.inventory.pooling)}</p>
                </div>
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">VMI Disposition</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.inventory.vmi)}</p>
                </div>
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Deduplication</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.inventory.dedup)}</p>
                </div>
              </div>
            </div>
          )}

          {results.spend && (
            <div className="mb-4">
              <div className="text-sm font-bold uppercase tracking-wider text-white bg-[#0075c9] px-4 py-3 rounded-t-lg">
                Spend Reduction/Avoidance
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0">
                <div>
                  <p className="font-semibold text-[#003252]">Total Annual Spend Reduction</p>
                  <p className="text-xs text-muted-foreground">Ongoing annual savings from spend optimization</p>
                </div>
                <p className="text-2xl font-bold text-[#0075c9]">{fmt(results.spend.totalSpend)}</p>
              </div>
              <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Holding Costs</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.spend.holdingSavings)}</p>
                </div>
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">PPV Savings</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.spend.ppvSavings)}</p>
                </div>
                <div className="bg-white p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Expediting</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#003252]">{fmt(results.spend.expediting)}</p>
                </div>
              </div>
            </div>
          )}

          {hasDowntime && results.downtime && (
            <div className="mb-4">
              <div className="text-sm font-bold uppercase tracking-wider text-white bg-[#ed9b29] px-4 py-3 rounded-t-lg">
                Additional Downtime Avoidance Opportunity
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-gray-200 border-t-0 rounded-b-lg">
                <div>
                  <p className="font-semibold text-[#003252]">Total Downtime Cost Avoidance</p>
                  <p className="text-xs text-muted-foreground">Additional annual upside from reducing stockout-driven downtime</p>
                </div>
                <p className="text-2xl font-bold text-[#ed9b29]">{fmt(results.downtime.dtSavings)}</p>
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

        <div className="absolute inset-0 flex items-start justify-center pt-2 sm:pt-3" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,1) 70%)' }}>
          <div className="w-full max-w-md mx-3 sm:mx-4 bg-white border border-gray-200 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-gradient-to-br from-[#003252] to-[#0075c9] px-5 sm:px-7 pt-4 pb-5 text-center relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5" aria-hidden="true" />
              <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-white/5" aria-hidden="true" />
              <div className="relative">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <LockOpen className="h-4 w-4 text-white" strokeWidth={2.25} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-0.5">One last step</p>
                <h3 className="text-xl font-extrabold text-white mb-1 leading-tight" data-testid="text-gate-title">Almost there!</h3>
                <p className="text-sm text-white/75 leading-snug max-w-xs mx-auto">
                  Your full <span className="font-semibold text-white">{fmt(coreTotal)}</span> opportunity breakdown is ready to unlock.
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-7 pt-5 pb-6">
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-3 text-center">
                  <ListChecks className="h-4 w-4 text-[#3ec26d]" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-[#003252] leading-tight">Full breakdown</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-3 text-center">
                  <TrendingUp className="h-4 w-4 text-[#0075c9]" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-[#003252] leading-tight">Savings timeline</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-3 text-center">
                  <FileText className="h-4 w-4 text-[#ed9b29]" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-[#003252] leading-tight">Downloadable PDF</span>
                </div>
              </div>
              <LeadForm onComplete={onLeadSubmit} onBack={onAdjustInputs} isSubmitting={isSubmitting} compact />
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Check className="h-3 w-3 text-[#3ec26d]" /> No spam — your results are sent straight to your inbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
