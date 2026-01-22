import { z } from "zod";

export const calculatorSchema = z.object({
  siteCount: z.number().min(1, "At least 1 site is required"),
  totalInventoryValue: z.number().min(1000, "Value must be at least $1,000"),
  skuCount: z.number().min(1, "At least 1 SKU is required"),
  // Percentages - represented as 0-100 integers
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

export const leadSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address").refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !personalEmailDomains.includes(domain);
  }, "Please use your business email address"),
  company: z.string().min(2, "Company name is required"),
  jobFunction: z.string().min(1, "Please select your function"),
});

export type LeadInputs = z.infer<typeof leadSchema>;

export interface CalculationResult {
  activeOptimization: number;
  networkOptimization: number;
  vmiDisposition: number;
  deduplication: number;
  obsoleteReduction: number;
  totalReduction: number;
  // Breakdowns for charts
  activeValue: number;
  obsoleteValue: number;
  specialValue: number;
}

export function calculateSavings(inputs: CalculatorInputs): CalculationResult {
  const { totalInventoryValue, activePercent, obsoletePercent, specialPercent, siteCount } = inputs;

  const activeVal = totalInventoryValue * (activePercent / 100);
  const obsoleteVal = totalInventoryValue * (obsoletePercent / 100);
  const specialVal = totalInventoryValue * (specialPercent / 100);

  // Placeholder Logic based on industry benchmarks
  // 1. Obsolete Reduction: We can usually clear ~60% of dead stock
  const obsoleteReduction = obsoleteVal * 0.60;

  // 2. Network Optimization: If > 1 site, we can optimize ~8% of active inventory via transfers
  const networkOptimization = siteCount > 1 ? activeVal * 0.08 : 0;

  // 3. Deduplication: If > 1 site, usually ~4% of total value is duplicate safety stock
  const deduplication = siteCount > 1 ? totalInventoryValue * 0.04 : 0;

  // 4. VMI Disposition: We can often move ~30% of "Special" (often consumables/MRO) to VMI
  const vmiDisposition = specialVal * 0.30;

  // 5. Active Optimization: General improved forecasting on active items ~5%
  const activeOptimization = activeVal * 0.05;

  const totalReduction = obsoleteReduction + networkOptimization + deduplication + vmiDisposition + activeOptimization;

  return {
    activeOptimization,
    networkOptimization,
    vmiDisposition,
    deduplication,
    obsoleteReduction,
    totalReduction,
    activeValue: activeVal,
    obsoleteValue: obsoleteVal,
    specialValue: specialVal,
  };
}
