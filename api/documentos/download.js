// api/documentos/download.js
// Proxy de download de arquivo do Google Drive (requer autenticação)

import { google } from 'googleapis';
import { requireAuth } from '../lib/auth.js';

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT não configurado');
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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: 'fileId obrigatório' });

  try {
    const drive = getDriveClient();

    // Obtém metadados para o nome do arquivo
    const meta = await drive.files.get({
      fileId,
      fields: 'name,mimeType',
    });

    const { name, mimeType } = meta.data;

    // Baixa o conteúdo
    const file = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);

    file.data.pipe(res);
  } catch (err) {
    console.error('[download]', err);
    return res.status(500).json({ error: 'Erro ao baixar arquivo', detail: err.message });
  }
}
