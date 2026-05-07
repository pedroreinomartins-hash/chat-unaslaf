// api/context-drive.js
// =============================================================================
// Endpoint que lê a pasta de contexto do Google Drive e retorna o texto
// concatenado para uso como base de conhecimento dinâmica do chat.
//
// COMO FUNCIONA:
// - Lê todos os arquivos da pasta CONTEXT_FOLDER_ID configurada no Vercel
// - Suporta: Google Docs, arquivos .txt e PDFs com texto digitado
// - PDFs escaneados (imagem) não funcionam — precisariam de OCR
// - O resultado é usado pelo chat.js como "Atualizações Recentes"
//
// COMO ADICIONAR CONTEXTO SEM REDEPLOY:
// - Basta fazer upload de um .txt, Google Doc ou PDF de texto na pasta:
//   https://drive.google.com/drive/folders/1V9tGV_mR7_c0xNr4TOR1LoYbMX5dbJPu
// - O chat passará a usar o conteúdo automaticamente na próxima mensagem.
//
// LIMITE: DRIVE_CHAR_LIMIT define quantos caracteres são enviados à IA.
// Aumentar melhora a cobertura mas eleva o custo por mensagem.
// =============================================================================

import { google } from 'googleapis';

const FOLDER_ID      = process.env.CONTEXT_FOLDER_ID || '1V9tGV_mR7_c0xNr4TOR1LoYbMX5dbJPu';
const DRIVE_CHAR_LIMIT = 12000; // ← aumente se precisar de mais contexto do Drive

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

// Lê um Google Doc exportando como texto plano
async function readGoogleDoc(drive, fileId) {
  const res = await drive.files.export(
    { fileId, mimeType: 'text/plain' },
    { responseType: 'text' }
  );
  return String(res.data || '').trim();
}

// Lê um arquivo .txt baixando o conteúdo binário
async function readTextFile(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );
  return String(res.data || '').trim();
}

// Lê um PDF com texto digitado exportando via Google Drive converter
async function readPDF(drive, fileId) {
  try {
    // Drive consegue exportar PDF como texto plano via conversão interna
    const res = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    return String(res.data || '').trim();
  } catch {
    // Se export falhar (PDF não convertível), tenta baixar e extrair texto bruto
    try {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      // Extrai texto legível do buffer (funciona para PDFs simples)
      const buf = Buffer.from(res.data);
      const text = buf.toString('latin1');
      // Pega apenas sequências de caracteres legíveis
      const readable = text.match(/[\x20-\x7E\xC0-\xFF]{4,}/g) || [];
      return readable.join(' ').slice(0, 8000);
    } catch {
      return '';
    }
  }
}

// Handler principal
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const drive = getDriveClient();

    // Lista todos os arquivos da pasta de contexto
    const list = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'modifiedTime desc', // mais recentes primeiro — têm prioridade
    });

    const files = list.data.files || [];

    if (!files.length) {
      return res.status(200).json({ context: '', files: [] });
    }

    // Lê cada arquivo conforme seu tipo
    const parts = [];
    for (const file of files) {
      try {
        let text = '';
        const mime = file.mimeType || '';

        if (mime === 'application/vnd.google-apps.document') {
          text = await readGoogleDoc(drive, file.id);
        } else if (mime === 'application/pdf') {
          text = await readPDF(drive, file.id);
        } else if (mime.startsWith('text/')) {
          text = await readTextFile(drive, file.id);
        } else {
          // Tipo não suportado — ignora silenciosamente
          continue;
        }

        if (text) {
          parts.push(`=== DOCUMENTO: ${file.name} ===\n${text}`);
        }
      } catch (err) {
        console.warn(`[context-drive] Falha ao ler "${file.name}":`, err.message);
      }
    }

    const context = parts.join('\n\n').slice(0, DRIVE_CHAR_LIMIT);

    return res.status(200).json({
      context,
      files: files.map(f => f.name),
    });

  } catch (err) {
    console.error('[context-drive]', err.message);
    // Retorna vazio em vez de erro — chat funciona sem o Drive
    return res.status(200).json({ context: '', files: [], error: err.message });
  }
}
