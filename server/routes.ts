import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculationSchema } from "@shared/schema";
import { z } from "zod";

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
  }),
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

      syncToHubSpot(lead, data.calculation).catch(err => {
        console.error("HubSpot sync failed:", err);
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

async function syncToHubSpot(lead: any, calculation: any) {
  const hubspotApiKey = process.env.HUBSPOT_ACCESS_TOKEN;
  
  if (!hubspotApiKey) {
    console.log("HubSpot API key not configured, skipping sync");
    return;
  }

  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hubspotApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email: lead.email,
          firstname: lead.firstName,
          lastname: lead.lastName,
          company: lead.company,
          jobtitle: lead.role,
          inventory_value: calculation.totalInventoryValue,
          optimization_opportunity: calculation.totalReduction,
          site_count: calculation.siteCount,
          sku_count: calculation.skuCount,
        },
      }),
    });

    if (response.ok) {
      await storage.updateLeadHubspotStatus(lead.id, "synced");
      console.log("Lead synced to HubSpot:", lead.email);
    } else {
      const error = await response.text();
      console.error("HubSpot API error:", error);
      await storage.updateLeadHubspotStatus(lead.id, "failed");
    }
  } catch (error) {
    console.error("HubSpot sync error:", error);
    await storage.updateLeadHubspotStatus(lead.id, "failed");
  }
}
