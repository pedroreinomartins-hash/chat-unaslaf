// api/context-static.js
// Base de Conhecimento da UNASLAF — atualizada a partir do anexo completo
// Para editar: localize o bloco pelo id e edite o campo `content`.

const DOCS = [];


// =============================================================================
// SEÇÃO 0 — FUNCIONALIDADES DO APP E CANAIS DE ATENDIMENTO
// =============================================================================
// Descreve o próprio sistema para que a IA explique ao associado como usar
// o app, o que cada tela faz e quais documentos estão disponíveis.
//
// COMO EDITAR:
// - Se adicionar nova tela ou funcionalidade ao app, descreva-a aqui.
// - Se novos documentos forem adicionados ao repositório, liste-os abaixo
//   em "DOCUMENTOS DISPONÍVEIS" para que a IA possa orientar o associado.
// - Mantenha linguagem simples — este conteúdo é explicado ao usuário final.
// =============================================================================

DOCS.push({
  id: 'app_funcionalidades',
  title: 'Funcionalidades do App UNASLAF e Canais de Atendimento',
  category: 'app',
  content: `GUIA DO APP UNASLAF — ATENDENTE VIRTUAL DO ASSOCIADO

O App UNASLAF é o sistema digital da associação, acessível pelo navegador
em computador ou celular.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANAIS DE ATENDIMENTO UNASLAF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Este chat (atendimento imediato via IA — disponível neste app)
- Site oficial: https://unaslaf.org.br
- E-mail geral: unaslaf@unaslaf.org.br
- Jurídico: juridico@unaslaf.org.br
- Sede: SCN-Qd.6-Bloco A, Ed. Venâncio 3000, 4º andar, salas 413/414, Brasília-DF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMO ACESSAR O APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Acesse o link do app no navegador (celular ou computador).
- Informe seu CPF cadastrado na UNASLAF (com ou sem pontuação).
- Se o CPF estiver cadastrado, o acesso é liberado automaticamente.
- Não há senha — o CPF é a chave de acesso.
- Se o CPF não for reconhecido: entre em contato pelo site unaslaf.org.br.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TELA 1 — ATENDIMENTO (este chat)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Canal de atendimento imediato via inteligência artificial.
- Responde dúvidas sobre estatuto, ações coletivas, ADI 4151,
  portarias, filiação, direitos dos associados e funcionamento do app.
- Atalhos rápidos (chips): botões com os temas mais consultados.
- As respostas têm caráter orientativo. Para situações individuais
  ou jurídicas: juridico@unaslaf.org.br

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TELA 2 — MEU CADASTRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Permite visualizar e atualizar dados cadastrais.
- Campos editáveis: Nome, Aposentado (Sim/Não), E-mail,
  Telefone/WhatsApp, Logradouro, Número, Complemento,
  Bairro, Cidade, CEP, UF.
- Campos somente leitura (não alteráveis pelo associado): CPF e SIAPE.
- Obrigatórios para salvar: Nome, E-mail e Telefone.
- Campos opcionais vazios não apagam dados já existentes.
- Toda alteração é registrada com data e hora no histórico interno.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TELA 3 — DOCUMENTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Repositório de documentos oficiais da UNASLAF para download.
- Busca por nome ou filtro por categoria.
- Categorias: Filiação, Desfiliação, Procuração, Requerimentos,
  Formulários, Geral.
- Para baixar: clique em "Baixar" ao lado do documento.
- Documentos atualizados automaticamente quando a UNASLAF
  adiciona novos arquivos — sem necessidade de atualizar o app.

DOCUMENTOS DISPONÍVEIS PARA DOWNLOAD NO APP:
Os documentos estão na tela "Documentos" do app e podem ser enviados diretamente
no chat quando o associado solicitar. Para enviar no chat, use o bloco:
[DOCUMENTO:nome-exato-do-arquivo.pdf]

Arquivos típicos disponíveis (confirme os nomes na tela Documentos):
- Ficha de Filiação → [DOCUMENTO:Ficha de Filiação.pdf]
- Formulário de Desfiliação → [DOCUMENTO:Desfiliação.pdf]
- Procuração → [DOCUMENTO:Procuração.pdf]
- Requerimentos → [DOCUMENTO:Requerimento.pdf]

IMPORTANTE: use o nome mais próximo ao que estiver no repositório.
Se o nome exato não for conhecido, oriente o associado a buscar na tela Documentos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Acesso restrito a associados com CPF cadastrado.
- Comunicações criptografadas (HTTPS).
- Sessão expira automaticamente após 8 horas.
- Histórico de alterações cadastrais registrado internamente.
`
});



function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s.%/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(query = '') {
  const normalized = normalizeText(query);
  return normalized
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['para', 'com', 'uma', 'das', 'dos', 'que', 'por', 'mais', 'sobre', 'qual', 'quais', 'tenho', 'direito'].includes(w));
}

export function isIndividualLookup(query = '') {
  const q = String(query);
  const hasCPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(q);
  const hasSIAPE = /\b(?:siape|matr[ií]cula)\b/i.test(q);
  const individualTerms = /\b(eu|meu|minha|meus|minhas|estou|consto|lista|cpf|siape|matr[ií]cula)\b/i.test(q);
  return hasCPF || hasSIAPE || individualTerms;
}

export function findRelevantDocs(query, maxDocs = 8, options = {}) {
  const kws = extractKeywords(query);
  const allowInternalLists = Boolean(options.allowInternalLists);
  const includeInternal = allowInternalLists && isIndividualLookup(query);

  const eligibleDocs = DOCS.filter(doc => {
    const isInternalList = String(doc.category || '').startsWith('lista_') || String(doc.id || '').startsWith('lista_');
    return includeInternal || !isInternalList;
  });

  if (!kws.length) return eligibleDocs.slice(0, maxDocs);

  return eligibleDocs
    .map(doc => {
      const title = normalizeText(doc.title);
      const category = normalizeText(doc.category);
      const content = normalizeText(doc.content);
      const haystack = `${title} ${category} ${content}`;

      let score = 0;
      for (const kw of kws) {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = haystack.match(new RegExp(escaped, 'g'));
        const count = matches ? matches.length : 0;
        score += count;
        if (title.includes(kw)) score += 8;
        if (category.includes(kw)) score += 5;
      }

      // Prioridades temáticas usuais da UNASLAF
      if (/adi|4151|tecnico|analista|seguro social|transformacao|portaria/i.test(query) && doc.category === 'adi_4151') score += 20;
      if (/acao|processo|coletiva|pasep|auxilio|paridade|abono|licenca|geap|fronteira/i.test(query) && String(doc.category).includes('acoes')) score += 10;
      if (/estatuto|associado|mensalidade|assembleia|eleicao|diretoria/i.test(query) && ['estatuto', 'regimento_eleitoral'].includes(doc.category)) score += 10;

      return { doc, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDocs)
    .map(s => s.doc);
}

export function buildContextString(docs = DOCS) {
  return docs.map(d => `===== ${String(d.title).toUpperCase()} =====\n${d.content}`).join('\n\n');
}

export { DOCS };

// =============================================================================
// context-static.js — Base de Conhecimento da UNASLAF
// =============================================================================
// COMO USAR ESTE ARQUIVO:
// Cada bloco DOCS.push({...}) é um "documento" temático que a IA usa para
// responder perguntas. Para editar um conteúdo, localize o bloco pelo
// comentário de seção e edite apenas o campo `content` entre as crases (` `).
//
// ESTRUTURA DE CADA DOCUMENTO:
//   id:       identificador único (não alterar)
//   title:    título descritivo
//   category: categoria temática
//   content:  o conteúdo em si — é aqui que você edita
//
// PARA ADICIONAR UM NOVO DOCUMENTO, copie o modelo abaixo e cole no final:
//   DOCS.push({ id:'meu_doc', title:'Título do Documento', category:'categoria', content:`
//     Conteúdo aqui...
//   ` });
// =============================================================================


// =============================================================================
// SEÇÃO 1 — REGRAS E INSTRUÇÕES DO AGENTE DE IA
// =============================================================================
// Este documento define o comportamento da IA: como ela deve responder,
// o que pode e não pode dizer, e quais são as prioridades de atendimento.
// Edite aqui caso queira mudar o perfil ou tom do atendente virtual.
// =============================================================================



DOCS.push({ id:'duvidas recorrentes', title:'Título do Documento', category:'categoria', content:`
     

Dúvidas Recorrentes dos Associados
Nomenclatura
Como está o andamento do processo de nomenclatura?
 Para a resposta individual, importante salientar que o processo de nomenclatura está dividido em duas situações:
 - Associados que não estão incluídos na ação de execução;
 - Associados que não estão incluídos na ação de conhecimento.
 
PIS/PASEP
Como está o andamento do processo do PIS/PASEP? Qual foi a sentença do juiz?
 O processo foi julgado desfavoravelmente porque...
Como será o procedimento para que os associados entrem individualmente com a mesma ação?



GEAP
A Unaslaf possui algum desconto ou benefício para associados na GEAP?
Não.
 
Acesso Restrito ao Site
Não consigo acessar a área restrita do site. O que devo fazer?
 Favor entrar em contato por meio do WhatsApp (61) 98107-0691, onde o acesso será restabelecido.
Mensalidade
O desconto da mensalidade não está sendo feito na minha folha de pagamento. Como autorizar?
 O associado deve providenciar a autorização de desconto pelo SouGov.
 
PASSO A PASSO PARA HABILITAR DESCONTO EM FOLHA, PELO APLICATIVO SOUGOV.BR 
1º) Para autorizar o desconto em sua folha de pagamento (contracheque), clique em “Consignação”, depois em “Outras Consignações Descontadas em Folha” e, em seguida, “Autorizar Desconto em Folha”:
2º) Clique na setinha ao lado de “Selecione o tipo de consignação” para escolher o desconto que você deseja autorizar em sua folha de pagamento (contracheque):
3º) Selecione o tipo de consignação: “Facultativa 35% - Demais” e depois clique em “Autorizar”. Leia as informações da autorização gerada e, caso esteja tudo certo, você pode “Confirmar” ou “Desistir”:
4º) No campo “Consignatário”, pesquisar pelo nome da associação: "ASSOCIACAO NACIONAL DOS SERVIDORES DA EXTINTA SECRETARI..." Logo em seguida, clique em “Autorizar” e se estiver tudo correto, em “Confirmar”.
 
Não tenho margem consignável ou não quero autorizar desconto em folha. Como posso pagar?
 O pagamento das mensalidades pode ser realizado via transferência bancária ou PIX. A mensalidade deverá ser transferida até todo dia 10.
Dados bancários da Unaslaf:
Banco: Banco do Brasil
 Agência: 0452-9
 Conta Corrente: 201049-6
 PIX (CNPJ): 73.369.795/0001-83
 Razão Social: Associação Nacional dos Servidores da Secretaria da Receita Previdenciária
Termos de Compromisso
Quanto devo para a Unaslaf com base nos termos de compromisso?
 Os valores devidos variam conforme a situação individual de cada associado.
Quando preciso realizar o pagamento?
 A Unaslaf irá instruir os associados sobre os prazos e a forma de pagamento assim que houver definição e organização do procedimento.

Envio de comprovantes de pagamento
Para qual meio devo enviar o comprovante de pagamento da mensalidade/chamada extra?
O comprovante de pagamento da mensalidade deve ser enviado para o e-mail: comprovante@unaslaf.org.br 
     
   ` });




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


// =============================================================================
// SEÇÃO 2 — INFORMAÇÕES INSTITUCIONAIS DA UNASLAF
// =============================================================================
// Estatuto e regimento eleitoral da entidade.
// Atualize aqui caso haja mudanças estatutárias ou no processo eleitoral.
// =============================================================================

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
- Defender a democracia, as liberdades individuais e coletivas,
  o Estado Democrático de Direito e os direitos humanos.
- Propor medidas e requerimentos às autoridades administrativas e judiciais.

3. QUEM PODE SER ASSOCIADO
- Associado natural: servidor que estava em efetivo exercício na Secretaria
  da Receita Previdenciária em 16/03/2007.
- Associado participante: pensionista dos servidores acima indicados.
- NÃO podem associar-se os ocupantes do cargo de Auditor-Fiscal da Previdência Social.

4. DIREITOS DOS ASSOCIADOS
- Participar das Convenções Nacionais e votar/ser votado nas eleições.
- Frequentar a sede e gozar dos serviços e benefícios da entidade.
- Apresentar propostas e recorrer de atos que entendam lesivos a seus direitos.

5. DEVERES DOS ASSOCIADOS
- Cumprir as normas do Estatuto e pagar mensalidades regularmente.
- Zelar pela imagem da UNASLAF e tratar dirigentes com respeito e urbanidade.

6. SANÇÕES DISCIPLINARES
- Advertência, multa (até 5x a mensalidade), perda de mandato e exclusão.
- Prazo de apuração: 30 dias, prorrogável por igual período.
- Da decisão cabe recurso em 5 dias ao Conselho Executivo.

7. ORGANIZAÇÃO DA UNASLAF
- Órgãos: Assembleia Geral (máxima autoridade), Conselho Executivo,
  Conselho Fiscal e Conselho de Ética.
- Conselho Executivo: Presidente, Vice-Presidente, Diretores de Finanças,
  Política de Classe, Comunicação, Jurídico, Parlamentar e Inativos.

8. RECEITA E ORÇAMENTO
- Receita: contribuições mensais, rendas de convênios, doações, subvenções.
- Orçamento anual elaborado pelo Conselho Executivo.`
});

DOCS.push({
  id: 'regimento',
  title: 'Regimento Assembleias Processo Eleitoral',
  category: 'regimento_eleitoral',
  content: `REGIMENTO DAS ASSEMBLEIAS E DO PROCESSO ELEITORAL

1. ASSEMBLEIAS
- Deliberações por voto dos associados naturais.
- Delegados estaduais: 1 por 30 associados ou fração, mínimo 1 por Estado.

2. ELEIÇÕES — REGRAS GERAIS
- Realizadas com antecedência mínima de 30 dias antes do fim do mandato.
- Convocadas pelo Presidente por edital com antecedência mínima de 60 dias.
- Edital publicado no site oficial.

3. ELEGIBILIDADE
São elegíveis os associados naturais que:
  a) preencham condições estatutárias
  b) não incorram em impedimentos expressos no regimento
  c) estejam filiados à UNASLAF por pelo menos 3 anos
  d) participem de chapa completa registrada

4. ELEITOR
- Associado natural em pleno gozo dos direitos sociais e quite com mensalidades
  na data da publicação do edital.

5. VOTO
- Individual, secreto, direto e qualificado.
- Pode ser realizado por cédula ou sistema eletrônico/correio.

6. INSCRIÇÃO DE CHAPAS
- Prazo: 20 dias da publicação do edital.
- Comissão Eleitoral conduz votação, apuração e proclamação do resultado.

7. IMPUGNAÇÕES E RECURSOS
- Impugnação: 3 dias da publicação da relação de chapas registradas.
- Recurso: 10 dias da divulgação oficial do resultado.

8. APURAÇÃO E POSSE
- Maioria simples de votos elege a chapa.
- Empate: nova votação entre as chapas empatadas.
- Posse: até o último dia útil do mandato da diretoria em exercício.`
});


// =============================================================================
// SEÇÃO 3 — ADI 4151 (AÇÃO MAIS IMPORTANTE DA UNASLAF)
// =============================================================================
// A ADI 4151 é a principal ação da entidade. Atualiza o histórico abaixo
// sempre que houver nova movimentação no STF ou nova portaria administrativa.
// =============================================================================



// =============================================================================
// SEÇÃO 4 — PORTARIAS DE ENQUADRAMENTO
// =============================================================================
// Portarias que formalizaram o enquadramento dos servidores após a ADI 4151.
// Portaria 7.243/2022: Analistas ATIVOS
// Portaria 9.546/2022: Analistas APOSENTADOS e INSTITUIDORES DE PENSÃO
// =============================================================================

DOCS.push({
  id: 'portaria_7243',
  title: 'Portaria 7243 2022 Analistas Ativos',
  category: 'portarias_enquadramento',
  content: `PORTARIA 7.243/2022 – ANALISTAS DO SEGURO SOCIAL ATIVOS

PORTARIA DE PESSOAL DGP/SGC/SE/ME Nº 7.243, DE 28 DE JUNHO DE 2022

Art. 1º Enquadrar no cargo de Analista Tributário da Receita Federal do Brasil,
Classe S, Padrão III, da Carreira Tributária e Aduaneira da RFB, os servidores
elencados no anexo desta portaria, os quais atualmente ocupam o cargo de
Analista do Seguro Social, com efeitos a contar de 7 de abril de 2022.

USO PARA ATENDIMENTO:
Consultar por matrícula SIAPE ou nome para verificação individual.
Não divulgar lista completa em atendimento aberto.

LISTA DE ANALISTAS ENQUADRADOS (SIAPE | NOME):
1376007 ADEMIR MIGUEL | 1376019 ADRIANA SATIE OSHIRO | 1378392 ADRIANA SQUERICH STANIECKI | 1451804 ADRIANO KISHIMOTO | 1375281 AILTON DE MELO MESSIAS JUNIOR | 1444748 ALECSANDRA FRANCO DE MELO | 1375125 ALEXANDRE CREMER | 1449803 ALEXANDRE DE LIMA E SILVA | 1376114 ALOISIO BARBOSA CAMPOS | 1451877 ANA CATARINA DE LUCENA | 1440179 ANA KARLA JALES DANTAS | 1379056 ANDERSON JACO MARAN | 1453527 ANDERSON JOSE RIBEIRO SALEME | 1374985 ANDRE GIORDANI SANTOS SILVA | 1453000 ANDREA GRANGEIRO GOMES LEITAO | 1432129 ANDREIA CRISTINA MARQUES OTERO | 1441776 ANGELA BOSSO FARIA BRITO | 1378136 ANGELA REGINA FERNANDES PAVANI | 1450553 ANTONIO CARLOS ROCHA MOREIRA | 1380487 ANTONIO VENANCIO CARDOSO | 1418325 BENARDETE MARIA TOMAZI | 1450030 CARINE GISELE HANKE | 1418718 CARLOS ROBERTO THOME | 1450005 CAROLINA SCIAMARELLI RELA | 1377645 CAROLINA VIVAN CARVALHO | 1379061 CECILIO FELINTO DE OLIVEIRA NETO | 1376613 CELIA MARIA SANCHES LOURINHO QUEIROZ | 1375992 CESAR CARLOS RIBEIRO | 1375953 CHARLES ARAUJO | 1450819 CLAUDIR CORREA LEMOS | 1377932 CLEY ANDERSON DE FREITAS BITTENCOURT | 1376370 CRISTIANE WEIS | 1376424 DAISY LUCI RIBEIRO DE ARAGAO HEREDA | 1378511 DANIEL DE OLIVEIRA LEMOS | 1446246 DANIEL TANIGUCHI | 1376972 DANIELA BARROSO COSTA BADARO | 1351009 DANIELA GODOY DE VASCONCELLOS | 1377227 DANIELE MAIA TOURAO | 1380134 DANNIELLI DONINI CAMPOLIM | 1376218 DENISE MARTINEZ GONCALVES | 1435325 DIEGO MARTINES SENGER | 1376661 DORIS BECK PAMPLONA SOARES | 1378508 EDIMAR RIBEIRO AMORIM | 1432850 EDUARDO SANTOS FELISMINO | 1451654 EDVAN TEIXEIRA DE SOUSA | 1450471 ELIZABETH AURELIA DE ANTONI | 1376652 ELZA HELENA MARTINS FONTANA | 1450248 EMANUELLE SILVA PEDREIRA | 1442793 EMILIA MARIA DE SANTANA | 1379914 ENEDINA PINHEIRO SIMAO AZEVEDO | 1452771 EVERSON JAIR CASAGRANDE MOREIRA | 1377393 FABIANA CRISTINA DE MELLO | 1420697 FABIANA DE TONI MARQUES DE OLIVEIRA | 1361701 FABIO DOS ANJOS BARBOSA | 1426182 FERNANDA MION CRUZ | 1376198 FLAVIA MARIA RUBACK CASCARDO DE ALMEIDA | 1450017 FLAVIA SILVA BARBOSA | 1418658 FLAVIA TAZINAFFO RODRIGUES DE FARIA | 1375911 FLAVIANA DE CARVALHO CHAVES DUTRA | 1098434 FRANCISCO VALDILEME RIBEIRO MOTA | 1450205 GEIZA CELESTE DA SILVA ASSUNCAO | 1379286 GEORGE CAVALCANTI CAMELO | 1380280 GLACYELLE BECE SIMOES GAHIVA | 1380819 GRAZIELA PIMENTEL | 1376846 GRAZIELLE DA HORA BARAUNA | 1420286 GUILHERME BRUNOW NOGUEIRA | 1377428 HELMUT FERNANDO ROLKE | 1379742 ISABELA DE SA BEZ GRAHL | 1437745 ISABELE CRISTINA BARBERO PERES BALDISERA | 1449804 IVANI DAS GRACAS DAL PRA LAZAROTTO | 1376741 JACKELINE NUNES DA SILVA | 1418142 JEFERSON BARBOSA BARRIONUEVO | 1425198 JOANA DARC DOS SANTOS NASCIMENTO | 1379502 JOAO DE SOUSA MOTA NETO | 1450969 JORGE PEDRO BANDEIRA DORES | 1418737 JOSE ANTONIO BAPTISTA DE ABREU | 1452346 JOSE DONIZETE DE PAULA | 1376319 JOSE TAIRONE RODRIGUES DA SILVA | 1375290 JOSILENE GIOVANA IDALGO BALBINO BELFORT | 1376388 JULIANA FIASCHI DOTTO | 1452721 JULIANA WOHLGEMUTH FLEURY VELOSO DA SILVEIRA | 1285610 JULIANO BATISTA BOHNERT | 1418477 KAMILLE MARIA CORDEIRO FERNANDES | 1378816 KARINA CRESTANI DE SOUZA MEGALE | 1378853 KARINA MARANHA | 1379690 KIYOKA YONEYA GENDA | 1377433 KLEBER MOURA DO NASCIMENTO | 1450047 LECI MARTINS BARBOSA | 1377136 LILIAN CRISTINA SALDANHA | 1377983 LUCIANA APARECIDA DA SILVA | 1452965 LUCIANA TREVENZOLI VALLE | 1450910 LUCIANE DE FATIMA SOUZA DA SILVA | 1451162 LUIZ ANTONIO TELO | 1380193 LUIZ HENRIQUE VILLAR GUIMARAES | 0941679 LUIZA HELENA ULIANO | 1377115 MAGALI APARECIDA FLORENCIO RAZERA | 1377036 MARCELO DOMINGUES LEMOS | 1451223 MARCELO GOMES DA SILVA | 1378916 MARCELO MORGANTE | 0910657 MARCO ANTONIO FIGUEIREDO | 1453823 MARCOS SOUZA OLIVEIRA | 1376715 MARIA FERNANDA VASQUES LESSA | 1374992 MARIA JOSE SOUZA DE MOURA | 0933763 MARIA PERPETUO SOCORRO NOVAES SOUTO | 1377330 MARIA SALETE COSTA | 1376204 MARLEY FERNANDA ARAUJO RABELLO MEDINA | 1377838 MARTHA DE CARVALHO BRESSER DORES | 1378351 MARTHA FRANCA CAMARA | 1449864 MAURA RIGON MACHADO | 1440123 MICHELE NAIRA SALOMAO | 1420132 MILTON NOBUHIRO ITAGAKI | 1377500 MURILO VIOLA | 1450113 NAIR SANAE KIYOTA | 1377945 NANCY YARA GRILLI | 1378934 NELSON PEREIRA VILASBOAS | 1418392 ODAMIR FEITOSA DE SA FILHO | 1375364 OLGA MARIA CARDOSO DE SOUZA | 1443462 OSCAR FERNANDO DE MATTOS FILHO | 1445465 OSVALDO YOSHIHARU HIRAMA | 1446275 PATRICIA CINTIA MACHADO | 1375940 PRISCILA NUBIA DA SILVA | 1445723 RAQUEL CRISTINA DARONCO RADIS | 1449868 RENATA APARECIDA AGUIAR DA SILVA | 1450637 RENATA PESTILHO SENNA | 1376654 RITA MARIA CRUZ FREITAS | 1379224 ROBSON RODRIGUES MACHADO | 1377461 ROCICLENE DE ALMEIDA BARBOSA | 1377068 RODRIGO TELLES CORREIA DAS NEVES | 1375787 RODRIGO VARELLA DOTTO | 1374682 ROMERO MOREIRA PIMENTEL | 1420811 RONI RODRIGUES DE SOUZA | 1418778 ROSANGELA SANTOS PEREIRA SILVA | 1460236 RUTILEIA DE SOUSA AGUIAR | 1420986 SABURO MORIYA | 1451188 SAMANTHA MARA BROCCO SILVA CARDOSO | 1418201 SAMANTHA SILVEIRA CORREA DE MELO | 1376306 SANDRA ALVES CRUZ MENDONCA | 1420765 SANDRA SILVA ACRAS | 1375822 SANDRO NERY DORTAS MONTARGIL | 1378514 SERGIO LUIS DA SILVA | 1451392 SERGIO LUIZ HAGEMANN | 1376777 SIMONE APARECIDA DE OLIVEIRA BUENO | 1452575 SIMONE CRISTINA VALENTIM DE PAULA BARRETO | 1450989 SOLANGE APARECIDA VIANNA CARECHO | 1375736 TATIANA FLORAO CORREA | 1450461 TERENCE FERNANDEZ XAVIER | 1376906 THELMA COLOMBO BOLLA | 1451482 TIAGO DE CASTRO RUBIATTI | 1377298 VALNI DE SOUZA | 1379182 VICENTE ARAUJO DE SOUZA VERAS NETO | 1376103 WILLIAN ANDRADE SERAFIM | 1377600 WOLFGANG ADOLFO FIEDLER`
});

DOCS.push({
  id: 'portaria_9546',
  title: 'Portaria 9546 2022 Aposentados Pensionistas',
  category: 'portarias_enquadramento',
  content: `PORTARIA 9.546/2022 – ANALISTAS APOSENTADOS E INSTITUIDORES DE PENSÃO

PORTARIA DE PESSOAL DGP/SGC/SE/ME Nº 9.546, DE 19 DE AGOSTO DE 2022

Art. 1º Enquadrar os servidores aposentados e instituidores de pensão
ocupantes do cargo de Analista do Seguro Social, no cargo de Analista
Tributário da Receita Federal do Brasil, nas respectivas Classes e Padrões,
com efeitos a partir de 7 de abril de 2022.

USO PARA ATENDIMENTO:
Verificação individual por nome ou SIAPE. Não divulgar lista em atendimento aberto.

LISTA DE ENQUADRADOS (Nome | SIAPE | Situação | Classe):
AUREA JI | 1450874 | APOSENTADO | S-II
CARLOS HENRIQUE DOS SANTOS E SILVA | 1376078 | INSTITUIDOR PENSÃO | S-II
DANIELA MACHADO GOMES | 1440223 | INSTITUIDOR PENSÃO | 2-III
EUCLIMAR SOARES DE LIMA | 1077611 | APOSENTADO | S-II
FLAVIO LUIZ SOARES PIRES | 0925771 | APOSENTADO | S-III
HELENA ALVES DA SILVA | 1376818 | APOSENTADO | S-III
IVAN FIEDORUK | 1376184 | INSTITUIDOR PENSÃO | S-II
JAN JANECZEK | 1375918 | APOSENTADO | S-II
JERONIMO SILVA DE SOUZA | 0941532 | APOSENTADO | S-III
JORGE BEZERRA DOS SANTOS | 1378760 | APOSENTADO | S-III
JOSE OVIDIO CORREIA | 1375786 | APOSENTADO | S-I
LUIZ MIRANDA DA SILVA NETO | 1326888 | APOSENTADO | S-II
MARIA LUCIA PAGLIUSI SILVA | 1376299 | APOSENTADO | 1-III
MARISA HELENA FERREIRA | 1450052 | APOSENTADO | S-II
MAURA BAPTISTA DE AZEVEDO | 0913499 | APOSENTADO | S-II
NAOMI OTSUKI ITANO | 1376833 | APOSENTADO | S-III
PATRICIA LUCAS GULARTE | 1364437 | INSTITUIDOR PENSÃO | 1-II
PAULO AKIRA TUTIYA | 1380777 | INSTITUIDOR PENSÃO | S-II
PEDRO AUGUSTO RAMOS | 1450455 | APOSENTADO | S-III
PEDRO DE OLIVEIRA FILHO | 1376607 | APOSENTADO | S-II
ROBERTO MENDES DE LIRIO | 1418759 | APOSENTADO | 1-II
SHEILA MONIQUE SOUTO LEITE NAJAR | 0753562 | APOSENTADO | S-III`
});


// =============================================================================
// SEÇÃO 5 — AÇÕES COLETIVAS
// =============================================================================
// Índice geral + detalhes de cada uma das 15 ações coletivas.
// Atualize o status de cada ação quando houver nova movimentação processual.
// Para adicionar nova ação: copie o modelo de qualquer acao_XX e altere o id.
// =============================================================================




// =============================================================================
// SEÇÃO 6 — TABELA COMPLETA DE PROCESSOS (TODOS OS ESCRITÓRIOS)
// =============================================================================
// Lista todos os 38 processos da UNASLAF, por escritório.
// Atualizada em maio/2026. Edite aqui quando houver novos processos ou
// quando o status de um processo mudar.
// =============================================================================

DOCS.push({
  id: 'processos_completo',
  title: 'Tabela Completa de Processos UNASLAF',
  category: 'processos_acoes',
  content: `TABELA COMPLETA DE PROCESSOS – UNASLAF
Atualizado: Maio/2026 | Total: 38 processos/ações

=== EQUIPE INTERNA ===
ADI 4151 | STF | Em andamento | Todos os associados

=== MOTA ADVOGADOS ===
0727740-19.2020.8.07.0001 | TJDF 24ª Vara | 31/08/2020 | IMPROCEDENTE (mar/2026) | PASEP | Lista específica
1004692-44.2020.4.01.3400 | JFDF 6ª Vara | 29/01/2020 | Em andamento | Auxílio Transporte Coletiva | Rol de associados
1015579-87.2020.4.01.3400 | JFDF 4ª Vara | 19/03/2020 | ARQUIVADO DEFINITIVAMENTE | MS/COVID-19 | Rol de associados
1019847-53.2021.4.01.3400 | JFDF 6ª Vara | 08/04/2021 | VITÓRIA EM APELAÇÃO | Abono de Permanência | Rol de associados
1023229-54.2021.4.01.3400 | JFDF 2ª Vara | 26/04/2021 | Em andamento | Paridade | Rol de associados
1074276-67.2021.4.01.3400 | JFDF 8ª Vara | 19/10/2021 | Em andamento | Licença Prêmio em Pecúnia | Rol de associados
1079393-39.2021.4.01.3400 | JFDF 5ª Vara | 09/11/2021 | VITÓRIA — TJ 16/05/2022 | IR sobre Auxílio-Creche | Rol de associados
1080942-84.2021.4.01.3400 | JFDF 3ª Vara | 16/11/2021 | AI 1036859-27.2023 | Quota Participação Auxílio Creche | Rol de associados
1084980-42.2021.4.01.3400 | JFDF 17ª Vara | 01/12/2021 | Em andamento | Dobra do Teto Contribuição | Rol de associados
5024330-86.2020.4.03.6100 | JFSP 17ª Vara | - | Em andamento | Reposição ao Erário | Lista específica
0061254-90.1997.4.03.6100 | JFSP 4ª Vara | - | Em andamento | Reajuste 28,86% (Lei 8.627/93) | Lista específica
970025637-5 | JFRS 6ª Vara | - | ARQUIVADO | 28,86% | Lista específica
0031048-60.2001.4.01.3400 | JFDF 15ª Vara | - | ARQUIVADO | 28,86% | Lista específica
38782-33.1999.4.01.34.00 | JFSP 4ª Vara | - | ARQUIVADO | 28,86% | Lista específica
8426-69.2010.4.01.3400 | JFDF | - | Em andamento | Averbação/Cômputo Tempo Especial | -
1022299-41.2018.4.01.3400 | JFDF 22ª Vara | - | Em andamento | Adicional de Fronteira | -
1024043-71.2018.4.01.3400 | JFDF 2ª Vara | - | Em andamento | IN 02/2018 Jornada/Abono Ponto | -
0727196-31.2020.8.07.0001 | JFDF 21ª Vara | - | Em andamento | Danos Materiais GEAP | Rol de associados
1007732-68.2019.4.01.3400 | JFDF 6ª Vara | - | Em andamento | MP 873/2019 | Diretores UNASLAF
1009517-65.2019.4.01.3400 | JFDF 22ª Vara | - | Em andamento | Auxílio Transporte Grupo Específico | -
2005.71.00.020255-3 | JFRS | - | Em andamento | Execução Sentença 97.00.023625-0/RS | Lucia Trindade de Souza, Nair Rost de Borba, Ines Irene Brugnera Castelli (excluída)
5002118-66.2011.4.04.7100 | JFRS | - | Em andamento | Execução Sentença 97.00.023625-0/RS | Amadeu Fabre Neto (excluído), Célia Arndt Gomes, Celso Scheffer Salles, Domingos Adão Davila, José Luis Dellagnere Fenoy, Leni Amir Perone (excluída), Maria Alice Nicolini, Maria Dora Ferreira Medeiros, Maria Isabel Radaelli Duarte, Maria Thereza Correa da Silva, Nair Rost de Borba
5002121-21.2011.4.04.7100 | JFRS | - | ARQUIVADO | Embargos de Execução | -
5005264-18.2011.4.04.7100 | JFRS | - | ARQUIVADO | Embargos de Execução | -
5053568-38.2017.4.04.7100 | JFRS | - | Em andamento | Execução Sentença 97.00.023625-0/RS | Doris Silva Veiga, Eni Terezinha Barbosa de Araújo, Iara Beatriz dos Santos Correa, Ivani Baptista dos Santos, Maria de Fátima Gatto Tosin, Osmar Nunes de Freitas (excluído), Rosaura Maria Silveira Vieira, Rute Pacheco Borges

=== RAPHAEL MALINVERNI ===
0055884-14.2012.4.01.3400 | JFDF 1ª Vara | 13/11/2012 | Em andamento | Transformação Cargo Analista Tributário | Lista específica
0005911-80.2018.4.01.3400 | JFDF 7ª Vara | - | Em andamento | Execução Provisória 1 — Nomenclatura | Lista específica
0012872-86.2008.4.01.3400 | JFDF 7ª Vara | 22/04/2008 | Em andamento | Correção Nomenclatura | Lista específica
0020259-84.2010.4.01.3400 | JFDF 22ª Vara | 27/04/2010 | Em andamento | Descontos INSS sobre Terço de Férias | -
0038104-37.2007.4.01.3400 | JFDF 16ª Vara | 29/10/2007 | ARQUIVADO | Suspensão Prazo Retorno INSS | -
1018458-28.2024.4.01.3400 | JFDF 7ª Vara | 21/03/2024 | Em andamento | Execução Provisória 2 — Nomenclatura | Lista específica
0036028-35.2010.4.01.3400 | JFDF 9ª Vara | - | Em andamento | Exclusão do PECFAZ | -
1098257-23.2024.4.01.3400 | JFDF 7ª Vara | 03/12/2024 | Em andamento | Segunda Correção Nomenclatura | Lista específica
0031897-85.2008.4.01.3400 | - | - | Em andamento | Suspensão Art. 256-A PECFAZ | -
1014667-95.2026.4.01.0000 | TRF1 | 20/04/2026 | Em andamento | Agravo de Instrumento — MS 1021420-53.2026 — Portaria DGP/SSC/MGI 1.985/2026 | Lista específica: ALDO ROEDEL 309.039.719-68; EDUARDO ROBERTO TORRIERI 206.956.248-49; GLAUCIA DA SILVA CORLAITE 046.427.396-02; JOÃO ALVES DO SANTOS 721.929.338-00; JULIA MARIA THEREZA MURBACK 067.768.948-92; MARIANA THEREZA MURBACK 431.217.398-24; MARCIA MACHADO DE FREITAS 382.441.876-20; MARIA CRISTINA DE CARVALHO 004.823.298-07; MARILDA ANTONIA DE FREITAS PERUSSO 056.460.788-65; MILCIO DE FREITAS BAHIA 296.272.147-87; NEUSA BEATRIZ NOGUEIRA 480.454.460-72; REGINA PEREIRA DE FREITAS KLEIN 607.779.829-00; SUELI MOREIRA PINTO 066.123.708-74
1021420-53.2026.4.01.3400 | JFDF 18ª Vara Federal | 04/03/2026 | Em andamento | Mandado de Segurança — Portaria DGP/SSC/MGI 1.985/2026 | Lista específica: ALDO ROEDEL 309.039.719-68; EDUARDO ROBERTO TORRIERI 206.956.248-49; GLAUCIA DA SILVA CORLAITE 046.427.396-02; JOÃO ALVES DO SANTOS 721.929.338-00; JULIA MARIA THEREZA MURBACK 067.768.948-92; MARIANA THEREZA MURBACK 431.217.398-24; MARCIA MACHADO DE FREITAS 382.441.876-20; MARIA CRISTINA DE CARVALHO 004.823.298-07; MARILDA ANTONIA DE FREITAS PERUSSO 056.460.788-65; MILCIO DE FREITAS BAHIA 296.272.147-87; NEUSA BEATRIZ NOGUEIRA 480.454.460-72; REGINA PEREIRA DE FREITAS KLEIN 607.779.829-00; SUELI MOREIRA PINTO 066.123.708-74`
});


// =============================================================================
// SEÇÃO 7 — LISTAS DE ASSOCIADOS (USO INTERNO — NÃO DIVULGAR)
// =============================================================================
// Listas para verificação individual por CPF ou nome em atendimento autenticado.
// A IA NÃO deve exibir estas listas completas ao usuário final.
// =============================================================================




// =============================================================================
// FIM DO ARQUIVO
// Para adicionar novo documento, insira acima desta linha:
// DOCS.push({ id:'novo_id', title:'Título', category:'categoria', content:`conteúdo` });
// =============================================================================
