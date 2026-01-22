import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema } from "@shared/schema";
import { z } from "zod";
import { syncLeadToHubSpot } from "./hubspot";

const submitLeadSchema = z.object({
  lead: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    company: z.string().min(2),
    role: z.string().min(2),
  }),
  calculation: z.object({
    siteCount: z.number().min(1),
    totalInventoryValue: z.number().min(1000),
    skuCount: z.number().min(1),
    activePercent: z.number().min(0).max(100),
    obsoletePercent: z.number().min(0).max(100),
    specialPercent: z.number().min(0).max(100),
    activeOptimization: z.number(),
    networkOptimization: z.number(),
    vmiDisposition: z.number(),
    deduplication: z.number(),
    obsoleteReduction: z.number(),
    totalReduction: z.number(),
  }).refine(data => {
    const sum = data.activePercent + data.obsoletePercent + data.specialPercent;
    return Math.abs(sum - 100) < 1;
  }, { message: "Percentages must add up to 100%" }),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/leads", async (req, res) => {
    try {
      const data = submitLeadSchema.parse(req.body);
      
      const existingLead = await storage.getLeadByEmail(data.lead.email);
      let lead;
      
      if (existingLead) {
        lead = existingLead;
      } else {
        lead = await storage.createLead(data.lead);
      }
      
      const calculation = await storage.createCalculation({
        leadId: lead.id,
        ...data.calculation,
      });

      // Sync to HubSpot using Replit connector
      const fullName = `${data.lead.firstName} ${data.lead.lastName}`;
      syncLeadToHubSpot(
        { name: fullName, email: data.lead.email, company: data.lead.company, role: data.lead.role },
        data.calculation
      ).then(result => {
        if (result.success) {
          storage.updateLeadHubspotStatus(lead.id, "synced");
          console.log("Lead synced to HubSpot:", data.lead.email);
        } else {
          storage.updateLeadHubspotStatus(lead.id, "failed");
          console.error("HubSpot sync failed:", result.error);
        }
      }).catch(err => {
        console.error("HubSpot sync failed:", err);
        storage.updateLeadHubspotStatus(lead.id, "failed");
      });

      res.json({ 
        success: true, 
        leadId: lead.id, 
        calculationId: calculation.id 
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

