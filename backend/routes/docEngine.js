const express = require('express');
const supabase = require('../config/db');
const authenticateAdmin = require('../middleware/auth');
const { renderDocument } = require('../engine/renderEngine');
const { BrevoProvider } = require('../engine/emailProvider');
const { parseCSV } = require('../engine/csvParser');
const { generateDocumentIds } = require('../engine/documentIdGenerator');
const archiver = require('archiver');

const router = express.Router();

// ── Apply authenticateAdmin to ALL doc engine routes ─────────────
router.use(authenticateAdmin);

// ── STALE LOCK TIMEOUT (10 minutes) ─────────────────────────────
const STALE_LOCK_MS = 10 * 60 * 1000;

/**
 * Checks if a campaign's 'sending' status is stale (>10 min with no progress).
 * If stale, resets to 'failed' so it can be retried.
 */
async function recoverStaleLock(campaignId) {
  const { data: campaign } = await supabase
    .from('doc_campaigns')
    .select('status, completed_at, created_at')
    .eq('id', campaignId)
    .single();

  if (!campaign || campaign.status !== 'sending') return false;

  // Check last activity: use completed_at or fall back to created_at
  const lastActivity = campaign.completed_at || campaign.created_at;
  const elapsed = Date.now() - new Date(lastActivity).getTime();

  if (elapsed > STALE_LOCK_MS) {
    await supabase
      .from('doc_campaigns')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', campaignId);
    console.warn(`🔓 Campaign ${campaignId} stale lock recovered (stuck for ${Math.round(elapsed / 60000)}min)`);
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════════
// HELPER: Fetch template background image (cached per call)
// ══════════════════════════════════════════════════════════════════

async function fetchTemplateImage(templateId, version) {
  const { data: tv, error } = await supabase
    .from('doc_template_versions')
    .select('*')
    .eq('template_id', templateId)
    .eq('version', version)
    .single();

  if (error || !tv) throw new Error('Template version not found');

  // Fetch background image from URL
  const imgResponse = await fetch(tv.base_image_url);
  if (!imgResponse.ok) throw new Error(`Failed to fetch template image: ${imgResponse.statusText}`);
  const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());

  return { layoutJson: tv.layout_json, imageBuffer: imgBuffer };
}

// ══════════════════════════════════════════════════════════════════
// WORKSPACE CRUD
// ══════════════════════════════════════════════════════════════════

// GET /api/doc/workspaces — list all workspaces
router.get('/workspaces', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doc_workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/workspaces — create workspace
router.post('/workspaces', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Workspace name is required' });

    const { data, error } = await supabase
      .from('doc_workspaces')
      .insert([{ name }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/doc/workspaces/:id — delete workspace
router.delete('/workspaces/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('doc_workspaces')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// PROJECT CRUD
// ══════════════════════════════════════════════════════════════════

// GET /api/doc/projects/:workspaceId — list projects in workspace
router.get('/projects/:workspaceId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doc_projects')
      .select('*')
      .eq('workspace_id', req.params.workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/projects — create project
router.post('/projects', async (req, res, next) => {
  try {
    const { workspace_id, name, description } = req.body;
    if (!workspace_id || !name) {
      return res.status(400).json({ error: 'workspace_id and name are required' });
    }

    const { data, error } = await supabase
      .from('doc_projects')
      .insert([{ workspace_id, name, description }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/doc/projects/:id — delete project
router.delete('/projects/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('doc_projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// TEMPLATE MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET /api/doc/templates/:workspaceId — list templates in workspace
router.get('/templates/:workspaceId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doc_templates')
      .select('*')
      .eq('workspace_id', req.params.workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/templates — create template
router.post('/templates', async (req, res, next) => {
  try {
    const { workspace_id, name, document_type = 'certificate' } = req.body;
    if (!workspace_id || !name) {
      return res.status(400).json({ error: 'workspace_id and name are required' });
    }

    const { data, error } = await supabase
      .from('doc_templates')
      .insert([{ workspace_id, name, document_type }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/doc/templates/:id/version — save new version
router.put('/templates/:id/version', async (req, res, next) => {
  try {
    const { layout_json, base_image_url } = req.body;
    if (!layout_json || !base_image_url) {
      return res.status(400).json({ error: 'layout_json and base_image_url are required' });
    }

    // Determine the next version number
    const { data: existing, error: fetchError } = await supabase
      .from('doc_template_versions')
      .select('version')
      .eq('template_id', req.params.id)
      .order('version', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

    const { data, error } = await supabase
      .from('doc_template_versions')
      .insert([{
        template_id: req.params.id,
        version: nextVersion,
        layout_json,
        base_image_url,
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/doc/templates/:id/versions — list all versions of a template
router.get('/templates/:id/versions', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doc_template_versions')
      .select('*')
      .eq('template_id', req.params.id)
      .order('version', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN CRUD + OPERATIONS
// ══════════════════════════════════════════════════════════════════

// GET /api/doc/campaigns/:projectId — list campaigns in project
// NOTE: This shares the /:param pattern with GET /campaigns/:id (detail).
//       We disambiguate by using separate route paths below.
router.get('/campaigns/project/:projectId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/campaigns — create campaign
router.post('/campaigns', async (req, res, next) => {
  try {
    const { project_id, name, template_id, template_version, email_subject, email_body, doc_id_prefix } = req.body;
    if (!project_id || !name) {
      return res.status(400).json({ error: 'project_id and name are required' });
    }

    const { data, error } = await supabase
      .from('doc_campaigns')
      .insert([{
        project_id,
        name,
        template_id,
        template_version,
        email_subject,
        email_body,
        doc_id_prefix,
        status: 'draft',
        total_recipients: 0,
        sent_count: 0,
        failed_count: 0,
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/doc/campaigns/:id — get campaign detail + stats
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const { data: campaign, error } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Fetch full recipients for the status page
    const { data: recipients, error: recErr } = await supabase
      .from('doc_recipients')
      .select('id, email, merge_fields, document_id, send_status, error_message, sent_at')
      .eq('campaign_id', req.params.id)
      .order('created_at', { ascending: true });

    if (recErr) throw recErr;

    const stats = {
      total: recipients ? recipients.length : 0,
      pending: 0,
      sent: 0,
      failed: 0,
    };
    if (recipients) {
      recipients.forEach((r) => {
        if (r.send_status === 'sent') stats.sent++;
        else if (r.send_status === 'failed') stats.failed++;
        else stats.pending++;
      });
    }

    res.json({ ...campaign, recipients: recipients || [], stats });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/doc/campaigns/:id — delete campaign (only if draft)
router.delete('/campaigns/:id', async (req, res, next) => {
  try {
    // Check campaign status
    const { data: campaign, error: fetchErr } = await supabase
      .from('doc_campaigns')
      .select('status')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft campaigns can be deleted' });
    }

    // Delete recipients first (foreign key)
    await supabase
      .from('doc_recipients')
      .delete()
      .eq('campaign_id', req.params.id);

    // Delete campaign
    const { error } = await supabase
      .from('doc_campaigns')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN DATA OPERATIONS
// ══════════════════════════════════════════════════════════════════

// POST /api/doc/campaigns/:id/upload-csv — upload CSV → parse → store recipients
router.post('/campaigns/:id/upload-csv', async (req, res, next) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: 'CSV data is required in request body' });

    // Parse CSV
    const { headers, normalizedHeaders, rows } = parseCSV(csv);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'CSV contains no data rows' });
    }

    // Fetch campaign for doc_id_prefix
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('doc_id_prefix')
      .eq('id', req.params.id)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Generate document IDs
    const documentIds = generateDocumentIds(campaign.doc_id_prefix, rows.length);

    // Delete existing recipients for this campaign (re-upload scenario)
    await supabase
      .from('doc_recipients')
      .delete()
      .eq('campaign_id', req.params.id);

    // Build recipient rows — parseCSV returns rows as { email, merge_fields } objects
    const recipientRows = rows.map((row, index) => ({
      campaign_id: req.params.id,
      document_id: documentIds[index],
      email: row.email || '',
      merge_fields: row.merge_fields || {},
      send_status: 'pending',
    }));

    // Insert recipients in batches (Supabase has row limits)
    const BATCH_SIZE = 500;
    for (let i = 0; i < recipientRows.length; i += BATCH_SIZE) {
      const batch = recipientRows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabase
        .from('doc_recipients')
        .insert(batch);
      if (insertErr) throw insertErr;
    }

    // Update campaign total_recipients
    const { error: updateErr } = await supabase
      .from('doc_campaigns')
      .update({ total_recipients: rows.length })
      .eq('id', req.params.id);

    if (updateErr) throw updateErr;

    // Return preview (first 5 rows)
    const preview = rows.slice(0, 5).map((row) => ({
      email: row.email,
      merge_fields: row.merge_fields,
      ...row.merge_fields,
    }));

    res.json({
      recipientCount: rows.length,
      headers,
      normalizedHeaders,
      preview,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/campaigns/:id/validate — validate campaign before sending
router.post('/campaigns/:id/validate', async (req, res, next) => {
  try {
    const errors = [];
    const warnings = [];

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check: template assigned
    if (!campaign.template_id || !campaign.template_version) {
      errors.push('No template or template version assigned to this campaign');
    }

    // Check: email_subject set
    if (!campaign.email_subject) {
      errors.push('Email subject is not set');
    }

    // Check: Brevo key configured
    const config = require('../config/env');
    if (!config.brevoApiKey && !process.env.BREVO_API_KEY) {
      errors.push('Brevo API key is not configured');
    }

    // Check: recipients exist
    const { data: recipients, error: recErr } = await supabase
      .from('doc_recipients')
      .select('*')
      .eq('campaign_id', req.params.id);

    if (recErr) throw recErr;

    if (!recipients || recipients.length === 0) {
      errors.push('No recipients found — upload a CSV first');
    } else {
      // Check for missing emails
      const missingEmails = recipients.filter((r) => !r.email || r.email.trim() === '');
      if (missingEmails.length > 0) {
        warnings.push(`${missingEmails.length} recipient(s) have missing email addresses`);
      }

      // Check for duplicate emails
      const emailCounts = {};
      recipients.forEach((r) => {
        if (r.email) {
          const key = r.email.toLowerCase().trim();
          emailCounts[key] = (emailCounts[key] || 0) + 1;
        }
      });
      const duplicates = Object.entries(emailCounts).filter(([, count]) => count > 1);
      if (duplicates.length > 0) {
        warnings.push(`${duplicates.length} duplicate email address(es) found`);
      }

      // Check for empty required fields in merge_fields
      const emptyFieldRecipients = recipients.filter((r) => {
        if (!r.merge_fields) return true;
        const values = Object.values(r.merge_fields);
        return values.some((v) => v === '' || v === null || v === undefined);
      });
      if (emptyFieldRecipients.length > 0) {
        warnings.push(`${emptyFieldRecipients.length} recipient(s) have empty merge fields`);
      }
    }

    res.json({
      valid: errors.length === 0,
      errors,
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// RENDER + SEND OPERATIONS
// ══════════════════════════════════════════════════════════════════

// POST /api/doc/campaigns/:id/preview — render 1 PDF, return as base64
router.post('/campaigns/:id/preview', async (req, res, next) => {
  try {
    const { recipientIndex = 0 } = req.body;

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Fetch recipients
    const { data: recipients, error: recErr } = await supabase
      .from('doc_recipients')
      .select('*')
      .eq('campaign_id', req.params.id)
      .order('created_at', { ascending: true });

    if (recErr) throw recErr;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found' });
    }

    if (recipientIndex < 0 || recipientIndex >= recipients.length) {
      return res.status(400).json({ error: `recipientIndex out of range (0–${recipients.length - 1})` });
    }

    const recipient = recipients[recipientIndex];

    // Fetch template version + background image (cached for this request)
    const { layoutJson, imageBuffer } = await fetchTemplateImage(
      campaign.template_id,
      campaign.template_version
    );

    // Render 1 document (arg order: bgImage, layout, data)
    const pdfBuffer = await renderDocument(imageBuffer, layoutJson, recipient.merge_fields);

    res.json({
      pdf: pdfBuffer.toString('base64'),
      recipient: recipient.merge_fields,
      documentId: recipient.document_id,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/campaigns/:id/test-send — render 1 + email to admin
router.post('/campaigns/:id/test-send', async (req, res, next) => {
  try {
    const { recipientIndex = 0, testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ error: 'testEmail is required' });
    }

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Fetch recipients
    const { data: recipients, error: recErr } = await supabase
      .from('doc_recipients')
      .select('*')
      .eq('campaign_id', req.params.id)
      .order('created_at', { ascending: true });

    if (recErr) throw recErr;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found' });
    }

    if (recipientIndex < 0 || recipientIndex >= recipients.length) {
      return res.status(400).json({ error: `recipientIndex out of range (0–${recipients.length - 1})` });
    }

    const recipient = recipients[recipientIndex];

    // Fetch template image
    const { layoutJson, imageBuffer } = await fetchTemplateImage(
      campaign.template_id,
      campaign.template_version
    );

    // Render document (arg order: bgImage, layout, data)
    const pdfBuffer = await renderDocument(imageBuffer, layoutJson, recipient.merge_fields);

    // Send via BrevoProvider (positional args: to, subject, body, buffer, filename)
    const emailProvider = new BrevoProvider();
    const sendResult = await emailProvider.send(
      testEmail,
      campaign.email_subject || 'Test Document',
      campaign.email_body || 'Please find your document attached.',
      pdfBuffer,
      `${recipient.document_id}.pdf`
    );

    if (!sendResult.success) {
      return res.status(500).json({ error: `Email send failed: ${sendResult.error}` });
    }

    res.json({
      success: true,
      recipient: recipient.merge_fields,
      documentId: recipient.document_id,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/campaigns/:id/send-all — bulk render + email (fire-and-forget)
router.post('/campaigns/:id/send-all', async (req, res, next) => {
  try {
    const campaignId = req.params.id;

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // CAMPAIGN LOCKING: prevent concurrent sends
    if (campaign.status === 'sending') {
      // Check for stale lock (>10 min) — auto-recover if stuck
      const recovered = await recoverStaleLock(campaignId);
      if (!recovered) {
        return res.status(409).json({ error: 'Campaign is already being sent' });
      }
    }

    // Set status to 'sending'
    const { error: lockErr } = await supabase
      .from('doc_campaigns')
      .update({ status: 'sending', sent_count: 0, failed_count: 0 })
      .eq('id', campaignId);

    if (lockErr) throw lockErr;

    // Respond immediately
    res.json({ message: 'Campaign sending started', campaignId });

    // ── Fire-and-forget async sending loop ────────────────────
    (async () => {
      try {
        // Dynamic import for ESM-only p-limit
        const pLimit = (await import('p-limit')).default;
        const limit = pLimit(5);

        // Fetch template image ONCE for entire campaign
        const { layoutJson, imageBuffer } = await fetchTemplateImage(
          campaign.template_id,
          campaign.template_version
        );

        // Fetch all pending recipients
        const { data: recipients, error: recErr } = await supabase
          .from('doc_recipients')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('send_status', 'pending')
          .order('created_at', { ascending: true });

        if (recErr) throw recErr;

        const emailProvider = new BrevoProvider();
        let sentCount = 0;
        let failedCount = 0;

        const BATCH_SIZE = 15;

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
          const batch = recipients.slice(i, i + BATCH_SIZE);

          // Process batch with concurrency limiter
          const results = await Promise.allSettled(
            batch.map((recipient) =>
              limit(async () => {
                try {
                  // 1. Render PDF in memory (arg order: bgImage, layout, data)
                  const pdfBuffer = await renderDocument(imageBuffer, layoutJson, recipient.merge_fields);

                  // 2. Send via BrevoProvider (positional args)
                  const sendResult = await emailProvider.send(
                    recipient.email,
                    campaign.email_subject,
                    campaign.email_body || 'Please find your document attached.',
                    pdfBuffer,
                    `${recipient.document_id}.pdf`
                  );

                  if (!sendResult.success) {
                    throw new Error(sendResult.error || 'Email send failed');
                  }

                  // 3. Update recipient send_status and sent_at
                  await supabase
                    .from('doc_recipients')
                    .update({ send_status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', recipient.id);

                  // 4. Log to doc_email_logs
                  await supabase
                    .from('doc_email_logs')
                    .insert([{
                      campaign_id: campaignId,
                      recipient_id: recipient.id,
                      document_id: recipient.document_id,
                      email: recipient.email,
                      status: 'sent',
                      sent_at: new Date().toISOString(),
                    }]);

                  return { success: true };
                } catch (sendErr) {
                  // Update recipient as failed
                  await supabase
                    .from('doc_recipients')
                    .update({ send_status: 'failed' })
                    .eq('id', recipient.id);

                  // Log failure
                  await supabase
                    .from('doc_email_logs')
                    .insert([{
                      campaign_id: campaignId,
                      recipient_id: recipient.id,
                      document_id: recipient.document_id,
                      email: recipient.email,
                      status: 'failed',
                      error_message: sendErr.message,
                      sent_at: new Date().toISOString(),
                    }]);

                  return { success: false };
                }
              })
            )
          );

          // Tally batch results
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.success) {
              sentCount++;
            } else {
              failedCount++;
            }
          });

          // Update campaign counts after each batch
          await supabase
            .from('doc_campaigns')
            .update({ sent_count: sentCount, failed_count: failedCount })
            .eq('id', campaignId);

          // Yield event loop between batches
          await new Promise((resolve) => setImmediate(resolve));
        }

        // On completion: set final status
        const finalStatus = failedCount === recipients.length ? 'failed' : 'completed';
        await supabase
          .from('doc_campaigns')
          .update({
            status: finalStatus,
            sent_count: sentCount,
            failed_count: failedCount,
            completed_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
      } catch (asyncErr) {
        // Mark campaign as failed on unhandled error
        console.error(`Campaign ${campaignId} send-all error:`, asyncErr);
        await supabase
          .from('doc_campaigns')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
      }
    })();
  } catch (err) {
    next(err);
  }
});

// GET /api/doc/campaigns/:id/status — live progress
router.get('/campaigns/:id/status', async (req, res, next) => {
  try {
    const { data: campaign, error } = await supabase
      .from('doc_campaigns')
      .select('status, total_recipients, sent_count, failed_count, completed_at')
      .eq('id', req.params.id)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      status: campaign.status,
      total_recipients: campaign.total_recipients,
      sent_count: campaign.sent_count,
      failed_count: campaign.failed_count,
      completedAt: campaign.completed_at,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/doc/campaigns/:id/retry-failed — retry only failed recipients
router.post('/campaigns/:id/retry-failed', async (req, res, next) => {
  try {
    const campaignId = req.params.id;

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // IDEMPOTENCY: prevent double-retry
    if (campaign.status === 'sending') {
      const recovered = await recoverStaleLock(campaignId);
      if (!recovered) {
        return res.status(409).json({ error: 'Campaign is currently sending — wait for it to finish or it will auto-recover after 10 minutes' });
      }
    }

    // Reset failed recipients to 'pending'
    const { error: resetErr } = await supabase
      .from('doc_recipients')
      .update({ send_status: 'pending' })
      .eq('campaign_id', campaignId)
      .eq('send_status', 'failed');

    if (resetErr) throw resetErr;

    // Set campaign status to 'sending' (lock acquired)
    await supabase
      .from('doc_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Respond immediately
    res.json({ message: 'Retrying failed recipients', campaignId });

    // ── Fire-and-forget async retry loop ──────────────────────
    (async () => {
      try {
        const pLimit = (await import('p-limit')).default;
        const limit = pLimit(5);

        // Fetch template image ONCE
        const { layoutJson, imageBuffer } = await fetchTemplateImage(
          campaign.template_id,
          campaign.template_version
        );

        // Fetch only pending recipients (previously failed, now reset)
        const { data: recipients, error: recErr } = await supabase
          .from('doc_recipients')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('send_status', 'pending')
          .order('created_at', { ascending: true });

        if (recErr) throw recErr;

        const emailProvider = new BrevoProvider();
        let sentCount = campaign.sent_count || 0;
        let failedCount = 0;

        const BATCH_SIZE = 15;

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
          const batch = recipients.slice(i, i + BATCH_SIZE);

          const results = await Promise.allSettled(
            batch.map((recipient) =>
              limit(async () => {
                try {
                  const pdfBuffer = await renderDocument(imageBuffer, layoutJson, recipient.merge_fields);

                  const sendResult = await emailProvider.send(
                    recipient.email,
                    campaign.email_subject,
                    campaign.email_body || 'Please find your document attached.',
                    pdfBuffer,
                    `${recipient.document_id}.pdf`
                  );

                  if (!sendResult.success) {
                    throw new Error(sendResult.error || 'Email send failed');
                  }

                  await supabase
                    .from('doc_recipients')
                    .update({ send_status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', recipient.id);

                  await supabase
                    .from('doc_email_logs')
                    .insert([{
                      campaign_id: campaignId,
                      recipient_id: recipient.id,
                      document_id: recipient.document_id,
                      email: recipient.email,
                      status: 'sent',
                      sent_at: new Date().toISOString(),
                    }]);

                  return { success: true };
                } catch (sendErr) {
                  await supabase
                    .from('doc_recipients')
                    .update({ send_status: 'failed' })
                    .eq('id', recipient.id);

                  await supabase
                    .from('doc_email_logs')
                    .insert([{
                      campaign_id: campaignId,
                      recipient_id: recipient.id,
                      document_id: recipient.document_id,
                      email: recipient.email,
                      status: 'failed',
                      error_message: sendErr.message,
                      sent_at: new Date().toISOString(),
                    }]);

                  return { success: false };
                }
              })
            )
          );

          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.success) {
              sentCount++;
            } else {
              failedCount++;
            }
          });

          await supabase
            .from('doc_campaigns')
            .update({ sent_count: sentCount, failed_count: failedCount })
            .eq('id', campaignId);

          await new Promise((resolve) => setImmediate(resolve));
        }

        const finalStatus = failedCount > 0 && sentCount === 0 ? 'failed' : 'completed';
        await supabase
          .from('doc_campaigns')
          .update({
            status: finalStatus,
            sent_count: sentCount,
            failed_count: failedCount,
            completed_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
      } catch (asyncErr) {
        console.error(`Campaign ${campaignId} retry-failed error:`, asyncErr);
        await supabase
          .from('doc_campaigns')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
      }
    })();
  } catch (err) {
    next(err);
  }
});

// GET /api/doc/campaigns/:id/download-zip — stream ZIP of all generated docs
router.get('/campaigns/:id/download-zip', async (req, res, next) => {
  try {
    const campaignId = req.params.id;

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('doc_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Fetch recipients
    const { data: recipients, error: recErr } = await supabase
      .from('doc_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    if (recErr) throw recErr;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found' });
    }

    // Fetch template image ONCE
    const { layoutJson, imageBuffer } = await fetchTemplateImage(
      campaign.template_id,
      campaign.template_version
    );

    // Set response headers for ZIP streaming
    const zipFileName = `${campaign.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_documents.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // Create archiver and pipe to response
    const archive = archiver('zip', { zlib: { level: 5 } });

    archive.on('error', (archiveErr) => {
      console.error('Archive error:', archiveErr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate ZIP' });
      }
    });

    archive.pipe(res);

    // Render each recipient's PDF with concurrency control (same as send-all)
    const BATCH_SIZE = 15;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      for (const recipient of batch) {
        try {
          const pdfBuffer = await renderDocument(imageBuffer, layoutJson, recipient.merge_fields);
          archive.append(pdfBuffer, { name: `${recipient.document_id}.pdf` });
        } catch (renderErr) {
          console.error(`Failed to render document for ${recipient.document_id}:`, renderErr);
          archive.append(`Error rendering document: ${renderErr.message}`, {
            name: `${recipient.document_id}_ERROR.txt`,
          });
        }
      }

      // Yield event loop between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
