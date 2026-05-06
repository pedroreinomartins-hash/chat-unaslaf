// api/documentos.js
// Lista e serve documentos da pasta Google Drive do repositório

import { google } from 'googleapis';
import { requireAuth } from './lib/auth.js';

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

// Detecta categoria pelo nome do arquivo
function detectCategory(name) {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/desfilia|cancelamento/.test(n)) return 'Desfiliação';
  if (/filia/.test(n)) return 'Filiação';
  if (/procura/.test(n)) return 'Procuração';
  if (/requerimento|solicit/.test(n)) return 'Requerimentos';
  if (/formulario|ficha/.test(n)) return 'Formulários';
  return 'Geral';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  try {
    const drive = getDriveClient();
    const folderId = process.env.REPO_FOLDER_ID;

    const list = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,size,modifiedTime)',
      orderBy: 'name',
    });

    const files = (list.data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      updatedAt: f.modifiedTime,
      category: detectCategory(f.name),
      downloadUrl: `/api/documentos/download?fileId=${f.id}`,
    }));

    return res.status(200).json({ ok: true, files });
  } catch (err) {
    console.error('[documentos]', err);
    return res.status(500).json({ error: 'Erro ao listar documentos', detail: err.message });
  }
}
