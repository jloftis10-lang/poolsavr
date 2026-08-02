const FIELD_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  company: 120,
  address: 300,
  zip: 12,
  role: 80,
  service: 80,
  topic: 80,
  notes: 2000,
  message: 2000,
  formType: 40,
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof request.body === 'string' ? safeParse(request.body) : request.body;

  if (!body || typeof body !== 'object') {
    return response.status(400).json({ error: 'Invalid request body' });
  }

  // Honeypot: bots fill hidden fields, humans never see them.
  if (body.botField) {
    return response.status(200).json({ ok: true });
  }

  const lead = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) {
      lead[field] = value.trim().slice(0, limit);
    }
  }

  if (!lead.email) {
    return response.status(400).json({ error: 'An email address is required' });
  }

  if (!isEmail(lead.email)) {
    return response.status(400).json({ error: 'Please provide a valid email address' });
  }

  lead.submittedAt = new Date().toISOString();

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch {
      // A webhook outage must not lose the lead — it stays in the function logs.
      console.error('Lead webhook delivery failed', { email: lead.email });
    }
  } else {
    console.log('New lead', lead);
  }

  return response.status(200).json({ ok: true });
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
