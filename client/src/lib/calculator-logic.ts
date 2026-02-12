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

export const calculatorSchema = z.object({
  siteCount: z.number().min(1, "At least 1 site is required"),
  totalInventoryValue: z.number().min(1000, "Value must be at least $1,000"),
  skuCount: z.number().min(1, "At least 1 SKU is required"),
  industry: z.string().min(1, "Please select your industry"),
  activePercent: z.number().min(0).max(100),
  obsoletePercent: z.number().min(0).max(100),
  specialPercent: z.number().min(0).max(100),
}).refine(data => {
  const sum = data.activePercent + data.obsoletePercent + data.specialPercent;
  return Math.abs(sum - 100) < 1; // Allow small float error
}, {
  message: "Percentages must add up to 100%",
  path: ["specialPercent"], // Show error on the last one
});

export type CalculatorInputs = z.infer<typeof calculatorSchema>;

// Personal email domains to block
const personalEmailDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'live.com', 'msn.com', 'me.com', 'comcast.net',
  'att.net', 'verizon.net', 'sbcglobal.net', 'bellsouth.net', 'cox.net',
  'earthlink.net', 'charter.net', 'optonline.net', 'frontier.com',
  'yahoo.co.uk', 'hotmail.co.uk', 'googlemail.com', 'rocketmail.com',
  'ymail.com', 'inbox.com', 'mail.ru', 'qq.com', '163.com', '126.com'
];

// Competitor domains to block
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

export interface CalculationResult {
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

function getNetworkSlidingFactor(siteCount: number): number {
  if (siteCount <= 1) return 0;
  if (siteCount <= 4) return 0.04;
  return 0.06;
}

function getVmiSlidingFactor(skuCount: number): number {
  if (skuCount < 50000) return 0.05;
  if (skuCount <= 100000) return 0.07;
  return 0.09;
}

function getDeduplicationSlidingFactor(skuCount: number): number {
  if (skuCount < 50000) return 0.01;
  if (skuCount <= 100000) return 0.025;
  return 0.04;
}

export function calculateSavings(inputs: CalculatorInputs): CalculationResult {
  const { totalInventoryValue, activePercent, obsoletePercent, specialPercent, siteCount, skuCount } = inputs;

  const activeVal = totalInventoryValue * (activePercent / 100);
  const obsoleteVal = totalInventoryValue * (obsoletePercent / 100);
  const specialVal = totalInventoryValue * (specialPercent / 100);

  const activeMaterialIncreases = activeVal * 0.06 * -1;
  const activeMaterialDecreases = activeVal * 0.22;
  const networkOptimization = (activeVal + obsoleteVal) * getNetworkSlidingFactor(siteCount);
  const vmiDisposition = activeVal * getVmiSlidingFactor(skuCount);
  const deduplication = (activeVal + obsoleteVal) * getDeduplicationSlidingFactor(skuCount);

  const totalReduction = activeMaterialIncreases + activeMaterialDecreases + networkOptimization + vmiDisposition + deduplication;

  return {
    activeMaterialIncreases,
    activeMaterialDecreases,
    networkOptimization,
    vmiDisposition,
    deduplication,
    totalReduction,
    activeValue: activeVal,
    obsoleteValue: obsoleteVal,
    specialValue: specialVal,
  };
}
