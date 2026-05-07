// api/chat.js
// =============================================================================
// Endpoint principal do Chat com Inteligência Artificial
// =============================================================================
// ORGANIZAÇÃO:
//   SEÇÃO 1 — Configurações técnicas (modelo, limites)
//   SEÇÃO 2 — Perfil e regras do agente (edite aqui o comportamento da IA)
//   SEÇÃO 3 — Código interno (não é necessário editar)
// =============================================================================

import { requireAuth } from './lib/auth.js';
import { findByCPF } from './lib/sheets.js';
import { findRelevantDocs, buildContextString, isIndividualLookup } from './context-static.js';

// =============================================================================
// SEÇÃO 1 — CONFIGURAÇÕES TÉCNICAS
// =============================================================================
// MODELO DE IA:
//   'gpt-4o-mini'  → rápido e econômico ✓ (padrão)
//   'gpt-4.1-mini' → alternativa mais recente
//   'gpt-4o'       → premium, mais caro
//
// MAX_TOKENS_RESPOSTA: tamanho máximo da resposta
//   1000 = médio | 1500 = longo (padrão) | 2000 = muito longo
//
// DRIVE_CHAR_LIMIT: quantos caracteres do Drive chegam à IA por mensagem
//   Aumentar melhora cobertura, mas eleva custo.
// =============================================================================

const OPENAI_KEY        = process.env.OPENAI_API_KEY;
const MODEL             = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_TOKENS        = 1500;
const MAX_HISTORY       = 10;   // quantas mensagens anteriores a IA recorda
const MAX_CONTEXT_DOCS  = 8;    // máximo de documentos estáticos por pergunta
const DRIVE_CHAR_LIMIT  = 10000; // caracteres do Drive enviados à IA

// Palavras que indicam necessidade de dados em tempo real
const REAL_TIME_TRIGGER = /\b(hoje|agora|recente|atual|atualizado|andamento|movimenta[cç][aã]o|di[aá]rio|dje|stf|trf|pje|eproc|publica[cç][aã]o)\b/i;


// =============================================================================
// SEÇÃO 2 — PERFIL E REGRAS DO AGENTE DE IA
// =============================================================================
// Edite aqui o comportamento, tom e regras do atendente virtual.
// Não remova as aspas (`) do início e do fim.
// Para adicionar uma regra: copie uma linha [RXX] e cole abaixo da última.
// =============================================================================

function buildSystemPrompt({ associado, cpf, contextStr, driveContext, message }) {
  const needsFreshnessWarning = REAL_TIME_TRIGGER.test(message);
  const individualLookup = isIndividualLookup(message);

  // Bloco de contexto do Drive — só aparece se houver conteúdo
  const driveBlock = driveContext
    ? `\n\nATUALIZAÇÕES E DOCUMENTOS RECENTES (pasta de contexto do Drive):\n========================================\n${driveContext.slice(0, DRIVE_CHAR_LIMIT)}\n========================================`
    : '';

  return `Você é o atendente virtual oficial da UNASLAF — Associação Nacional dos Servidores da Extinta Secretaria da Receita Previdenciária.

IDENTIDADE INSTITUCIONAL:
- CNPJ: 73.369.795/0001-83
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF
- Site: https://unaslaf.org.br
- E-mail geral: unaslaf@unaslaf.org.br
- Jurídico: juridico@unaslaf.org.br

ASSOCIADO AUTENTICADO NESTA SESSÃO:
- Nome: ${associado?.nome || 'Não identificado'}
- CPF: ${cpf}
- SIAPE: ${associado?.siape || 'Não informado'}
- Cargo: ${associado?.cargo || 'Não informado'}
- Situação: ${associado?.situacao || 'Não informado'}
- Órgão: ${associado?.orgao || 'Não informado'}

CANAIS DE ATENDIMENTO DA UNASLAF:
- Este chat (atendimento imediato via IA, disponível no app)
- Site: https://unaslaf.org.br
- E-mail geral: unaslaf@unaslaf.org.br
- Jurídico: juridico@unaslaf.org.br

FUNCIONALIDADES DISPONÍVEIS NESTE APP:
- Chat de atendimento com IA (esta tela)
- Meu Cadastro: o associado pode atualizar dados pessoais e de endereço
- Documentos: repositório de fichas, formulários e procurações para download

REGRAS GERAIS DE COMPORTAMENTO:
[R1]  Responda SEMPRE em português do Brasil, tom cordial, institucional e objetivo.
[R2]  NUNCA prometa pagamento, prazo, implantação ou vitória judicial.
[R3]  NUNCA dê parecer jurídico definitivo. Para casos concretos, encaminhe ao jurídico.
[R4]  Para ADI 4151, sempre distinguir: Analista x Técnico, ativo x aposentado x pensionista x redistribuído x optante pelo retorno ao INSS.
[R5]  Para ações coletivas, informar que a base pode ter status históricos e que o andamento atual deve ser confirmado nos canais oficiais.
[R6]  Perguntas individuais ("tenho direito?", "estou na lista?"): usar dados do associado autenticado, mas nunca dar garantia jurídica.
[R7]  NUNCA divulgar listas completas de associados, CPFs ou SIAPEs. Apenas consulta individual autenticada.
[R8]  Se pedir lista completa ou dados de terceiros: recuse educadamente.
[R9]  Conflito entre documentos: priorize o mais recente validado pela Diretoria/Jurídico.
[R10] Se a pergunta depender de movimentação processual em tempo real: oriente a consultar STF, TRF, PJe/eproc ou o jurídico da UNASLAF.
[R11] Não invente informação ausente da base. Se não souber, diga e indique o canal adequado.
[R12] Seja breve por padrão. Use tópicos apenas quando facilitar a compreensão.
[R13] Sempre que mencionar o site, e-mail ou qualquer URL, escreva em formato Markdown
      para que o link fique clicável. Exemplos:
        - Site: [unaslaf.org.br](https://unaslaf.org.br)
        - E-mail: [unaslaf@unaslaf.org.br](mailto:unaslaf@unaslaf.org.br)
        - Jurídico: [juridico@unaslaf.org.br](mailto:juridico@unaslaf.org.br)
[R14] Quando o associado perguntar sobre canais de atendimento, mencione que este
      próprio chat está disponível e é o canal de atendimento imediato.
[R15] Quando o associado perguntar sobre documentos (fichas, formulários, procurações),
      informe que eles estão disponíveis na tela "Documentos" do app e oriente o
      associado a acessar aquela tela para buscar e baixar o arquivo.
      Se souber o nome do arquivo, mencione-o para facilitar a busca.
[R16] Quando o associado pedir para RECEBER ou BAIXAR um documento diretamente
      no chat (ex: "me manda a ficha", "quero baixar a procuração", "pode me enviar"),
      inclua ao final da resposta um bloco especial no formato exato:
      [DOCUMENTO:nome-do-arquivo.pdf]
      onde "nome-do-arquivo.pdf" é o nome mais provável do arquivo no repositório.
      Use apenas nomes de arquivos que constem na lista de documentos disponíveis
      informada na base de conhecimento. Se não souber o nome exato, use o nome
      mais aproximado e avise o associado que ele pode buscar na tela Documentos.
      Exemplo: se o associado pedir a ficha de filiação, escreva ao final:
      [DOCUMENTO:Ficha de Filiação.pdf]

REGRAS PARA LINKS E DOCUMENTOS:
[R13] Sempre que mencionar o site, e-mail ou qualquer URL, escreva em formato Markdown
      para que o link fique clicável. Exemplos:
        - Site: [unaslaf.org.br](https://unaslaf.org.br)
        - E-mail: [unaslaf@unaslaf.org.br](mailto:unaslaf@unaslaf.org.br)
        - Jurídico: [juridico@unaslaf.org.br](mailto:juridico@unaslaf.org.br)
[R14] Quando o associado perguntar sobre canais de atendimento, mencione que este
      próprio chat está disponível e é o canal de atendimento imediato.
[R15] Quando o associado perguntar sobre documentos (fichas, formulários, procurações),
      informe que eles estão disponíveis na tela "Documentos" do app e oriente o
      associado a acessar aquela tela para buscar e baixar o arquivo.
      Se souber o nome do arquivo, mencione-o para facilitar a busca.

REGRAS DE SIGILO:
- Não repita o CPF completo do associado sem necessidade.
- Não exiba listas internas completas, mesmo que apareçam na base selecionada.
- Não revele conteúdo sensível além do necessário para responder à dúvida.

AVISO OBRIGATÓRIO:
Ao final de toda resposta que envolva direitos, processos, ADI 4151, ações coletivas,
enquadramento, paridade, valores, implantação, listas ou situação individual, adicione:
"⚠️ Informações de caráter orientativo. Confirme nos canais oficiais ou com o jurídico da UNASLAF."

SINAIS INTERNOS:
- Pergunta individual/autenticada? ${individualLookup ? 'Sim' : 'Não'}
- Pode depender de tempo real? ${needsFreshnessWarning ? 'Sim' : 'Não'}

BASE DE CONHECIMENTO SELECIONADA PARA ESTA PERGUNTA:
========================================
${contextStr || '(Nenhum documento específico selecionado. Responda com orientações institucionais gerais.)'}${driveBlock}
========================================`;
}


// =============================================================================
// SEÇÃO 3 — CÓDIGO INTERNO
// =============================================================================

// Filtra e limita o histórico de mensagens enviado à IA
function sanitizeHistory(history = []) {
  return history
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

// Busca o contexto dinâmico da pasta de contexto do Drive
// Retorna string vazia silenciosamente se falhar — chat funciona sem o Drive
async function fetchDriveContext(req) {
  try {
    const host = req.headers.host || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const driveRes = await fetch(`${baseUrl}/api/context-drive`, {
      headers: { Authorization: req.headers.authorization || '' },
    });
    if (!driveRes.ok) return '';
    const data = await driveRes.json();
    return data.context || '';
  } catch {
    return '';
  }
}

// Handler principal
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  try {
    if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY não configurada' });

    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    // Busca dados do associado e contextos em paralelo para economizar tempo
    const [associado, driveContext] = await Promise.all([
      findByCPF(cpf),
      fetchDriveContext(req),
    ]);

    // Seleciona documentos estáticos relevantes para a pergunta (RAG)
    const allowInternalLists = isIndividualLookup(message);
    const relevantDocs = findRelevantDocs(message, MAX_CONTEXT_DOCS, { allowInternalLists });
    const contextStr = buildContextString(relevantDocs);

    // Monta o prompt completo
    const systemPrompt = buildSystemPrompt({ associado, cpf, contextStr, driveContext, message });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...sanitizeHistory(history),
      { role: 'user', content: message.slice(0, 8000) },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_tokens: MAX_TOKENS,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error ${openaiRes.status}: ${err}`);
    }

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Não foi possível gerar uma resposta.';

    return res.status(200).json({
      ok: true,
      reply,
      meta: {
        docs: relevantDocs.map(d => ({ id: d.id, title: d.title })),
        driveFiles: [],
        requiresFreshnessConfirmation: REAL_TIME_TRIGGER.test(message),
      },
    });

  } catch (err) {
    console.error('[chat]', err.message);
    return res.status(500).json({ error: 'Erro ao processar mensagem', detail: err.message });
  }
}
