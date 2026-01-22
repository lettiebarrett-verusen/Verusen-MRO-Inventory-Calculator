// HubSpot Integration - Using Replit Connector
import { Client } from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { AssociationSpecAssociationCategoryEnum } from '@hubspot/api-client/lib/codegen/crm/objects/notes';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
async function getHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

interface LeadData {
  name: string;
  email: string;
  company: string;
  role: string;
}

interface CalculationData {
  siteCount: number;
  totalInventoryValue: number;
  skuCount: number;
  activePercent: number;
  obsoletePercent: number;
  specialPercent: number;
  activeOptimization: number;
  networkOptimization: number;
  vmiDisposition: number;
  deduplication: number;
  obsoleteReduction: number;
  totalReduction: number;
}

export async function syncLeadToHubSpot(lead: LeadData, calculation: CalculationData): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    const client = await getHubSpotClient();
    
    // Format currency for notes
    const formatCurrency = (val: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    // Split name into first and last
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build the calculator results note
    const calculatorNote = `
MRO Inventory Optimization Calculator Results
==============================================
Date: ${new Date().toLocaleDateString()}

INPUT PROFILE:
- Number of Sites: ${calculation.siteCount}
- Total Inventory Value: ${formatCurrency(calculation.totalInventoryValue)}
- SKU Count: ${calculation.skuCount.toLocaleString()}
- Active Materials: ${calculation.activePercent}%
- Obsolete/Non-Moving: ${calculation.obsoletePercent}%
- Special/Critical Items: ${calculation.specialPercent}%

OPTIMIZATION OPPORTUNITIES:
- Active Material Optimization: ${formatCurrency(calculation.activeOptimization)}
- Network Optimization & Transfers: ${formatCurrency(calculation.networkOptimization)}
- VMI Disposition: ${formatCurrency(calculation.vmiDisposition)}
- Deduplication Savings: ${formatCurrency(calculation.deduplication)}
- Obsolete Reduction: ${formatCurrency(calculation.obsoleteReduction)}

TOTAL OPTIMIZATION OPPORTUNITY: ${formatCurrency(calculation.totalReduction)}
    `.trim();

    // Check if contact already exists
    let contactId: string | undefined;
    
    try {
      const searchResponse = await client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: FilterOperatorEnum.Eq,
            value: lead.email
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1
      });

      if (searchResponse.results && searchResponse.results.length > 0) {
        contactId = searchResponse.results[0].id;
      }
    } catch (searchError) {
      // Contact doesn't exist, we'll create it
      console.log('Contact not found, will create new one');
    }

    if (contactId) {
      // Update existing contact
      await client.crm.contacts.basicApi.update(contactId, {
        properties: {
          firstname: firstName,
          lastname: lastName,
          company: lead.company,
          jobtitle: lead.role
        }
      });
    } else {
      // Create new contact
      const createResponse = await client.crm.contacts.basicApi.create({
        properties: {
          email: lead.email,
          firstname: firstName,
          lastname: lastName,
          company: lead.company,
          jobtitle: lead.role
        }
      });
      contactId = createResponse.id;
    }

    // Add a note with the calculator results
    if (contactId) {
      await client.crm.objects.notes.basicApi.create({
        properties: {
          hs_note_body: calculatorNote,
          hs_timestamp: new Date().toISOString()
        },
        associations: [{
          to: { id: contactId },
          types: [{
            associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
            associationTypeId: 202 // Note to Contact association
          }]
        }]
      });
    }

    return { success: true, contactId };
  } catch (error: any) {
    console.error('HubSpot sync error:', error);
    return { success: false, error: error.message || 'Failed to sync to HubSpot' };
  }
}
