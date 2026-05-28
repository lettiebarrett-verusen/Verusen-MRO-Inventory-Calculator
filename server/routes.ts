import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { z } from "zod";
import { syncLeadToHubSpot, attachPdfReportToContact, type FullCalculationData } from "./hubspot";

// Secret used to sign short-lived PDF-upload tokens. Persisted across requests
// within a single process; regenerated on each restart (acceptable — tokens
// only need to outlive a single browser session, < 10 min).
const PDF_UPLOAD_SECRET = process.env.PDF_UPLOAD_SECRET
  || process.env.SESSION_SECRET
  || crypto.randomBytes(32).toString("hex");
const PDF_UPLOAD_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function signPdfUploadToken(payload: { contactId: string; email: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", PDF_UPLOAD_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyPdfUploadToken(token: string): { contactId: string; email: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", PDF_UPLOAD_SECRET).update(body).digest("base64url");
  // Timing-safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.contactId !== "string" || typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { contactId: payload.contactId, email: payload.email };
  } catch {
    return null;
  }
}

const inputsSchema = z.object({
  siteCount: z.number().min(1),
  totalInventoryValue: z.number().min(1000),
  skuCount: z.number().min(1),
  activePercent: z.number().min(0).max(100),
  obsoletePercent: z.number().min(0).max(100),
  specialPercent: z.number().min(0).max(100),
  annualSpend: z.number().optional(),
  holdingCostRate: z.number().optional(),
  waccRate: z.number().optional(),
  downtimeHoursPerSite: z.number().optional(),
  downtimeCostPerHour: z.number().optional(),
  currentServiceLevel: z.number().optional(),
  targetServiceLevel: z.number().optional(),
  stockoutPercent: z.number().optional(),
});

const inventoryResultSchema = z.object({
  activeIncrease: z.number(),
  activeDecrease: z.number(),
  pooling: z.number(),
  vmi: z.number(),
  dedup: z.number(),
  totalInvReduction: z.number(),
});

const spendResultSchema = z.object({
  holdingSavings: z.number(),
  waccSavings: z.number(),
  ppvSavings: z.number(),
  replenishmentSuppression: z.number(),
  repairableMaterials: z.number(),
  expediting: z.number(),
  totalSpend: z.number(),
});

const downtimeResultSchema = z.object({
  orgDtHours: z.number(),
  unplannedCost: z.number(),
  curStockoutRate: z.number(),
  tgtStockoutRate: z.number(),
  optimizedDtHours: z.number(),
  optimizedDtCost: z.number(),
  dtSavings: z.number(),
});

const submitLeadSchema = z.object({
  lead: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    company: z.string().min(2),
    jobFunction: z.string().min(1),
  }),
  industry: z.string().optional().default(""),
  campaign: z.string().optional().default(""),
  selectedPains: z.array(z.enum(["inventory", "spend", "downtime"])).default([]),
  inputs: inputsSchema,
  results: z.object({
    inventory: inventoryResultSchema.nullable(),
    spend: spendResultSchema.nullable(),
    downtime: downtimeResultSchema.nullable(),
    grandTotal: z.number(),
  }),
});

const attachPdfSchema = z.object({
  token: z.string().min(1),
  filename: z.string().min(1).max(200),
  pdfBase64: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/leads", async (req, res) => {
    try {
      const data = submitLeadSchema.parse(req.body);

      const fullName = `${data.lead.firstName} ${data.lead.lastName}`;

      const fullCalc: FullCalculationData = {
        selectedPains: data.selectedPains,
        inputs: data.inputs,
        inventory: data.results.inventory,
        spend: data.results.spend,
        downtime: data.results.downtime,
        grandTotal: data.results.grandTotal,
      };

      // Await HubSpot sync so we can return the contactId for the follow-up PDF upload.
      let contactId: string | undefined;
      try {
        const syncResult = await syncLeadToHubSpot(
          {
            name: fullName,
            email: data.lead.email,
            company: data.lead.company,
            jobFunction: data.lead.jobFunction,
            industry: data.industry,
            campaign: data.campaign,
          },
          fullCalc
        );
        if (syncResult.success) {
          console.log("Lead synced to HubSpot:", data.lead.email);
          contactId = syncResult.contactId;
        } else {
          console.error("HubSpot sync failed:", syncResult.error);
        }
      } catch (err) {
        console.error("HubSpot sync threw:", err);
      }

      // Persist to DB (best-effort) — keep existing schema, only the inventory fields are stored.
      let leadId = "hubspot-only";
      let calculationId = "hubspot-only";

      try {
        const existingLead = await storage.getLeadByEmail(data.lead.email);
        const lead = existingLead || await storage.createLead({
          firstName: data.lead.firstName,
          lastName: data.lead.lastName,
          email: data.lead.email,
          company: data.lead.company,
          role: data.lead.jobFunction,
        });

        const inv = data.results.inventory;
        const calculation = await storage.createCalculation({
          leadId: lead.id,
          siteCount: data.inputs.siteCount,
          totalInventoryValue: data.inputs.totalInventoryValue,
          skuCount: data.inputs.skuCount,
          activePercent: data.inputs.activePercent,
          obsoletePercent: data.inputs.obsoletePercent,
          specialPercent: data.inputs.specialPercent,
          activeMaterialIncreases: inv ? -inv.activeIncrease : 0,
          activeMaterialDecreases: inv?.activeDecrease ?? 0,
          networkOptimization: inv?.pooling ?? 0,
          vmiDisposition: inv?.vmi ?? 0,
          deduplication: inv?.dedup ?? 0,
          totalReduction: inv?.totalInvReduction ?? 0,
        });

        leadId = lead.id;
        calculationId = calculation.id;
      } catch (dbError) {
        console.error("Database save error (HubSpot sync still attempted):", dbError);
      }

      const pdfUploadToken = contactId
        ? signPdfUploadToken({
            contactId,
            email: data.lead.email,
            exp: Date.now() + PDF_UPLOAD_TOKEN_TTL_MS,
          })
        : undefined;

      res.json({
        success: true,
        leadId,
        calculationId,
        contactId,
        pdfUploadToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        console.error("Lead submission error:", error);
        res.status(500).json({ error: "Failed to save lead" });
      }
    }
  });

  // Accept the PDF generated client-side and attach it to the HubSpot contact.
  // Fails silently from the user's perspective — the calculator continues to work either way.
  app.post("/api/leads/attach-pdf", async (req, res) => {
    try {
      const data = attachPdfSchema.parse(req.body);
      // Reject extremely large payloads early (base64 inflates ~33%; 30MB base64 ≈ 22MB binary)
      if (data.pdfBase64.length > 30 * 1024 * 1024) {
        return res.status(413).json({ success: false, error: "PDF too large" });
      }
      const verified = verifyPdfUploadToken(data.token);
      if (!verified) {
        return res.status(401).json({ success: false, error: "Invalid or expired token" });
      }
      const result = await attachPdfReportToContact(verified.contactId, data.pdfBase64, data.filename);
      // Always respond 200 — frontend should not surface attach failures to user.
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed" });
      }
      console.error("PDF attach error:", error);
      res.status(500).json({ success: false, error: "Failed to attach PDF" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      const calculations = await storage.getCalculationsByLeadId(lead.id);
      res.json({ lead, calculations });
    } catch (error) {
      console.error("Get lead error:", error);
      res.status(500).json({ error: "Failed to get lead" });
    }
  });

  return httpServer;
}
