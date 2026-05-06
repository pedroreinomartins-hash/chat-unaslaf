// api/lib/zapi.js
// Utilitário para envio de mensagens via Z-API (WhatsApp)

const BASE = 'https://api.z-api.io';
const INSTANCE = process.env.ZAPI_INSTANCE;
const TOKEN    = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

/**
 * Envia mensagem de texto via Z-API
 * @param {string} phone  Número no formato: 5519991234567
 * @param {string} text   Texto da mensagem
 */
export async function sendWhatsApp(phone, text) {
  const url = `${BASE}/instances/${INSTANCE}/token/${TOKEN}/send-text`;
  
  const body = {
    phone: phone.replace(/\D/g, ''),
    message: text,
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': CLIENT_TOKEN,
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Z-API error ${res.status}: ${err}`);
  }
  
  return res.json();
}
