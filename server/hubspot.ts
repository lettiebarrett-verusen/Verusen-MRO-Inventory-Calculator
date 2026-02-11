import { Client } from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { AssociationSpecAssociationCategoryEnum } from '@hubspot/api-client/lib/codegen/crm/objects/notes';

let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (process.env.HUBSPOT_ACCESS_TOKEN) {
    return process.env.HUBSPOT_ACCESS_TOKEN;
  }

  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('HubSpot not configured: set HUBSPOT_ACCESS_TOKEN environment variable');
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

async function getHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

interface LeadData {
  name: string;
  email: string;
  company: string;
  jobFunction: string;
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

// HubSpot Form Configuration
const HUBSPOT_PORTAL_ID = '2886100';
const HUBSPOT_FORM_GUID = 'b34a5604-13b5-4746-b578-b469c5320b76';

// Submit to HubSpot Forms API to track as a form submission
async function submitToHubSpotForm(lead: LeadData, calculation: CalculationData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Starting HubSpot Form submission for:', lead.email);
    
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const formData = {
      fields: [
        { name: 'email', value: lead.email },
        { name: 'firstname', value: firstName },
        { name: 'lastname', value: lastName },
        { name: 'company', value: lead.company },
        { name: 'function', value: lead.jobFunction }
      ],
      context: {
        pageUri: process.env.NODE_ENV === 'production' 
          ? 'https://verusenai-mro-inventory-calculator.onrender.com/'
          : 'https://mro-calculator.replit.app/',
        pageName: 'MRO Inventory Optimization Calculator'
      }
    };

    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;
    console.log('Submitting to HubSpot Form endpoint:', endpoint);
    console.log('Form data:', JSON.stringify(formData, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const responseText = await response.text();
    console.log('HubSpot Form API response status:', response.status);
    console.log('HubSpot Form API response:', responseText);

    if (!response.ok) {
      console.error('HubSpot Form API error:', responseText);
      return { success: false, error: responseText };
    }

    console.log('Form submission tracked in HubSpot successfully');
    return { success: true };
  } catch (error: any) {
    console.error('HubSpot Form submission error:', error);
    return { success: false, error: error.message };
  }
}

export async function syncLeadToHubSpot(lead: LeadData, calculation: CalculationData): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    console.log('=== Starting HubSpot sync for lead ===');
    console.log('Lead email:', lead.email);
    console.log('Lead name:', lead.name);
    console.log('Lead company:', lead.company);
    console.log('Lead jobFunction:', lead.jobFunction);
    
    // First, submit to the HubSpot Form to track as a form fill
    const formResult = await submitToHubSpotForm(lead, calculation);
    console.log('Form submission result:', formResult);
    if (!formResult.success) {
      console.warn('Form submission failed, continuing with CRM sync:', formResult.error);
    } else {
      console.log('Form submission successful!');
    }

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
          function: lead.jobFunction
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
          function: lead.jobFunction
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
