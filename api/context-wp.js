// api/context-wp.js
// =============================================================================
// Base de Conhecimento WordPress — 461 artigos do site unaslaf.org.br
// =============================================================================
// COMO FUNCIONA:
//   1. Na primeira chamada, baixa os dois JSONs do Google Drive e faz cache
//   2. Para cada pergunta, busca no índice invertido as palavras-chave
//   3. Retorna o texto dos 3 artigos mais relevantes para o chat
//
// OS ARQUIVOS NO DRIVE:
//   artigos_limpos.json  → ID: 1VwSQDGW1Cut8RN2_Zyim9AZ_PCSuLm_D
//   indice_busca.json    → ID: 1ldmIEd-03-wVX7hNlpsb-72H-4_CwXNF
//
// COMO ATUALIZAR OS ARTIGOS:
//   1. Gere novos artigos_limpos.json e indice_busca.json com o script Python
//   2. Substitua os arquivos na pasta do Drive (mesmo nome)
//   3. O cache expira em 30 minutos — após isso o sistema usa a versão nova
//
// AJUSTES POSSÍVEIS:
//   TOP_N_ARTIGOS  → quantos artigos são enviados à IA por pergunta (padrão: 3)
//   CACHE_TTL_MS   → tempo de cache em ms (padrão: 30 min)
//   MIN_SCORE      → pontuação mínima para incluir um artigo (padrão: 1)
//   MAX_CHARS_ART  → máximo de caracteres por artigo enviado à IA (padrão: 1500)
// =============================================================================

import { google } from 'googleapis';

// IDs dos arquivos no Google Drive
const ARTIGOS_FILE_ID = process.env.WP_ARTICLES_FILE_ID || '1VwSQDGW1Cut8RN2_Zyim9AZ_PCSuLm_D';
const INDICE_FILE_ID  = process.env.WP_INDEX_FILE_ID    || '1ldmIEd-03-wVX7hNlpsb-72H-4_CwXNF';

// Configurações de busca
const TOP_N_ARTIGOS = 3;     // artigos retornados por pergunta
const CACHE_TTL_MS  = 30 * 60 * 1000; // 30 minutos
const MIN_SCORE     = 1;     // pontuação mínima para incluir artigo
const MAX_CHARS_ART = 1500;  // caracteres máximos por artigo

// Stopwords — palavras ignoradas na busca (muito comuns, sem valor semântico)
const STOPWORDS = new Set([
  'para','como','qual','quais','quando','onde','quem','mais','esse','essa',
  'isto','isso','pelo','pela','pelos','pelas','sobre','está','foram','será',
  'seria','tinha','tenho','temos','pode','podem','deve','devem','isso','aqui',
  'assim','também','desde','entre','ainda','cada','todo','toda','todos','todas',
  'numa','numa','pelo','pela','seus','suas','nosso','nossa','nossos','nossas',
]);

// Cache em memória
let _cache = {
  artigos: null,  // Map de id → {id, titulo, conteudo}
  indice: null,   // Map de palavra → [ids]
  ts: 0,
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

// Baixa um arquivo JSON do Drive e retorna o objeto parsed
async function downloadJSON(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );
  return JSON.parse(res.data);
}

// Carrega os dois arquivos do Drive e popula o cache
async function loadCache() {
  const drive = getDriveClient();

  // Baixa os dois em paralelo para economizar tempo
  const [artigosArr, indiceObj] = await Promise.all([
    downloadJSON(drive, ARTIGOS_FILE_ID),
    downloadJSON(drive, INDICE_FILE_ID),
  ]);

  // Converte array de artigos para Map (busca por ID em O(1))
  const artigosMap = new Map();
  for (const a of artigosArr) {
    artigosMap.set(a.id, a);
  }

  // Converte índice para Map
  const indiceMap = new Map(Object.entries(indiceObj));

  _cache = { artigos: artigosMap, indice: indiceMap, ts: Date.now() };
  console.log(`[context-wp] Cache carregado: ${artigosMap.size} artigos, ${indiceMap.size} palavras-chave`);
}

// Extrai palavras relevantes da pergunta (4+ letras, sem stopwords)
function extrairPalavras(pergunta) {
  return (pergunta.toLowerCase().match(/[a-záéíóúâêîôûãõçàüäëïöü]{4,}/g) || [])
    .filter(p => !STOPWORDS.has(p));
}

// Busca os artigos mais relevantes para a pergunta
function buscarArtigos(pergunta) {
  const palavras = extrairPalavras(pergunta);
  if (!palavras.length) return [];

  // Conta quantas palavras da pergunta aparecem em cada artigo
  const score = new Map();
  for (const palavra of palavras) {
    const ids = _cache.indice.get(palavra) || [];
    for (const id of ids) {
      score.set(id, (score.get(id) || 0) + 1);
    }
  }

  // Ordena por score, pega os top N com score mínimo
  return [...score.entries()]
    .filter(([, s]) => s >= MIN_SCORE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N_ARTIGOS)
    .map(([id, s]) => ({ artigo: _cache.artigos.get(id), score: s }))
    .filter(({ artigo }) => artigo);
}

// Handler principal — recebe pergunta, retorna contexto formatado
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message obrigatório' });

  try {
    // Carrega cache se necessário
    if (!isCacheValid()) {
      await loadCache();
    }

    const resultados = buscarArtigos(message);

    if (!resultados.length) {
      return res.status(200).json({ context: '', count: 0 });
    }

    // Monta o contexto formatado para o chat
    const partes = resultados.map(({ artigo, score }) => {
      const conteudo = artigo.conteudo.slice(0, MAX_CHARS_ART);
      const truncado = artigo.conteudo.length > MAX_CHARS_ART ? '...' : '';
      return `--- ${artigo.titulo} (relevância: ${score}) ---\n${conteudo}${truncado}`;
    });

    const context = partes.join('\n\n');

    return res.status(200).json({
      context,
      count: resultados.length,
      titulos: resultados.map(r => r.artigo.titulo),
    });

  } catch (err) {
    console.error('[context-wp]', err.message);
    // Retorna vazio — chat funciona sem esta fonte
    return res.status(200).json({ context: '', count: 0, error: err.message });
  }
}
