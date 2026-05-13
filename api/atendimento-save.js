// api/atendimento-save.js
// =============================================================================
// Salva o histórico de atendimento como arquivo .txt no Google Drive
// =============================================================================
// PASTA DE DESTINO: "logs de atendimento"
// ID: 12E1qJeYopcT3s9IUGad4t8iFUX-MVPSi
//
// FORMATO DO ARQUIVO GERADO:
//   Atendimento UNA+ — DD/MM/AAAA HH:MM
//   Associado: Nome | CPF: XXX.XXX.XXX-XX
//   [HH:MM] Você: pergunta
//   [HH:MM] UNA+: resposta
//   ---
//   Duração: X minutos | Mensagens: N
//
// NOME DO ARQUIVO: UNA+_CPF_DATA_HORA.txt
//   Exemplo: UNA+_04230809204_20260509_1432.txt
// =============================================================================

import { google } from 'googleapis';

const LOGS_FOLDER_ID = process.env.LOGS_FOLDER_ID || '12E1qJeYopcT3s9IUGad4t8iFUX-MVPSi';

function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return { cpf, ts: Number(ts) };
  } catch { return null; }
}

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT não configurado');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
}

// Formata hora a partir de timestamp
function fmtHora(ts) {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit', minute: '2-digit',
  });
}

// Formata data completa
function fmtData(ts) {
  return new Date(ts).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Gera nome do arquivo: UNA+_CPF_DATA_HORA.txt
function gerarNomeArquivo(cpf, ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  const tz = { timeZone: 'America/Sao_Paulo' };
  const data = d.toLocaleDateString('pt-BR', tz).replace(/\//g, '');
  const hora = d.toLocaleTimeString('pt-BR', { ...tz, hour: '2-digit', minute: '2-digit' }).replace(':', '');
  return `UNA+_${cpf}_${data}_${hora}.txt`;
}

// Gera o conteúdo do arquivo .txt
function gerarConteudo({ nomeAssociado, cpf, history, inicioTs }) {
  const agora = Date.now();
  const duracaoMin = Math.round((agora - inicioTs) / 60000);
  const msgs = (history || []).filter(m => m.role && m.content);

  const linhas = [
    '================================================',
    `  Atendimento UNA+ — ${fmtData(agora)}`,
    '================================================',
    `  Associado : ${nomeAssociado || 'Não identificado'}`,
    `  CPF       : ${cpf}`,
    `  Início    : ${fmtData(inicioTs)}`,
    `  Duração   : ${duracaoMin} minuto(s)`,
    `  Mensagens : ${msgs.length}`,
    '================================================',
    '',
  ];

  for (const msg of msgs) {
    const role = msg.role === 'user' ? 'Você' : 'UNA+';
    // Remove HTML da resposta da IA (se houver)
    const texto = (msg.content || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
    linhas.push(`[${fmtHora(agora)}] ${role}:`);
    linhas.push(texto);
    linhas.push('');
  }

  linhas.push('------------------------------------------------');
  linhas.push(`Arquivo gerado automaticamente pelo sistema UNA+`);
  linhas.push(`UNASLAF — unaslaf.org.br`);

  return linhas.join('\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Autenticação
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const session = validateSessionToken(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada' });

  try {
    const { history, nomeAssociado, inicioTs } = req.body || {};

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Histórico vazio — nada a salvar' });
    }

    const conteudo = gerarConteudo({
      nomeAssociado,
      cpf: session.cpf,
      history,
      inicioTs: inicioTs || session.ts,
    });

    const nomeArquivo = gerarNomeArquivo(session.cpf, Date.now());

    // Upload no Drive
    const drive = getDriveClient();
    const file = await drive.files.create({
      requestBody: {
        name: nomeArquivo,
        mimeType: 'text/plain',
        parents: [LOGS_FOLDER_ID],
      },
      media: {
        mimeType: 'text/plain',
        body: conteudo,
      },
      fields: 'id, name',
    });

    console.log(`[atendimento-save] Salvo: ${file.data.name}`);

    return res.status(200).json({
      ok: true,
      arquivo: file.data.name,
      message: 'Atendimento salvo com sucesso',
    });

  } catch (err) {
    console.error('[atendimento-save]', err.message);
    return res.status(500).json({ error: 'Erro ao salvar atendimento', detail: err.message });
  }
}
