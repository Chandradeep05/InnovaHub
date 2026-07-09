/**
 * @module emailProvider
 * @description Brevo (Sendinblue) email provider for the Document Engine.
 * Sends transactional emails with optional PDF attachments via the Brevo SMTP API.
 * Implements exponential backoff retry on 429 (rate limit) and 5xx server errors.
 * Requires Node 18+ for native `fetch` support.
 */

const config = require('../config/env');

/**
 * Sleeps for the specified number of milliseconds.
 *
 * @param {number} ms - Duration in milliseconds.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Brevo transactional email provider with built-in retry and rate-limit handling.
 *
 * @class BrevoProvider
 *
 * @example
 * const { BrevoProvider } = require('./emailProvider');
 * const provider = new BrevoProvider();
 *
 * const result = await provider.send(
 *   'user@example.com',
 *   'Your Certificate',
 *   'Please find your certificate attached.',
 *   pdfBuffer,
 *   'certificate.pdf'
 * );
 *
 * if (result.success) {
 *   console.log('Sent!', result.messageId);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 */
class BrevoProvider {
  constructor() {
    /** @type {string} Brevo API key from environment config */
    this.apiKey = config.brevoApiKey;

    /** @type {string} Sender email address */
    this.fromEmail = config.brevoFromEmail;

    /** @type {string} Sender display name */
    this.fromName = config.brevoFromName;

    /** @type {number} Maximum number of retry attempts */
    this.maxRetries = 3;

    /** @type {number} Base delay in milliseconds for exponential backoff (1s → 2s → 4s) */
    this.baseDelay = 1000;
  }

  /**
   * Sends a transactional email via the Brevo SMTP API.
   *
   * Automatically retries on:
   * - **429** — Rate limit exceeded (exponential backoff: 1s → 2s → 4s)
   * - **5xx** — Server errors
   * - **Network errors** — Connection failures, timeouts, etc.
   *
   * @param {string} to - Recipient email address.
   * @param {string} subject - Email subject line.
   * @param {string} body - Plain text email body.
   * @param {Buffer|null} [attachmentBuffer=null] - Optional file attachment as a Buffer.
   * @param {string|null} [attachmentName=null] - Filename for the attachment (e.g., `"certificate.pdf"`).
   * @returns {Promise<{ success: boolean, messageId: string|null, error: string|null }>}
   */
  async send(to, subject, body, attachmentBuffer = null, attachmentName = null) {
    // Validate required parameters
    if (!to || typeof to !== 'string') {
      return { success: false, messageId: null, error: 'Recipient email address is required.' };
    }

    if (!subject || typeof subject !== 'string') {
      return { success: false, messageId: null, error: 'Email subject is required.' };
    }

    if (!this.apiKey) {
      return { success: false, messageId: null, error: 'Brevo API key is not configured. Check your environment settings.' };
    }

    // Build request payload
    const payload = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [{ email: to }],
      subject,
      textContent: body,
    };

    // Attach file if provided
    if (attachmentBuffer && attachmentName) {
      payload.attachment = [
        {
          content: attachmentBuffer.toString('base64'),
          name: attachmentName,
        },
      ];
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        // Success
        if (response.ok) {
          const result = await response.json();
          return { success: true, messageId: result.messageId || null, error: null };
        }

        // Retryable: rate limit (429) or server error (5xx)
        if ((response.status === 429 || response.status >= 500) && attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          console.warn(
            `⏳ Brevo ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`
          );
          await sleep(delay);
          continue;
        }

        // Non-retryable error — return details
        const errorResult = await response.json().catch(() => ({}));
        return {
          success: false,
          messageId: null,
          error: errorResult.message || `HTTP ${response.status}`,
        };
      } catch (err) {
        // Network / fetch error — retry if attempts remain
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          console.warn(
            `⏳ Network error: ${err.message}, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`
          );
          await sleep(delay);
          continue;
        }
        return { success: false, messageId: null, error: err.message };
      }
    }

    // Fallback (should not normally be reached)
    return { success: false, messageId: null, error: 'Max retries exceeded' };
  }
}

module.exports = { BrevoProvider };
