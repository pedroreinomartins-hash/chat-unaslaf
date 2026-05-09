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

const FOLDER_ID        = process.env.CONTEXT_FOLDER_ID || '1V9tGV_mR7_c0xNr4TOR1LoYbMX5dbJPu';
const DRIVE_CHAR_LIMIT = 12000; // ← aumente se precisar de mais contexto do Drive

// =============================================================================
// CACHE EM MEMÓRIA
// =============================================================================
// Evita consultar o Drive a cada mensagem do chat.
// O conteúdo é reutilizado por CACHE_TTL_MS milissegundos (padrão: 5 minutos).
//
// COMO AJUSTAR:
//   5 * 60 * 1000  =  5 minutos (padrão) — bom equilíbrio entre velocidade e frescor
//   1 * 60 * 1000  =  1 minuto  — mais atualizado, um pouco mais lento
//  10 * 60 * 1000  = 10 minutos — mais rápido, demora mais para refletir mudanças
//
// EFEITO PRÁTICO: após fazer upload de um arquivo novo na pasta do Drive,
// ele será lido pelo chat após no máximo CACHE_TTL_MS milissegundos.
// =============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let _cache = {
  context: '',   // texto concatenado dos arquivos do Drive
  files: [],     // lista de nomes de arquivos lidos
  ts: 0,         // timestamp da última leitura
};

function isCacheValid() {
  return _cache.ts > 0 && (Date.now() - _cache.ts) < CACHE_TTL_MS;
}

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

// Validação de sessão
  const _tokenDrive = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!_tokenDrive) return res.status(401).json({ error: 'Não autorizado' });
  
  // Retorna do cache se ainda válido — evita chamar o Drive a cada mensagem
  if (isCacheValid()) {
    return res.status(200).json({ context: _cache.context, files: _cache.files, cached: true });
  }

  try {
    const drive = getDriveClient();

    // Lista todos os arquivos da pasta de contexto
    const list = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
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
    const fileNames = files.map(f => f.name);

    // Salva no cache
    _cache = { context, files: fileNames, ts: Date.now() };

    return res.status(200).json({ context, files: fileNames, cached: false });

  } catch (err) {
    console.error('[context-drive]', err.message);
    // Em caso de erro, retorna o cache anterior se existir (mesmo expirado)
    if (_cache.context) {
      return res.status(200).json({ context: _cache.context, files: _cache.files, cached: true, error: err.message });
    }
    // Sem cache e sem Drive — retorna vazio, chat funciona normalmente
    return res.status(200).json({ context: '', files: [], error: err.message });
  }
}
