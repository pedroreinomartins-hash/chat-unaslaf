// api/context-wp.js
// =============================================================================
// Base de Conhecimento WordPress — busca semântica por embeddings
// =============================================================================
// COMO FUNCIONA:
//   1. Na primeira chamada, baixa artigos_com_vetores.json do Drive (cache 30min)
//   2. Gera embedding da pergunta via OpenAI (~200ms, custo desprezível)
//   3. Calcula similaridade coseno entre a pergunta e os 436 artigos
//   4. Retorna o texto dos TOP_N artigos mais relevantes para o chat
//
// ARQUIVO NO DRIVE:
//   artigos_com_vetores.json → ID: 1CseqB3VUC3I91lOwb1glJDaATkAjco5-
//   Campos: titulo, link, texto, vetor (1536 dimensões)
//
// COMO ATUALIZAR OS ARTIGOS:
//   1. Rode o script Python novamente para gerar novo artigos_com_vetores.json
//   2. Substitua o arquivo no Drive (mesmo nome)
//   3. O cache expira em 30 min — após isso o sistema usa a versão nova
//
// AJUSTES POSSÍVEIS:
//   TOP_N          → quantos artigos são enviados à IA por pergunta (padrão: 3)
//   CACHE_TTL_MS   → tempo de cache em ms (padrão: 30 min)
//   MIN_SIMILARITY → similaridade mínima para incluir artigo (0 a 1, padrão: 0.75)
//   MAX_CHARS_ART  → máximo de caracteres por artigo enviado à IA (padrão: 1500)
//   EMBED_MODEL    → modelo de embedding da OpenAI (deve ser o mesmo usado no script Python)
// =============================================================================

import { google } from 'googleapis';

// ID do arquivo no Google Drive
const VETORES_FILE_ID = process.env.WP_VETORES_FILE_ID || '1CseqB3VUC3I91lOwb1glJDaATkAjco5-';

// Configurações
const TOP_N          = 3;
const CACHE_TTL_MS   = 30 * 60 * 1000; // 30 minutos
const MIN_SIMILARITY = 0.75;            // ← abaixe para retornar mais artigos, suba para ser mais seletivo
const MAX_CHARS_ART  = 1500;            // ← aumente para enviar mais contexto por artigo
const EMBED_MODEL    = 'text-embedding-ada-002'; // mesmo modelo usado no script Python

// Cache em memória
let _cache = {
  artigos: null, // array com {titulo, texto, vetor}
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

// Baixa e parseia o JSON do Drive
async function loadCache() {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId: VETORES_FILE_ID, alt: 'media' },
    { responseType: 'text' }
  );
  const artigos = JSON.parse(res.data);
  _cache = { artigos, ts: Date.now() };
  console.log(`[context-wp] Cache carregado: ${artigos.length} artigos com embeddings`);
}

// Similaridade coseno entre dois vetores
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// Gera embedding da pergunta via OpenAI
async function embedPergunta(pergunta) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: pergunta.slice(0, 2000), // limite seguro de tokens
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

// Busca os artigos mais similares à pergunta
function buscarSimilares(vetorPergunta) {
  return _cache.artigos
    .map(artigo => ({
      artigo,
      score: cosine(vetorPergunta, artigo.vetor),
    }))
    .filter(({ score }) => score >= MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
}

// Handler principal
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message obrigatório' });

  try {
    // Carrega cache se necessário (primeira chamada ou expirado)
    if (!isCacheValid()) {
      await loadCache();
    }

    // Gera embedding da pergunta
    const vetorPergunta = await embedPergunta(message);

    // Busca artigos mais similares
    const resultados = buscarSimilares(vetorPergunta);

    if (!resultados.length) {
      return res.status(200).json({ context: '', count: 0 });
    }

    // Monta contexto — apenas titulo e texto, sem link
    const partes = resultados.map(({ artigo, score }) => {
      const texto = (artigo.texto || '').slice(0, MAX_CHARS_ART);
      const truncado = (artigo.texto || '').length > MAX_CHARS_ART ? '...' : '';
      return `--- ${artigo.titulo} ---\n${texto}${truncado}`;
    });

    return res.status(200).json({
      context: partes.join('\n\n'),
      count: resultados.length,
      titulos: resultados.map(r => r.artigo.titulo),
    });

  } catch (err) {
    console.error('[context-wp]', err.message);
    // Retorna vazio — chat funciona normalmente sem esta fonte
    return res.status(200).json({ context: '', count: 0, error: err.message });
  }
}
