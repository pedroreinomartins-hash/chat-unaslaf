// api/chat.js
// Endpoint do chat de IA com RAG (Retrieval Augmented Generation)

import { requireAuth } from './lib/auth.js';
import { findByCPF } from './lib/sheets.js';
import { findRelevantDocs, buildContextString, isIndividualLookup } from './context-static.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_HISTORY = 10;
const MAX_CONTEXT_DOCS = 8;

// Este endpoint responde com base na base estática da UNASLAF.
// Para andamentos processuais em tempo real, a resposta deve orientar consulta aos canais oficiais.
const REAL_TIME_TRIGGER = /\b(hoje|agora|recente|atual|atualizado|andamento|movimenta[cç][aã]o|di[aá]rio|dje|stf|trf|pje|eproc|publica[cç][aã]o)\b/i;

function sanitizeHistory(history = []) {
  return history
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

function buildAssociadoBlock(associado, cpf) {
  return `ASSOCIADO AUTENTICADO NESTA SESSÃO:\n` +
    `- Nome: ${associado?.nome || 'Não identificado'}\n` +
    `- CPF: ${cpf}\n` +
    `- SIAPE: ${associado?.siape || associado?.matricula_siape || associado?.matricula || 'Não informado'}\n` +
    `- Cargo: ${associado?.cargo || 'Não informado'}\n` +
    `- Tipo: ${associado?.tipo || associado?.funcional || 'Não informado'}\n` +
    `- Situação: ${associado?.situacao || 'Não informado'}\n` +
    `- Órgão: ${associado?.orgao || 'Não informado'}`;
}

function buildSystemPrompt({ associado, cpf, contextStr, message }) {
  const needsFreshnessWarning = REAL_TIME_TRIGGER.test(message);
  const individualLookup = isIndividualLookup(message);

  return `Você é o atendente virtual oficial da UNASLAF, associação nacional voltada à defesa institucional, administrativa e judicial dos servidores e pensionistas vinculados à extinta Secretaria da Receita Previdenciária, especialmente no contexto dos servidores redistribuídos à Receita Federal do Brasil.

IDENTIDADE INSTITUCIONAL DA UNASLAF:
- CNPJ: 73.369.795/0001-83
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF
- Site: https://unaslaf.org.br
- E-mail institucional: unaslaf@unaslaf.org.br
- Jurídico: juridico@unaslaf.org.br

${buildAssociadoBlock(associado, cpf)}

REGRAS GERAIS DE COMPORTAMENTO:
[R1] Responda SEMPRE em português do Brasil, com tom cordial, institucional, objetivo e seguro.
[R2] NUNCA prometa pagamento, prazo, implantação, êxito judicial, trânsito em julgado ou decisão administrativa futura.
[R3] NUNCA dê parecer jurídico definitivo. Para caso concreto, orientar contato com o jurídico da UNASLAF.
[R4] Quando o tema for ADI 4151, distinguir sempre: Analista do Seguro Social, Técnico do Seguro Social, ativo, aposentado, pensionista, redistribuído à RFB e optante pelo retorno ao INSS.
[R5] Quando o tema for ação coletiva, informar que a base pode conter status históricos e que o andamento atual deve ser confirmado nos canais oficiais/processuais ou com a assessoria jurídica.
[R6] Perguntas individuais como "tenho direito?", "estou na lista?", "meu CPF consta?": usar apenas os dados do associado autenticado e os documentos selecionados, mas nunca dar garantia jurídica ou conclusão definitiva.
[R7] NUNCA divulgar listas completas de associados, CPFs, SIAPEs, beneficiários ou substituídos. Se houver lista interna no contexto, use apenas para conferência individual autenticada.
[R8] Se o usuário pedir lista completa, base de CPFs, dados pessoais de terceiros ou exportação de beneficiários, recuse de forma educada e explique que a consulta só pode ser individual e autenticada.
[R9] Havendo conflito entre documentos, priorize a informação mais recente, expressamente validada pela Diretoria/Jurídico; se não houver segurança, diga: "Com base nos documentos disponíveis...".
[R10] Se a pergunta depender de movimentação processual em tempo real, diga que você não substitui a consulta aos sistemas oficiais e recomende confirmação no STF, TRF, PJe/eproc ou jurídico da UNASLAF.
[R11] Não invente informação ausente da base. Quando a base não trouxer resposta suficiente, diga isso com clareza e indique o canal adequado.
[R12] Seja breve por padrão. Use tópicos apenas quando facilitar a compreensão.

REGRAS ESPECÍFICAS DE SIGILO E DADOS:
- A autenticação por CPF existe para personalização e consulta individual; não autoriza expor dados de terceiros.
- Não repita CPF completo do associado sem necessidade. Quando precisar mencionar, mascare parcialmente.
- Não exiba listas internas completas, ainda que apareçam na base de conhecimento selecionada.
- Não revele conteúdo interno sensível além do necessário para responder à dúvida do associado.

AVISO OBRIGATÓRIO:
Ao final de toda resposta que envolva direitos, processos, ADI 4151, ações coletivas, enquadramento, paridade, valores, implantação, listas ou situação individual, adicione discretamente:
"⚠️ Informações de caráter orientativo. Confirme nos canais oficiais ou com o jurídico da UNASLAF."

SINAIS INTERNOS DA PERGUNTA:
- Pergunta parece individual/autenticada? ${individualLookup ? 'Sim' : 'Não'}
- Pode depender de atualização em tempo real? ${needsFreshnessWarning ? 'Sim' : 'Não'}

BASE DE CONHECIMENTO SELECIONADA PARA ESTA PERGUNTA:
${contextStr || '(Nenhum documento específico foi selecionado. Responda apenas com orientações institucionais gerais e, se necessário, encaminhe aos canais oficiais.)'}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  try {
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY não configurada' });
    }

    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const associado = await findByCPF(cpf);

    const allowInternalLists = isIndividualLookup(message);
    const relevantDocs = findRelevantDocs(message, MAX_CONTEXT_DOCS, { allowInternalLists });
    const contextStr = buildContextString(relevantDocs);

    const systemPrompt = buildSystemPrompt({ associado, cpf, contextStr, message });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...sanitizeHistory(history),
      { role: 'user', content: message.slice(0, 8000) },
    ];

    const payload = {
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 1500,
    };

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
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
        docs: relevantDocs.map(d => ({ id: d.id, title: d.title, category: d.category })),
        requiresFreshnessConfirmation: REAL_TIME_TRIGGER.test(message),
      },
    });
  } catch (err) {
    console.error('[chat]', err);
    return res.status(500).json({ error: 'Erro ao processar mensagem', detail: err.message });
  }
}
