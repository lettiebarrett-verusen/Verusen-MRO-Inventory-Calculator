import { z } from "zod";

export const industryOptions = [
  "Aerospace & Defense",
  "Chemicals & Process Industries",
  "Construction & Infrastructure",
  "Energy & Utilities",
  "Industrial & Environmental Services",
  "Manufacturing",
  "Mining & Materials",
  "Transportation & Logistics",
  "Other",
] as const;

export type PainPoint = "inventory" | "spend" | "downtime";

export const calculatorSchema = z.object({
  siteCount: z.number().min(1, "At least 1 site is required"),
  totalInventoryValue: z.number().min(1000, "Value must be at least $1,000").optional().default(0),
  skuCount: z.number().min(1, "At least 1 SKU is required").optional().default(0),
  activePercent: z.number().min(0).max(100),
  obsoletePercent: z.number().min(0).max(100),
  specialPercent: z.number().min(0).max(100),
  annualSpend: z.number().min(0).optional().default(0),
  holdingCostRate: z.number().min(0).max(100).optional().default(15),
  waccRate: z.number().min(0).max(100).optional().default(7),
  downtimeHoursPerSite: z.number().min(0).optional().default(0),
  downtimeCostPerHour: z.number().min(0).optional().default(0),
  currentServiceLevel: z.number().min(75).max(100).optional().default(88),
  targetServiceLevel: z.number().min(0).max(98).optional().default(95),
  stockoutPercent: z.number().min(0).max(50).optional().default(50),
});

export type CalculatorInputs = z.infer<typeof calculatorSchema>;

const personalEmailDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'live.com', 'msn.com', 'me.com', 'comcast.net',
  'att.net', 'verizon.net', 'sbcglobal.net', 'bellsouth.net', 'cox.net',
  'earthlink.net', 'charter.net', 'optonline.net', 'frontier.com',
  'yahoo.co.uk', 'hotmail.co.uk', 'googlemail.com', 'rocketmail.com',
  'ymail.com', 'inbox.com', 'mail.ru', 'qq.com', '163.com', '126.com'
];

const competitorDomains = [
  'sparetech.io', 'sparetech.com', 'spare-tech.com',
  'ibm.com',
  'creactives.com', 'creactives.io'
];

export const leadSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address")
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return domain && !personalEmailDomains.includes(domain);
    }, "Please use your business email address")
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return domain && !competitorDomains.includes(domain);
    }, "This email domain is not allowed"),
  company: z.string().min(2, "Company name is required"),
  jobFunction: z.string().min(1, "Please select your function"),
});

export type LeadInputs = z.infer<typeof leadSchema>;

export interface InventoryResults {
  activeIncrease: number;
  activeDecrease: number;
  pooling: number;
  vmi: number;
  dedup: number;
  totalInvReduction: number;
}

export interface SpendResults {
  holdingSavings: number;
  waccSavings: number;
  ppvSavings: number;
  replenishmentSuppression: number;
  repairableMaterials: number;
  expediting: number;
  totalSpend: number;
}

export interface DowntimeResults {
  orgDtHours: number;
  unplannedCost: number;
  curStockoutRate: number;
  tgtStockoutRate: number;
  optimizedDtHours: number;
  optimizedDtCost: number;
  dtSavings: number;
}

export interface CalculationResult {
  inventory: InventoryResults | null;
  spend: SpendResults | null;
  downtime: DowntimeResults | null;
  grandTotal: number;
  activeMaterialIncreases: number;
  activeMaterialDecreases: number;
  networkOptimization: number;
  vmiDisposition: number;
  deduplication: number;
  totalReduction: number;
  activeValue: number;
  obsoleteValue: number;
  specialValue: number;
}

function poolingFactor(sites: number): number {
  if (sites <= 1) return 0;
  if (sites <= 5) return 0.04;
  return 0.06;
}

function vmiFactor(skus: number): number {
  if (skus < 50000) return 0.05;
  if (skus <= 100000) return 0.07;
  return 0.09;
}

function dedupFactor(skus: number): number {
  if (skus < 50000) return 0.01;
  if (skus <= 100000) return 0.025;
  return 0.04;
}

function ppvFactor(spend: number): number {
  if (spend < 50000000) return 0.05;
  if (spend <= 100000000) return 0.07;
  return 0.09;
}

export function calculateSavings(inputs: CalculatorInputs, selectedPains: Set<PainPoint>): CalculationResult {
  const { siteCount, totalInventoryValue, skuCount, annualSpend } = inputs;
  const holdingRate = (inputs.holdingCostRate || 15) / 100;
  const waccRate = (inputs.waccRate || 7) / 100;

  const activePct = inputs.activePercent / 100;
  const nonMovingPct = inputs.obsoletePercent / 100;

  const activeVal = totalInventoryValue * activePct;
  const nonMovingVal = totalInventoryValue * nonMovingPct;
  const specialVal = totalInventoryValue * (inputs.specialPercent / 100);

  let inventoryResult: InventoryResults | null = null;
  let spendResult: SpendResults | null = null;
  let downtimeResult: DowntimeResults | null = null;

  const activeIncrease = activeVal * 0.06;
  const activeDecrease = activeVal * 0.22;
  const pooling = (activeVal + nonMovingVal) * poolingFactor(siteCount);
  const vmi = activeVal * vmiFactor(skuCount);
  const dedup = (activeVal + nonMovingVal) * dedupFactor(skuCount);
  const totalInvReduction = activeDecrease + pooling + vmi + dedup;

  if (selectedPains.has("inventory")) {
    inventoryResult = {
      activeIncrease,
      activeDecrease,
      pooling,
      vmi,
      dedup,
      totalInvReduction,
    };
  }

  if (selectedPains.has("spend")) {
    const holdingSavings = totalInvReduction * holdingRate;
    const waccSavings = totalInvReduction * waccRate;
    const ppvSavings = (annualSpend || 0) * ppvFactor(annualSpend || 0);
    const replenishmentSuppression = totalInvReduction * 0.45;
    const repairableMaterials = activeVal * 0.0275;
    const expediting = (annualSpend || 0) * 0.015;
    const totalSpend = holdingSavings + waccSavings + ppvSavings + replenishmentSuppression + repairableMaterials + expediting;

    spendResult = {
      holdingSavings,
      waccSavings,
      ppvSavings,
      replenishmentSuppression,
      repairableMaterials,
      expediting,
      totalSpend,
    };
  }

  if (selectedPains.has("downtime")) {
    const dtHrsPerSite = inputs.downtimeHoursPerSite || 0;
    const dtCostPerHr = inputs.downtimeCostPerHour || 0;
    const svcCurrent = Math.min(inputs.currentServiceLevel || 88, 100) / 100;
    const svcTarget = Math.min(inputs.targetServiceLevel || 95, 98) / 100;
    const stockoutPct = Math.min(inputs.stockoutPercent || 50, 50) / 100;

    const orgDtHours = siteCount * dtHrsPerSite;
    const unplannedCost = orgDtHours * dtCostPerHr;
    const curStockoutRate = 1 - svcCurrent;
    const tgtStockoutRate = 1 - svcTarget;
    const optimizedDtHours = curStockoutRate > 0 ? (tgtStockoutRate * orgDtHours) / curStockoutRate : 0;
    const optimizedDtCost = optimizedDtHours * dtCostPerHr;
    const avoidableDtCost = unplannedCost - optimizedDtCost;
    const dtSavings = avoidableDtCost * stockoutPct;

    downtimeResult = {
      orgDtHours,
      unplannedCost,
      curStockoutRate,
      tgtStockoutRate,
      optimizedDtHours,
      optimizedDtCost,
      dtSavings,
    };
  }

  let grandTotal = 0;
  if (selectedPains.has("inventory")) grandTotal += totalInvReduction;
  if (selectedPains.has("spend") && spendResult) grandTotal += spendResult.totalSpend;
  if (selectedPains.has("downtime") && downtimeResult) grandTotal += downtimeResult.dtSavings;

  return {
    inventory: inventoryResult,
    spend: spendResult,
    downtime: downtimeResult,
    grandTotal,
    activeMaterialIncreases: -activeIncrease,
    activeMaterialDecreases: activeDecrease,
    networkOptimization: pooling,
    vmiDisposition: vmi,
    deduplication: dedup,
    totalReduction: totalInvReduction,
    activeValue: activeVal,
    obsoleteValue: nonMovingVal,
    specialValue: specialVal,
  };
}
