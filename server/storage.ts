import { 
  users, leads, calculations,
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Calculation, type InsertCalculation
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  updateLeadHubspotStatus(id: string, status: string): Promise<void>;
  
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculationsByLeadId(leadId: string): Promise<Calculation[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email));
    return lead || undefined;
  }

  async updateLeadHubspotStatus(id: string, status: string): Promise<void> {
    await db.update(leads).set({ hubspotSynced: status }).where(eq(leads.id, id));
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const [calculation] = await db.insert(calculations).values(insertCalculation).returning();
    return calculation;
  }

  async getCalculationsByLeadId(leadId: string): Promise<Calculation[]> {
    return db.select().from(calculations).where(eq(calculations.leadId, leadId));
  }
}

export const storage = new DatabaseStorage();
