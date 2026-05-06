backup chat:

// api/chat.js
// Endpoint do chat de IA com RAG (Retrieval Augmented Generation)

import { requireAuth } from './lib/auth.js';
import { findByCPF } from './lib/sheets.js';
import { findRelevantDocs } from './context-static.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o-mini';

// Palavras-chave que ativam busca web
const WEB_TRIGGER = /not[ií]cia|recente|hoje|esta semana|novidade|atualiza[çc][aã]o/i;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Auth
  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });

    // Dados do associado para personalização
    const associado = await findByCPF(cpf);

    // RAG: seleciona documentos relevantes
    const relevantDocs = findRelevantDocs(message);
    const contextStr = relevantDocs
      .map(d => `===== ${d.title.toUpperCase()} =====\n${d.content}`)
      .join('\n\n');

    // System prompt
    const systemPrompt = `Você é o atendente virtual oficial da UNASLAF — União Nacional dos Analistas e Técnicos de Finanças e Controle.

IDENTIDADE DA UNASLAF:
- CNPJ: 73.369.795/0001-83
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF
- Site: https://unaslaf.org.br

ASSOCIADO AUTENTICADO NESTA SESSÃO:
- Nome: ${associado?.nome || 'Não identificado'}
- CPF: ${cpf}
- SIAPE: ${associado?.siape || 'Não informado'}
- Cargo: ${associado?.cargo || 'Não informado'}
- Tipo: ${associado?.tipo || 'Não informado'}
- Situação: ${associado?.situacao || 'Não informado'}
- Órgão: ${associado?.orgao || 'Não informado'}

REGRAS DE COMPORTAMENTO:
[R1] Responda SEMPRE em português do Brasil, tom cordial, institucional e seguro.
[R2] NUNCA prometa pagamento, prazo, implantação ou vitória judicial.
[R3] Para ADI 4151: distinga Analista x Técnico, ativo x aposentado x pensionista.
[R4] Para ações coletivas: informe que os dados são de julho/2023 e recomende confirmação.
[R5] Perguntas individuais ("tenho direito?", "estou na lista?"): use os dados do associado autenticado para verificar, mas nunca dê garantia jurídica.
[R6] NUNCA divulgue a lista completa de associados.
[R7] Orientação jurídica definitiva: encaminhe ao jurídico da UNASLAF (juridico@unaslaf.org.br).
[R9] Conflito entre documentos: priorize a informação mais recente.
[R10] Em dúvida: "Com base nos documentos disponíveis..." ou "O documento indica...".

AVISO OBRIGATÓRIO: Ao final de toda resposta que envolva direitos, processos ou situações individuais, adicione discretamente: "⚠️ Informações de caráter orientativo. Confirme nos canais oficiais ou com o jurídico da UNASLAF."

BASE DE CONHECIMENTO SELECIONADA PARA ESTA PERGUNTA:
${contextStr || '(nenhum documento específico selecionado — responda com base no conhecimento institucional geral da UNASLAF)'}`;

    // Monta histórico para a API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Ferramentas opcionais (busca web apenas se necessário)
    const tools = WEB_TRIGGER.test(message) ? [{
      type: 'web_search_20250305',
      name: 'web_search',
    }] : undefined;

    // Chama OpenAI
    const payload = {
      model: MODEL,
      max_tokens: 1500,
      messages,
      ...(tools ? { tools } : {}),
    };

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error ${openaiRes.status}: ${err}`);
    }

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Não foi possível gerar uma resposta.';

    return res.status(200).json({ ok: true, reply });

  } catch (err) {
    console.error('[chat]', err);
    return res.status(500).json({ error: 'Erro ao processar mensagem', detail: err.message });
  }
}
