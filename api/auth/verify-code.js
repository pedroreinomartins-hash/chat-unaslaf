// api/auth/verify-code.js
// Mantido para compatibilidade — sem uso ativo no fluxo sem WhatsApp

export default async function handler(req, res) {
  res.status(404).json({ error: 'Endpoint não utilizado' });
}
