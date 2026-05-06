// =============================================================================
// chat.js — Endpoint principal do Chat com Inteligência Artificial
// =============================================================================
// Este arquivo controla COMO a IA responde ao associado.
// Está organizado em 5 seções:
//
//   SEÇÃO 1 — PERFIL DO AGENTE DE IA
//             ↳ Edite aqui o tom, as regras e o comportamento do atendente
//
//   SEÇÃO 2 — PALAVRAS-CHAVE QUE ATIVAM CADA TEMA
//             ↳ Edite aqui para que a IA reconheça novos assuntos
//
//   SEÇÃO 3 — MAPA DE TEMAS PARA DOCUMENTOS
//             ↳ Edite aqui para adicionar novos documentos ao sistema
//
//   SEÇÃO 4 — CONTEXTO DO DRIVE (atualizações sem redeploy)
//             ↳ Não precisa editar — funciona automaticamente
//
//   SEÇÃO 5 — CONFIGURAÇÕES TÉCNICAS (modelo de IA, tokens, etc.)
//             ↳ Edite aqui para trocar o modelo ou ajustar limites
//
// =============================================================================

import { DOCS } from './context-static.js';


// =============================================================================
// SEÇÃO 1 — PERFIL DO AGENTE DE IA
// =============================================================================
// Define a identidade, o tom e as regras de comportamento do atendente virtual.
//
// COMO EDITAR:
// - Para mudar o nome do atendente: altere "Atendente Virtual da UNASLAF"
// - Para mudar o tom: edite a linha TOM E ESTILO
// - Para adicionar ou remover uma regra: edite a lista de REGRAS abaixo
// - Para mudar a mensagem de encerramento: edite INSTRUÇÃO FINAL
//
// ATENÇÃO: não remova as aspas (`) do início e do fim do texto.
// =============================================================================

const PERFIL_AGENTE = `
Você é o Atendente Virtual da UNASLAF — Associação Nacional dos Servidores
da Extinta Secretaria da Receita Previdenciária.

IDENTIDADE:
- Nome: Atendente Virtual UNASLAF
- CNPJ: 73.369.795/0001-83
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF
- Site oficial: https://unaslaf.org.br
- E-mail: unaslaf@unaslaf.org.br

TOM E ESTILO:
- Linguagem clara, cordial, institucional e segura
- Português brasileiro, sem termos técnicos desnecessários
- Respostas objetivas e bem organizadas
- Sempre identificar quando a informação pode estar desatualizada

REGRAS DE COMPORTAMENTO:
[REGRA 1] Use APENAS as informações da base de conhecimento fornecida.
          Se não souber, diga que não tem essa informação disponível.
[REGRA 2] NÃO prometa pagamentos, prazos, datas ou vitórias judiciais.
[REGRA 3] Para a ADI 4151, sempre distinguir: Analista x Técnico,
          ativo x aposentado x pensionista x redistribuído x retornou ao INSS.
[REGRA 4] Para ações coletivas, informar que os dados são de julho/2023
          e recomendar confirmação do andamento atual.
[REGRA 5] Se o associado perguntar se tem direito a algo: verificar o
          CPF/SIAPE autenticado e consultar as listas disponíveis.
[REGRA 6] NÃO divulgar listas completas de associados. Usar apenas
          para consulta individual e autenticada.
[REGRA 7] Se pedir parecer jurídico definitivo: encaminhar ao jurídico
          da UNASLAF. A IA orienta, mas não dá pareceres finais.
[REGRA 8] Em caso de conflito entre documentos: usar a informação
          mais recente validada pela Diretoria ou Jurídico.
[REGRA 9] Sempre que citar informação de documento: indicar a fonte.

INSTRUÇÃO FINAL:
Responda em português brasileiro, linguagem clara e cordial.
Use APENAS as informações da base de conhecimento abaixo.
Se não tiver os detalhes solicitados, informe e oriente o associado
a entrar em contato pelo site unaslaf.org.br.
`;


// =============================================================================
// SEÇÃO 2 — PALAVRAS-CHAVE QUE ATIVAM CADA TEMA
// =============================================================================
// Quando o associado digita uma mensagem, o sistema verifica se ela contém
// alguma das palavras abaixo para decidir qual documento enviar à IA.
//
// COMO EDITAR:
// - Para adicionar palavras a um tema: insira dentro das barras /assim|assim/i
//   separando por | (pipe). Ex: /pasep|pis|fundo/i
// - Para criar um novo tema: adicione uma nova linha no formato:
//   nomeDoTema: /palavra1|palavra2|palavra3/i,
// - A letra "i" no final significa "ignorar maiúsculas/minúsculas" — mantenha.
// - O símbolo | significa "OU" — use para separar palavras alternativas.
// - O símbolo .* significa "qualquer coisa no meio" — ex: abono.*ponto
//   detecta "abono de ponto", "abono do ponto", "abono qualquer coisa ponto".
//
// DICA: Se a IA não está respondendo bem sobre um assunto, provavelmente
// falta adicionar a palavra-chave correta aqui.
// =============================================================================

const DETECTORES = {

  // Lista todas as ações coletivas
  listaAcoes: /quais.*ações|todas.*ações|ações coletivas|lista.*ações|ações.*unaslaf|ações.*patrocinadas|processos.*unaslaf/i,

  // ADI 4151 — a ação mais importante
  adi4151: /adi\s*4151|adi4151|4151/i,

  // Portarias de enquadramento (analistas ativos, aposentados, pensionistas)
  portaria: /portaria|enquadramento|analista.*tributário|siape|redistribuído/i,

  // Estatuto da entidade
  estatuto: /estatuto|filiação|desfiliação|associado|mensalidade|sanção|penalidade|conselho/i,

  // Regimento eleitoral e assembleias
  regimento: /regimento|eleição|delegado|chapa|votação|impugnação|assembleia/i,

  // Lista de associados da ação dos 28%
  lista28: /28%|lista.*associado|ação.*28|ação dos 28/i,

  // Tabela completa de todos os processos (todos os escritórios)
  processos: /tabela.*processo|todos.*processos|lista.*processo|escritório.*mota|malinverni|pecfaz|nomenclatura|28,86|reajuste.*28|execução.*sentença.*rs/i,

  // Ação judicial específica por nome ou assunto
  detalhesAcao: /ação\s*\d+|adicional.*fronteira|jornada|abono.*ponto|geap|mp\s*873|auxílio.*transporte|covid|pasep|abono.*permanência|paridade|reposição.*erário|licença.*prêmio|irpf.*creche|quota.*creche|dobra.*teto|fronteira/i,

  // Busca na internet — ativa quando o associado pede informações recentes
  // Adicione palavras que indicam que o usuário quer notícias atuais
  buscaWeb: /notícia|noticia|recente|último|ultima|hoje|esta semana|novidade|atualização/i,
};


// =============================================================================
// SEÇÃO 3 — MAPA DE TEMAS PARA DOCUMENTOS
// =============================================================================
// Define qual documento do context-static.js é carregado para cada tema.
// A chave (esquerda) é uma palavra-chave da pergunta.
// O valor (direita) é o "id" do documento em context-static.js.
//
// COMO EDITAR:
// - Para mapear um novo assunto a um documento existente:
//   adicione uma linha: 'palavra-chave': 'id_do_documento',
// - Para adicionar suporte a uma nova ação (ex: acao_16):
//   primeiro crie o documento em context-static.js com id: 'acao_16'
//   depois adicione aqui: 'nome da ação': 'acao_16',
//
// LISTA DE IDs DISPONÍVEIS NO context-static.js:
//   apresentacao, estatuto, regimento, adi_4151
//   portaria_7243, portaria_9546
//   acoes_indice, acao_01 a acao_15
//   processos_completo
//   lista_28_pt1, lista_28_pt2
// =============================================================================

const MAPA_ACOES = {
  'fronteira':            'acao_01',
  'jornada':              'acao_02',
  'abono.*ponto':         'acao_02',
  'geap':                 'acao_03',
  'mp.*873':              'acao_04',
  'transporte.*coletiva': 'acao_05',
  'transporte.*grupo':    'acao_06',
  'covid':                'acao_07',
  'pasep':                'acao_08',
  'abono.*permanência':   'acao_09',
  'paridade':             'acao_10',
  'reposição.*erário':    'acao_11',
  'licença.*prêmio':      'acao_12',
  'irpf.*creche':         'acao_13',
  'quota.*creche':        'acao_14',
  'dobra.*teto':          'acao_15',
  // Para adicionar nova ação, insira aqui:
  // 'palavra-chave':     'acao_16',
};


// =============================================================================
// SEÇÃO 4 — CONTEXTO DO DRIVE (atualizações dinâmicas sem redeploy)
// =============================================================================
// Esta seção lê arquivos da pasta de contexto do Google Drive automaticamente.
// Qualquer arquivo .txt ou planilha que você subir na pasta de contexto
// será incluído nas respostas da IA em até 10 minutos.
//
// VOCÊ NÃO PRECISA EDITAR ESTE CÓDIGO.
// Para atualizar o conteúdo: basta subir arquivos na pasta do Drive.
// Pasta de contexto: https://drive.google.com/drive/folders/1V9tGV_mR7_c0xNr4TOR1LoYbMX5dbJPu
// =============================================================================

let driveCache = { text: '', ts: 0 };
const DRIVE_CACHE_TTL = 10 * 60 * 1000; // 10 minutos em milissegundos

async function getDriveContext(baseUrl) {
  const now = Date.now();
  if (driveCache.text && (now - driveCache.ts) < DRIVE_CACHE_TTL) {
    return driveCache.text; // retorna do cache se ainda válido
  }
  try {
    const res = await fetch(`${baseUrl}/api/context`);
    if (!res.ok) return '';
    const data = await res.json();
    driveCache = { text: data.context || '', ts: now };
    console.log(`Drive context carregado: ${data.filesRead} arquivos, ${driveCache.text.length} chars`);
    return driveCache.text;
  } catch (e) {
    console.warn('Drive context erro (usando apenas contexto estático):', e.message);
    return '';
  }
}


// =============================================================================
// SEÇÃO 5 — CONFIGURAÇÕES TÉCNICAS
// =============================================================================
// Configurações do modelo de IA e limites de resposta.
//
// MODELO DE IA — opções disponíveis (substituir o valor de AI_MODEL):
//   'gpt-4.1-mini'  → atual — rápido, econômico, boa qualidade ✓
//   'gpt-4o-mini'   → alternativa mais barata, qualidade um pouco inferior
//   'gpt-4.1'       → premium, respostas mais elaboradas, mais caro
//   'gpt-4o'        → premium alternativo, mais caro
//
// MAX_TOKENS_RESPOSTA: tamanho máximo da resposta da IA.
//   500  = resposta curta
//   1000 = resposta média
//   2000 = resposta longa (atual)
//   4000 = resposta muito longa (pode ficar lento)
//
// LIMITE_DRIVE_CHARS: quantos caracteres do Drive são enviados à IA.
//   Aumentar pode melhorar respostas sobre atualizações do Drive,
//   mas aumenta o custo e o tempo de resposta.
// =============================================================================

const AI_MODEL            = 'gpt-4.1-mini'; // ← troque o modelo aqui
const MAX_TOKENS_RESPOSTA = 2000;            // ← tamanho máximo da resposta
const LIMITE_DRIVE_CHARS  = 8000;            // ← limite do contexto do Drive


// =============================================================================
// CÓDIGO INTERNO — não é necessário editar abaixo desta linha
// =============================================================================

// Monta um índice resumido dos documentos para perguntas genéricas (~500 tokens)
let _indice = null;
function getIndice() {
  if (_indice) return _indice;
  _indice = DOCS.map(d => {
    const resumo = d.content.split('\n').filter(l => l.trim()).slice(0, 3).join(' ').slice(0, 200);
    return `[${d.id}] ${d.title} | ${d.category} | ${resumo}...`;
  }).join('\n');
  return _indice;
}

// Busca um documento pelo id
function getDoc(id) {
  const doc = DOCS.find(d => d.id === id);
  if (!doc) return '';
  return `===== ${doc.title.toUpperCase()} =====\n${doc.content}`;
}

// Seleciona o contexto mais relevante para a pergunta (RAG)
function selectContext(msg) {
  const m = msg.toLowerCase();

  // Lista completa de ações → índice + todas as ações
  if (DETECTORES.listaAcoes.test(m)) {
    const acoes = DOCS.filter(d => d.category === 'acoes_coletivas' || d.category === 'relatorio_acoes_indice');
    return acoes.map(d => `===== ${d.title.toUpperCase()} =====\n${d.content}`).join('\n\n');
  }

  // ADI 4151
  if (DETECTORES.adi4151.test(m)) return getDoc('adi_4151');

  // Portarias de enquadramento
  if (DETECTORES.portaria.test(m)) return getDoc('portaria_7243') + '\n\n' + getDoc('portaria_9546');

  // Estatuto
  if (DETECTORES.estatuto.test(m)) return getDoc('estatuto');

  // Regimento eleitoral
  if (DETECTORES.regimento.test(m)) return getDoc('regimento');

  // Lista 28%
  if (DETECTORES.lista28.test(m)) return getDoc('lista_28_pt1') + '\n\n' + getDoc('lista_28_pt2');

  // Tabela completa de processos
  if (DETECTORES.processos.test(m)) return getDoc('processos_completo');

  // Ação específica por palavra-chave ou número
  if (DETECTORES.detalhesAcao.test(m)) {
    for (const [pattern, id] of Object.entries(MAPA_ACOES)) {
      if (new RegExp(pattern, 'i').test(m)) return getDoc(id);
    }
    const numMatch = m.match(/ação\s*(\d+)/i);
    if (numMatch) {
      const id = `acao_${String(numMatch[1]).padStart(2, '0')}`;
      const doc = DOCS.find(d => d.id === id);
      if (doc) return `===== ${doc.title.toUpperCase()} =====\n${doc.content}`;
    }
  }

  // Padrão: índice resumido (~500 tokens)
  return `ÍNDICE DOS DOCUMENTOS DISPONÍVEIS:\n${getIndice()}\n\nINSTRUÇÃO: Se o associado pedir detalhes sobre um tema específico, indique que pode fornecer mais informações.`;
}

// Chamada à OpenAI com busca web (para perguntas sobre notícias/atualizações)
async function searchAndAnswer(msgs) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: AI_MODEL, tools: [{ type: 'web_search_preview' }], tool_choice: 'auto', input: msgs }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.output?.filter(o => o.type === 'message')?.flatMap(o => o.content || [])?.filter(c => c.type === 'output_text')?.map(c => c.text)?.join('') || null;
}

// Chamada à OpenAI padrão (para a maioria das perguntas)
async function standardAnswer(msgs) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: MAX_TOKENS_RESPOSTA, messages: msgs }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return data.choices?.[0]?.message?.content || '';
}

// Handler principal — processa cada mensagem do chat
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system, userName, userCpf, baseUrl } = req.body;
  const lastMsg = messages?.[messages.length - 1]?.content || '';

  // Camada 1 — Contexto estático (instantâneo, do context-static.js)
  const staticContext = selectContext(lastMsg);

  // Camada 2 — Contexto do Drive (dinâmico, atualizado sem redeploy)
  const driveContext = baseUrl ? await getDriveContext(baseUrl) : '';

  // Combina os dois contextos: estático tem prioridade, Drive complementa
  const context = driveContext
    ? `${staticContext}\n\n========================================\nATUALIZAÇÕES RECENTES (documentos do Drive):\n========================================\n${driveContext.slice(0, LIMITE_DRIVE_CHARS)}`
    : staticContext;

  // Monta o prompt completo enviado à IA
  const systemFull = `${PERFIL_AGENTE}

DADOS DO ASSOCIADO AUTENTICADO:
- Nome: ${userName || 'não informado'}
- CPF: ${userCpf || 'não informado'}

========================================
BASE DE CONHECIMENTO UNASLAF:
========================================
${context}
========================================`;

  const openaiMessages = [{ role: 'system', content: systemFull }, ...messages];

  try {
    let text = '';
    if (DETECTORES.buscaWeb.test(lastMsg)) {
      // Pergunta sobre notícias/atualizações → usa busca web
      text = await searchAndAnswer(openaiMessages);
      if (!text) text = await standardAnswer(openaiMessages); // fallback
    } else {
      // Pergunta normal → usa base de conhecimento
      text = await standardAnswer(openaiMessages);
    }
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
