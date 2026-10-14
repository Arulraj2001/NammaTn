/**
 * VizhiTN Autonomous Resend Email Notifier
 * Sends instant transactional and administrative alerts via Resend REST API.
 * Uses verified custom domain: alerts@vizhitn.in -> vizhitnin@gmail.com
 */

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'vizhitnin@gmail.com';

/**
 * Base helper to send an email via Resend REST API
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'vizhitnin@gmail.com';
  const senderEmail = process.env.RESEND_FROM_EMAIL || 'VizhiTN Alerts <alerts@vizhitn.in>';

  if (!apiKey) {
    console.warn('[EMAIL NOTIFIER] Skipped: RESEND_API_KEY not configured.');
    return { success: false, reason: 'missing_api_key' };
  }

  const recipient = to || [adminEmail];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: senderEmail,
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject,
        html,
        text: text || subject,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[EMAIL NOTIFIER ERROR] Resend error:', data);
      return { success: false, error: data };
    }

    console.log(`[EMAIL NOTIFIER ✓] Sent "${subject}" to ${recipient} (ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[EMAIL NOTIFIER ERROR] Network error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Alert for New Stay & Room Inquiries
 */
export async function notifyAdminStayInquiry(inquiry = {}) {
  const {
    listing_title = 'Room Listing',
    area_name = '',
    district_name = 'Tamil Nadu',
    rent_amount = '',
    guest_name = 'Prospective Tenant',
    guest_phone = '',
    move_in_date = 'Immediate',
    occupancy_preference = 'Any',
    message = '',
    listing_id = '',
  } = inquiry;

  const cleanPhone = guest_phone.replace(/[^0-9]/g, '');
  const location = area_name ? `${area_name}, ${district_name}` : district_name;
  const subject = `🏠 New Stay Inquiry: ${location} (${guest_name} - ${cleanPhone})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 24px; color: #ffffff; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.2); border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .title { margin: 0; font-size: 20px; font-weight: 800; }
        .content { padding: 24px; }
        .field { margin-bottom: 14px; }
        .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 2px; }
        .value { font-size: 15px; font-weight: 600; color: #1e293b; }
        .actions { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; gap: 12px; }
        .btn { display: inline-block; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: bold; text-decoration: none; text-align: center; }
        .btn-wa { background: #22c55e; color: #ffffff; }
        .btn-call { background: #0f172a; color: #ffffff; }
        .footer { padding: 16px 24px; background: #f8fafc; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">Stay Concierge Lead</div>
          <h1 class="title">${guest_name} is interested in ${area_name || district_name}</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Target Listing</div>
            <div class="value">${listing_title} ${rent_amount ? `(₹${rent_amount}/mo)` : ''}</div>
          </div>
          <div class="field">
            <div class="label">Location</div>
            <div class="value">📍 ${location}</div>
          </div>
          <div class="field">
            <div class="label">Guest Mobile / WhatsApp</div>
            <div class="value" style="font-family: monospace; font-size: 17px; color: #2563eb;">${guest_phone}</div>
          </div>
          <div class="field">
            <div class="label">Expected Move-in Timeline</div>
            <div class="value">📅 ${move_in_date.replace(/_/g, ' ')} (${occupancy_preference} room)</div>
          </div>
          ${message ? `
          <div class="field">
            <div class="label">Guest Notes / Request</div>
            <div class="value" style="font-weight: 400; background: #f8fafc; padding: 10px; border-radius: 8px; font-style: italic;">"${message}"</div>
          </div>` : ''}

          <div class="actions">
            <a href="https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(guest_name)},%20I%20am%20from%20VizhiTN.%20Saw%20your%20inquiry%20for%20stay%20in%20${encodeURIComponent(location)}." class="btn btn-wa">💬 WhatsApp Guest</a>
            <a href="tel:${cleanPhone}" class="btn btn-call">📞 Call Now</a>
            ${listing_id ? `<a href="https://www.vizhitn.in/stay/${listing_id}" class="btn" style="background: #e2e8f0; color: #334155;">View Listing ↗</a>` : ''}
          </div>
        </div>
        <div class="footer">
          VizhiTN Automated Lead Dispatcher · Sent via Resend to ${ADMIN_EMAIL}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ subject, html });
}

/**
 * 2. Alert for General Contact Form Messages
 */
export async function notifyAdminContactMessage(contact = {}) {
  const {
    ticket_id = `TKT-${Date.now().toString(36).toUpperCase()}`,
    name = 'Citizen',
    email = '',
    phone = '',
    district = 'Tamil Nadu',
    topic = 'General Feedback',
    message = '',
  } = contact;

  const subject = `📩 New Contact Message [${ticket_id}]: ${name} (${topic})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .header { background: #0f172a; padding: 24px; color: #ffffff; }
        .title { margin: 0; font-size: 18px; font-weight: 800; }
        .badge { display: inline-block; padding: 3px 8px; background: #3b82f6; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
        .content { padding: 24px; }
        .field { margin-bottom: 12px; }
        .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
        .value { font-size: 14px; font-weight: 600; color: #1e293b; }
        .msg-box { background: #f1f5f9; padding: 14px; border-radius: 10px; margin-top: 14px; font-size: 13px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">Ticket: ${ticket_id}</div>
          <h1 class="title">New Message: ${topic}</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Contact Info</div>
            <div class="value">${phone ? `📞 ${phone}` : ''} ${email ? `· ✉️ ${email}` : ''}</div>
          </div>
          <div class="field">
            <div class="label">District</div>
            <div class="value">📍 ${district}</div>
          </div>
          <div class="msg-box">
            ${message}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ subject, html });
}

/**
 * 3. Alert for Public Civic Grievances & Outage Reports
 */
export async function notifyAdminCivicReport(report = {}) {
  const {
    civic_receipt_id = 'CR-NEW',
    title = 'Civic Report',
    category_slug = 'general',
    district_name = 'Tamil Nadu',
    location_text = '',
    urgency_level = 'medium',
    assigned_department = '',
    description = '',
  } = report;

  const subject = `🏛️ New Civic Grievance [${civic_receipt_id}]: ${location_text || district_name} (${category_slug})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); padding: 24px; color: #ffffff; }
        .title { margin: 0; font-size: 18px; font-weight: 800; }
        .badge { display: inline-block; padding: 4px 8px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
        .content { padding: 24px; }
        .field { margin-bottom: 12px; }
        .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
        .value { font-size: 14px; font-weight: 600; color: #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">Civic Receipt: ${civic_receipt_id} · ${urgency_level.toUpperCase()}</div>
          <h1 class="title">${title}</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Location</div>
            <div class="value">📍 ${location_text}, ${district_name}</div>
          </div>
          <div class="field">
            <div class="label">Assigned Department</div>
            <div class="value">🏛️ ${assigned_department}</div>
          </div>
          <div class="field">
            <div class="label">Description</div>
            <div class="value" style="font-weight: 400; line-height: 1.5; background: #f8fafc; padding: 12px; border-radius: 8px;">
              ${description}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ subject, html });
}
