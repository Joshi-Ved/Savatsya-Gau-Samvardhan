import sgMail from '@sendgrid/mail';
import logger from './logger.js';

let isInitialized = false;
let initAttempted = false;

function initMailer() {
  if (initAttempted) return; // Only try to initialize once
  initAttempted = true;
  
  logger.info('mailer', 'Initializing SendGrid mailer...');
  logger.debug('mailer', 'SendGrid config check', {
    apiKeyPresent: !!process.env.SENDGRID_API_KEY,
    apiKeyFormat: process.env.SENDGRID_API_KEY?.startsWith('SG.') || false,
    fromEmail: process.env.FROM_EMAIL || '(not set)',
    fromName: process.env.FROM_NAME || '(not set)'
  });
  
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('mailer', 'SENDGRID_API_KEY not configured. Email functionality disabled.');
    return;
  }

  // Validate API key format
  if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    logger.error('mailer', 'Invalid SENDGRID_API_KEY format. Keys should start with "SG."');
    isInitialized = false;
    return;
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isInitialized = true;
    logger.info('mailer', 'SendGrid Web API initialized successfully. Email functionality is ENABLED.');
  } catch (err) {
    logger.error('mailer', 'Failed to initialize SendGrid', { error: err?.message || String(err) });
    isInitialized = false;
  }
}


// Don't initialize immediately - wait for first use

export function isEmailEnabled() {
  if (!initAttempted) {
    initMailer(); // Initialize on first check
  }
  return isInitialized;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!initAttempted) {
    initMailer(); // Initialize on first use
  }
  
  if (!isInitialized) {
    logger.warn('mailer', 'SendGrid not initialized. Skipping email send.');
    return { 
      ok: false, 
      error: 'SendGrid not configured' 
    };
  }

  const from = process.env.FROM_EMAIL || 'no-reply@example.com';
  const fromName = process.env.FROM_NAME || 'Savatsya Gau Samvardhan';

  const msg = {
    to,
    from: {
      email: from,
      name: fromName
    },
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, '')
  };

  try {
    const [response] = await sgMail.send(msg);
    logger.info('mailer', `Email sent successfully to: ${to}`);
    return { 
      ok: true,
      messageId: response.headers['x-message-id']
    };
  } catch (err) {
    logger.error('mailer', 'Send failed', { error: err?.message || String(err) });
    const errorInfo = err.response?.body || err.message;
    return { 
      ok: false,
      error: String(errorInfo) 
    };
  }
}


