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
  industry?: string;
  campaign?: string;
}

export interface FullCalculationData {
  selectedPains: string[];
  inputs: {
    siteCount: number;
    totalInventoryValue: number;
    skuCount: number;
    activePercent: number;
    obsoletePercent: number;
    specialPercent: number;
    annualSpend?: number;
    holdingCostRate?: number;
    waccRate?: number;
    downtimeHoursPerSite?: number;
    downtimeCostPerHour?: number;
    currentServiceLevel?: number;
    targetServiceLevel?: number;
    stockoutPercent?: number;
  };
  inventory: {
    activeIncrease: number;
    activeDecrease: number;
    pooling: number;
    vmi: number;
    dedup: number;
    totalInvReduction: number;
  } | null;
  spend: {
    holdingSavings: number;
    waccSavings: number;
    ppvSavings: number;
    replenishmentSuppression: number;
    repairableMaterials: number;
    expediting: number;
    totalSpend: number;
  } | null;
  downtime: {
    orgDtHours: number;
    unplannedCost: number;
    curStockoutRate: number;
    tgtStockoutRate: number;
    optimizedDtHours: number;
    optimizedDtCost: number;
    dtSavings: number;
  } | null;
  grandTotal: number;
}

// HubSpot Form Configuration
const HUBSPOT_PORTAL_ID = '2886100';
const HUBSPOT_FORM_GUID = 'b34a5604-13b5-4746-b578-b469c5320b76';

const fmtCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const painLabels: Record<string, string> = {
  inventory: 'Inventory Reduction',
  spend: 'Spend Reduction/Avoidance',
  downtime: 'Downtime Avoidance',
};

function buildCalculatorNote(lead: LeadData, data: FullCalculationData): string {
  const lines: string[] = [];
  lines.push('MRO Inventory Calculator Results');
  lines.push('==============================================');
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  if (lead.industry) lines.push(`Industry: ${lead.industry}`);
  if (lead.campaign) lines.push(`Campaign: ${lead.campaign}`);
  lines.push('');

  lines.push(`TOTAL MRO OPTIMIZATION OPPORTUNITY: ${fmtCurrency(data.grandTotal)}`);
  lines.push('');

  const painList = data.selectedPains.map(p => painLabels[p] || p).join(', ') || 'None';
  lines.push(`Selected Focus Areas: ${painList}`);
  lines.push('');

  // Inputs
  lines.push('INPUT PROFILE:');
  lines.push(`- Number of Sites: ${data.inputs.siteCount}`);
  lines.push(`- Total Inventory Value: ${fmtCurrency(data.inputs.totalInventoryValue)}`);
  lines.push(`- SKU Count: ${data.inputs.skuCount.toLocaleString()}`);
  lines.push(`- Active Materials: ${data.inputs.activePercent}%`);
  lines.push(`- Obsolete/Non-Moving: ${data.inputs.obsoletePercent}%`);
  lines.push(`- Special/Critical Items: ${data.inputs.specialPercent}%`);
  if (data.selectedPains.includes('spend')) {
    lines.push(`- Annual MRO Spend: ${fmtCurrency(data.inputs.annualSpend || 0)}`);
    lines.push(`- Holding Cost Rate: ${data.inputs.holdingCostRate ?? 15}%`);
    lines.push(`- WACC Rate: ${data.inputs.waccRate ?? 7}%`);
  }
  if (data.selectedPains.includes('downtime')) {
    lines.push(`- Downtime Hours/Site/Year: ${data.inputs.downtimeHoursPerSite ?? 0}`);
    lines.push(`- Downtime Cost/Hour: ${fmtCurrency(data.inputs.downtimeCostPerHour || 0)}`);
    lines.push(`- Current Service Level: ${data.inputs.currentServiceLevel ?? 88}%`);
    lines.push(`- Target Service Level: ${data.inputs.targetServiceLevel ?? 95}%`);
    lines.push(`- Stockout-Attributable Downtime: ${data.inputs.stockoutPercent ?? 50}%`);
  }
  lines.push('');

  if (data.inventory) {
    lines.push('---------------- MRO INVENTORY OPTIMIZATION ----------------');
    lines.push(`Total Inventory Value Reduction: ${fmtCurrency(data.inventory.totalInvReduction)}`);
    lines.push(`- Active Material Reduction: ${fmtCurrency(data.inventory.activeDecrease)}`);
    lines.push(`- Parts Pooling & Network Sharing: ${fmtCurrency(data.inventory.pooling)}`);
    lines.push(`- VMI Disposition: ${fmtCurrency(data.inventory.vmi)}`);
    lines.push(`- Deduplication: ${fmtCurrency(data.inventory.dedup)}`);
    lines.push(`- Stockout Mitigation Increases (investment): ${fmtCurrency(data.inventory.activeIncrease)}`);
    lines.push('');
  }

  if (data.spend) {
    lines.push('---------------- SPEND REDUCTION / AVOIDANCE ----------------');
    lines.push(`Total Annual Spend Reduction: ${fmtCurrency(data.spend.totalSpend)}`);
    lines.push(`- Holding Cost Savings: ${fmtCurrency(data.spend.holdingSavings)}`);
    lines.push(`- WACC Savings: ${fmtCurrency(data.spend.waccSavings)}`);
    lines.push(`- PPV & Tailspend Savings: ${fmtCurrency(data.spend.ppvSavings)}`);
    lines.push(`- Replenishment Suppression: ${fmtCurrency(data.spend.replenishmentSuppression)}`);
    lines.push(`- Additional Repairable Materials: ${fmtCurrency(data.spend.repairableMaterials)}`);
    lines.push(`- Expediting Cost Reduction: ${fmtCurrency(data.spend.expediting)}`);
    lines.push('');
  }

  if (data.downtime) {
    lines.push('---------------- DOWNTIME AVOIDANCE ----------------');
    lines.push(`Total Downtime Cost Avoidance: ${fmtCurrency(data.downtime.dtSavings)}`);
    lines.push(`- Org-Wide Unplanned Downtime: ${Math.round(data.downtime.orgDtHours).toLocaleString()} hrs (current) -> ${Math.round(data.downtime.optimizedDtHours).toLocaleString()} hrs (optimized)`);
    lines.push(`- Unplanned Downtime Cost: ${fmtCurrency(data.downtime.unplannedCost)} (current) -> ${fmtCurrency(data.downtime.optimizedDtCost)} (optimized)`);
    lines.push(`- Critical Spares Stockout Rate: ${(data.downtime.curStockoutRate * 100).toFixed(0)}% (current) -> ${(data.downtime.tgtStockoutRate * 100).toFixed(0)}% (target)`);
    lines.push('');
  }

  lines.push('==============================================');
  lines.push(`GRAND TOTAL: ${fmtCurrency(data.grandTotal)}`);

  return lines.join('\n');
}

// Submit to HubSpot Forms API to track as a form submission
async function submitToHubSpotForm(lead: LeadData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Starting HubSpot Form submission for:', lead.email);

    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const fields: Array<{ name: string; value: string }> = [
      { name: 'email', value: lead.email },
      { name: 'firstname', value: firstName },
      { name: 'lastname', value: lastName },
      { name: 'company', value: lead.company },
      { name: 'function', value: lead.jobFunction }
    ];
    if (lead.industry) fields.push({ name: 'industry', value: lead.industry });
    if (lead.campaign) fields.push({ name: 'lead_source_campaign', value: lead.campaign });

    const formData = {
      fields,
      context: {
        pageUri: process.env.NODE_ENV === 'production'
          ? 'https://verusenai-mro-inventory-calculator.onrender.com/'
          : 'https://mro-calculator.replit.app/',
        pageName: 'MRO Inventory Calculator'
      }
    };

    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const responseText = await response.text();
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

export async function syncLeadToHubSpot(
  lead: LeadData,
  calculation: FullCalculationData
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    console.log('=== Starting HubSpot sync for lead ===', lead.email);

    // First, submit to the HubSpot Form to track as a form fill (fire and forget result)
    const formResult = await submitToHubSpotForm(lead);
    if (!formResult.success) {
      console.warn('Form submission failed, continuing with CRM sync:', formResult.error);
    }

    const client = await getHubSpotClient();

    // Split name into first and last
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const calculatorNote = buildCalculatorNote(lead, calculation);

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
      console.log('Contact not found, will create new one');
    }

    const baseProps: Record<string, string> = {
      firstname: firstName,
      lastname: lastName,
      company: lead.company,
      function: lead.jobFunction,
    };
    if (lead.industry) baseProps.industry = lead.industry;
    if (lead.campaign) baseProps.lead_source_campaign = lead.campaign;

    const coreProps: Record<string, string> = {
      firstname: firstName,
      lastname: lastName,
      company: lead.company,
      function: lead.jobFunction,
    };

    const upsertContact = async (existingId?: string) => {
      const propsLevels: Array<Record<string, string>> = [
        baseProps,
        Object.fromEntries(Object.entries(baseProps).filter(([k]) => k !== 'lead_source_campaign')),
        Object.fromEntries(Object.entries(baseProps).filter(([k]) => k !== 'lead_source_campaign' && k !== 'industry')),
        coreProps,
      ];

      let lastErr: any;
      let currentId = existingId;
      for (const props of propsLevels) {
        try {
          if (currentId) {
            await client.crm.contacts.basicApi.update(currentId, { properties: props });
            return currentId;
          } else {
            const r = await client.crm.contacts.basicApi.create({
              properties: { email: lead.email, ...props }
            });
            return r.id;
          }
        } catch (err: any) {
          lastErr = err;
          // Handle race condition: Forms API may have just created the contact.
          // HubSpot returns 409 with the existing ID in the message body.
          const isConflict = err?.code === 409 || err?.body?.category === 'CONFLICT';
          if (isConflict && !currentId) {
            const msg: string = err?.body?.message || err?.message || '';
            const idMatch = msg.match(/Existing ID:\s*(\d+)/);
            if (idMatch) {
              currentId = idMatch[1];
              console.log('HubSpot 409 conflict; switching to update on existing contact', currentId);
              // Retry the same prop level as an update before falling through.
              try {
                await client.crm.contacts.basicApi.update(currentId, { properties: props });
                return currentId;
              } catch (updateErr: any) {
                lastErr = updateErr;
                console.warn('HubSpot update after 409 failed, will retry with reduced props:', updateErr?.message);
              }
            }
          } else {
            console.warn('HubSpot contact write failed, will retry with reduced props:', err?.message);
          }
        }
      }
      throw lastErr;
    };

    contactId = await upsertContact(contactId);

    // Add a note with the calculator results
    if (contactId) {
      try {
        await client.crm.objects.notes.basicApi.create({
          properties: {
            hs_note_body: calculatorNote,
            hs_timestamp: new Date().toISOString()
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
              associationTypeId: 202
            }]
          }]
        });
      } catch (noteErr: any) {
        console.error('Failed to create calculator note:', noteErr?.message);
      }
    }

    return { success: true, contactId };
  } catch (error: any) {
    console.error('HubSpot sync error:', error);
    return { success: false, error: error.message || 'Failed to sync to HubSpot' };
  }
}

/**
 * Upload a PDF report and attach it to a HubSpot contact via a note attachment.
 * Looks up the contact by email if it exists. Fails silently with logging — never throws.
 */
export async function attachPdfReportToContact(
  contactId: string,
  pdfBase64: string,
  filename: string
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const client = new Client({ accessToken });

    // Decode the base64 PDF and validate it really is a PDF before uploading
    // to HubSpot under our privileged token.
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    if (pdfBuffer.length === 0) {
      return { success: false, error: 'Empty PDF' };
    }
    if (pdfBuffer.length > 25 * 1024 * 1024) {
      console.warn('PDF attach: file too large', pdfBuffer.length);
      return { success: false, error: 'PDF exceeds 25MB' };
    }
    // PDF magic bytes: "%PDF-"
    const header = pdfBuffer.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      console.warn('PDF attach: invalid PDF header', header);
      return { success: false, error: 'Invalid PDF file' };
    }

    // Upload the file via HubSpot Files API (multipart/form-data)
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);
    formData.append('folderPath', '/calculator-reports');
    formData.append('options', JSON.stringify({
      access: 'PRIVATE',
      overwrite: false,
      duplicateValidationStrategy: 'NONE',
      duplicateValidationScope: 'ENTIRE_PORTAL',
    }));

    const uploadResp = await fetch('https://api.hubapi.com/files/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData as any,
    });
    const uploadText = await uploadResp.text();
    if (!uploadResp.ok) {
      console.error('HubSpot Files upload failed:', uploadResp.status, uploadText);
      return { success: false, error: `Files API ${uploadResp.status}` };
    }
    const fileData = JSON.parse(uploadText);
    const fileId: string | undefined = fileData.id;
    if (!fileId) {
      console.error('HubSpot Files upload: no file id in response', uploadText);
      return { success: false, error: 'No file id returned' };
    }

    // Create a note that attaches the file and is associated with the contact.
    // hs_attachment_ids accepts a semicolon-delimited string of file IDs.
    try {
      await client.crm.objects.notes.basicApi.create({
        properties: {
          hs_note_body: `Calculator PDF report attached: ${filename}`,
          hs_timestamp: new Date().toISOString(),
          hs_attachment_ids: String(fileId),
        },
        associations: [{
          to: { id: contactId },
          types: [{
            associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
            associationTypeId: 202
          }]
        }]
      });
    } catch (noteErr: any) {
      console.error('Failed to create attachment note:', noteErr?.message);
      return { success: false, fileId, error: 'Note creation failed' };
    }

    console.log('PDF attached to contact', contactId, 'fileId:', fileId);
    return { success: true, fileId };
  } catch (error: any) {
    console.error('attachPdfReportToContact error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
