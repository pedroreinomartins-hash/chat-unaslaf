// api/documentos/download.js
// Proxy de download autenticado de arquivo do Google Drive

import { google } from 'googleapis';

function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return cpf;
  } catch { return null; }
}

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT nao configurado');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo nao permitido' });

  // Aceita token no header Authorization
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !validateSessionToken(token)) {
    return res.status(401).json({ error: 'Token de sessão obrigatório' });
  }

  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: 'fileId obrigatorio' });

  try {
    const drive = getDriveClient();

    const meta = await drive.files.get({
      fileId,
      fields: 'name,mimeType',
    });

    const { name, mimeType } = meta.data;

    const file = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);

    file.data.pipe(res);
  } catch (err) {
    console.error('[download]', err.message);
    return res.status(500).json({ error: 'Erro ao baixar arquivo', detail: err.message });
  }
}
