export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, message } = req.body;
  const instance = process.env.ZAPI_INSTANCE;
  const token    = process.env.ZAPI_TOKEN;
  const client   = process.env.ZAPI_CLIENT_TOKEN || '';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (client) headers['client-token'] = client;

    const response = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-text`,
      { method: 'POST', headers, body: JSON.stringify({ phone, message }) }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
