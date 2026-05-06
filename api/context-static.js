// api/context-static.js
// Base de Conhecimento da UNASLAF — copiado do arquivo original
// Para editar: localize o bloco pelo id e edite o campo `content`

const DOCS = [];

export function findRelevantDocs(query, maxDocs = 8) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const kws = q.split(/\s+/).filter(w => w.length > 3);
  if (!kws.length) return DOCS.slice(0, maxDocs);
  return DOCS
    .map(doc => {
      const haystack = (doc.title + ' ' + doc.category + ' ' + doc.content)
        .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const score = kws.reduce((acc, kw) => acc + (haystack.split(kw).length - 1), 0);
      return { doc, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDocs)
    .map(s => s.doc);
}

export function buildContextString() {
  return DOCS.map(d => `===== ${d.title.toUpperCase()} =====\n${d.content}`).join('\n\n');
}

export { DOCS };

// ── Regras e instruções do agente ─────────────────────────────────────────────
DOCS.push({
  id: 'apresentacao',
  title: 'Apresentação Fontes Regras Matriz',
  category: 'regras',
  content: `BASE DE CONTEXTO E PESQUISA – UNASLAF

FINALIDADE
Este arquivo alimenta a base de conhecimento do agente virtual com IA da UNASLAF,
com foco em atendimento institucional, pesquisa contextual e recuperação por RAG.

POLÍTICA DE DADOS APLICADA
- Foram excluídos dados pessoais de endereço e documentos de identificação civil.
- Foram mantidos nome, CPF e matrícula SIAPE/matrícula funcional.
- A IA NÃO deve expor listas completas de associados em conversas abertas.
- A IA não deve dar parecer jurídico definitivo. Deve responder de forma
  institucional e encaminhar casos concretos ao jurídico da UNASLAF.
- Status processuais atualizados até julho/2023. Para andamento atual,
  consultar PJe/eproc/STF/STJ/TJDFT.

REGRAS DE RESPOSTA:
[REGRA 1] Responder em português do Brasil, tom cordial, institucional e seguro.
[REGRA 2] Não prometer pagamento, prazo, implantação ou vitória judicial.
[REGRA 3] Quando tema for ADI 4151, distinguir: Analista do Seguro Social,
          Técnico do Seguro Social, ativos, aposentados, pensionistas,
          redistribuídos e optantes pelo retorno ao INSS.
[REGRA 4] Quando tema for ação coletiva, informar que resposta tem base no
          relatório de julho/2023 e recomendar confirmação do andamento atual.
[REGRA 5] Pergunta individual ("tenho direito?", "estou na lista?"):
          verificar CPF/SIAPE em ambiente seguro/autenticado.
[REGRA 6] Não divulgar lista completa de associados. Usar apenas para consulta interna.
[REGRA 7] Se pedir orientação jurídica definitiva: encaminhar ao jurídico da UNASLAF.
[REGRA 9] Conflito entre documento antigo e informação posterior: priorizar
          informação mais recente validada pela Diretoria/Jurídico.
[REGRA 10] Em dúvida: "Com base nos documentos disponíveis..." ou
           "O documento analisado indica...".

MATRIZ DE PERTINÊNCIA:
[Alta] ADI 4151, Portarias 7.243 e 9.546, Ações coletivas, Estatuto.
[Condicionada] Regimento Eleitoral (dúvidas eleitorais), Lista 28% (consulta interna).
[Baixa] Conclusões jurídicas individualizadas → encaminhar ao jurídico.`
});

// ── Estatuto ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'estatuto',
  title: 'Estatuto UNASLAF Base Operacional',
  category: 'estatuto',
  content: `ESTATUTO UNASLAF – BASE OPERACIONAL

1. NATUREZA E FINALIDADE
- A UNASLAF é associação nacional, pessoa jurídica de direito privado,
  sem fins econômicos, com duração indeterminada e jurisdição nacional.
- CNPJ: 73.369.795/0001-83
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF
- Site: https://unaslaf.org.br
- Entidade democrática, sem caráter político-partidário ou religioso.
- Finalidade: defesa, organização, proteção de direitos e interesses coletivos
  e individuais e representação profissional de seus associados.

2. PRERROGATIVAS ESSENCIAIS
- Representar os associados perante os poderes públicos e a sociedade.
- Atuar judicial e extrajudicialmente como substituta processual.
- Defender a democracia, as liberdades individuais e coletivas.
- Propor medidas e requerimentos às autoridades administrativas e judiciais.

3. QUEM PODE SER ASSOCIADO
- Associado natural: servidor em efetivo exercício na Secretaria da Receita
  Previdenciária em 16/03/2007.
- Associado participante: pensionista dos servidores acima.
- NÃO podem associar-se os ocupantes do cargo de Auditor-Fiscal da Previdência Social.

4. DIREITOS DOS ASSOCIADOS
- Participar das Convenções Nacionais e votar/ser votado nas eleições.
- Frequentar a sede e gozar dos serviços e benefícios da entidade.
- Apresentar propostas e recorrer de atos lesivos a seus direitos.

5. DEVERES DOS ASSOCIADOS
- Cumprir as normas do Estatuto e pagar mensalidades regularmente.
- Zelar pela imagem da UNASLAF.

6. SANÇÕES DISCIPLINARES
- Advertência, multa (até 5x a mensalidade), perda de mandato e exclusão.
- Prazo de apuração: 30 dias, prorrogável por igual período.

7. ORGANIZAÇÃO DA UNASLAF
- Órgãos: Assembleia Geral, Conselho Executivo, Conselho Fiscal e Conselho de Ética.
- Conselho Executivo: Presidente, Vice-Presidente, Diretores de Finanças,
  Política de Classe, Comunicação, Jurídico, Parlamentar e Inativos.`
});

// Adicione aqui os demais documentos do context-static.js original
// (ADI 4151, portarias, ações coletivas, etc.)
// O arquivo completo context-static.js deve ser mantido como fonte de verdade.
