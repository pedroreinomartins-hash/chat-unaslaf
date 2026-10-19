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

# BASE DE CONHECIMENTO — AÇÕES JUDICIAIS DA UNASLAF

**Documento de contexto para assistente virtual (chatbot)**
Elaborado pela Diretoria Jurídica da UNASLAF · Posição em 19 de outubro de 2026

---

## 0. INSTRUÇÕES DE USO PARA O ASSISTENTE

1. Este documento é a fonte oficial do assistente sobre as ações judiciais da UNASLAF (Associação Nacional dos Servidores da Extinta Secretaria da Receita Previdenciária). Responda somente com base no que está aqui. Se a informação não constar, diga que não dispõe do dado e oriente o associado a procurar a Diretoria Jurídica da UNASLAF.
2. **Datas das situações.** Cada ação traz a data da última informação disponível. Ao responder, informe sempre essa data ("segundo a última atualização disponível, de julho de 2023…"). Nunca apresente como atual uma situação antiga, nem invente andamento.
3. **Proteção de dados (LGPD).** Não informe nomes, CPFs ou dados pessoais de beneficiários de nenhuma ação. Se alguém perguntar se uma pessoa determinada é beneficiária de uma ação, responda que a confirmação individual é feita apenas pela Diretoria Jurídica ou pelo escritório responsável, mediante identificação do associado.
4. **Não preste consultoria individual.** O assistente informa o objeto e o andamento das ações coletivas, mas não afirma que um associado específico tem direito a valores, nem estima quantias, prazos de pagamento ou resultados.
5. **"Rol de associados" e "lista específica".** Nas ações em que a UNASLAF atua em favor de todos os associados (rol de associados), a abrangência depende da condição de associado e dos critérios da própria decisão. Nas ações de "lista específica", só são alcançados os associados indicados nominalmente no processo.
6. Linguagem: português claro, cordial e objetivo. Evite juridiquês desnecessário; quando usar termo técnico, explique-o em uma frase.

---

## 1. VISÃO GERAL

- A UNASLAF representa judicialmente servidores ativos, aposentados e pensionistas oriundos da extinta Secretaria da Receita Previdenciária (SRP), redistribuídos à Receita Federal do Brasil (RFB) pela Lei nº 11.457/2007, entre eles Analistas e Técnicos do Seguro Social.
- A carteira de ações compreende 38 processos (ver Quadro Geral, seção 1-A), divididos entre:
  - a **ADI nº 4.151/DF**, no Supremo Tribunal Federal (STF), conduzida pela equipe jurídica da entidade e principal ação da UNASLAF;
  - **ações coletivas** na Justiça Federal do Distrito Federal (JFDF), de São Paulo (JFSP) e do Rio Grande do Sul (JFRS) e na Justiça do DF (TJDFT), patrocinadas pelo escritório **Mota Advogados** (pastas "10H");
  - ações de **lista específica** patrocinadas pelo advogado **Raphael Malinverni** e pelo escritório **Saliba e Malinverni**.
- Tipos de beneficiários: "todos os associados" (ADI 4.151), "rol de associados" (ações coletivas) e "lista específica" (somente os associados nominados no processo).

---

## 1-A. QUADRO GERAL DOS PROCESSOS

### Resumo numérico (posição em 19/10/2026)
- **Total:** 38 processos, na mesma ordem da planilha de controle da UNASLAF (out/2026). Recursos e numerações anteriores ligados a uma ação aparecem na mesma linha.
- **Arquivados ou extintos:** 11. Desses, 1 está arquivado aguardando execução de sentença favorável (IR sobre auxílio-creche).
- **Com decisão favorável à UNASLAF ou aos associados (em qualquer instância):** 7, a saber: ADI 4.151, abono de permanência, IR sobre auxílio-creche, MP 873/2019, auxílio-transporte (grupo específico), agravo no TRF-1 sobre a Portaria 1.985/2026 e exclusão do PECFAZ.
- **Por tipo de beneficiário:**
  - todos os associados: 1
  - rol de associados: 9
  - lista específica: 17
  - entidade/dirigentes: 2
  - não informado: 9

### Como ler o quadro
- "Data da informação" indica de quando é a situação descrita: **jul/2023** (relatório do escritório Mota), **out/2026** (planilha de controle da UNASLAF) ou datas posteriores (registros da Diretoria Jurídica).
- "Não informada" significa que a fonte não traz o dado. O assistente não deve completar a lacuna por dedução.
- Cada linha é completa por si: o assunto e o tipo de beneficiário se repetem quando necessário.

| Nº | Processo | Juízo/tribunal | Distribuição | Assunto | Escritório | Beneficiários | Situação | Data da informação | Detalhe |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ADI nº 4.151/DF | STF — Plenário (Rel. Min. Gilmar Mendes) | não informada | Transformação dos cargos de Analista e Técnico do Seguro Social em Analista-Tributário da RFB (art. 10, II, Lei 11.457/2007) | Equipe jurídica da UNASLAF | Todos os associados abrangidos pelos critérios do acórdão | Acórdão dos ED-ED (abr/2026) com força executória desde 05/05/2026; cumprimento parcial pela Administração; ED-ED-ED suspensos por pedido de vista do Min. Cristiano Zanin em 15/10/2026 | 19/10/2026 | Seção 2 |
| 2 | 0727740-19.2020.8.07.0001 | TJDFT — 24ª Vara Cível de Brasília | 31/08/2020 | PASEP — diferenças de correção e rendimentos (réu: Banco do Brasil) | Mota Advogados | Lista específica | Extinto | out/2026 | Seção 4.8 |
| 3 | 1004692-44.2020.4.01.3400 | JFDF — 6ª Vara Federal Cível | 29/01/2020 | Auxílio-transporte — ação coletiva (IN SGDP/ME 207/2019; uso de veículo próprio) | Mota Advogados | Rol de associados | Sentença de improcedência; apelação da UNASLAF pendente no TRF-1 | jul/2023 | Seção 4.5 |
| 4 | 1015579-87.2020.4.01.3400 | JFDF — 4ª Vara Federal Cível | 19/03/2020 | Mandado de segurança — COVID-19 / atendimento presencial na RFB | Mota Advogados | Rol de associados | Arquivado definitivamente (19/10/2021) | out/2026 | Seção 4.7 |
| 5 | 1019847-53.2021.4.01.3400 | JFDF — 6ª Vara Federal Cível | 08/04/2021 | Abono de permanência na base do terço de férias e do 13º | Mota Advogados | Rol de associados | Procedente; TRF-1 negou apelação da União (jun/2023); desfecho posterior não informado | jul/2023 | Seção 4.9 |
| 6 | 1023229-54.2021.4.01.3400 | JFDF — 2ª Vara Federal Cível | 26/04/2021 | Paridade de aposentados e pensionistas | Mota Advogados | Rol de associados | Réplica da UNASLAF em 08/03/2023; aguardava sentença | jul/2023 | Seção 4.10 |
| 7 | 1074276-67.2021.4.01.3400 | JFDF — 8ª Vara Federal Cível | 19/10/2021 | Conversão em pecúnia da licença-prêmio não gozada | Mota Advogados | Rol de associados | Emenda da inicial determinada (prazo final 19/07/2023); desfecho posterior não informado | jul/2023 | Seção 4.11 |
| 8 | 1079393-39.2021.4.01.3400 | JFDF — 5ª Vara Federal Cível | 09/11/2021 | Não incidência de IR sobre auxílio-creche / pré-escolar | Mota Advogados | Rol de associados (sentença restrita aos filiados relacionados na inicial) | Procedente, trânsito em julgado em 16/05/2022; arquivado aguardando execução | out/2026 | Seção 4.12 |
| 9 | 1080942-84.2021.4.01.3400 (AI 1036859-27.2023.4.01.0000) | JFDF — 3ª Vara Federal Cível; agravo no TRF-1 | 16/11/2021 | Inexigibilidade da cota de participação no auxílio-creche | Mota Advogados | Rol de associados | Tutela negada; agravo de instrumento interposto | out/2026 | Seção 4.13 |
| 10 | 1084980-42.2021.4.01.3400 | JFDF — 17ª Vara Federal Cível | 01/12/2021 | Contribuição ao RPPS — "dobra do teto" do RGPS (EC 103/2019) | Mota Advogados | Rol de associados | Aguardava citação da União | jul/2023 | Seção 4.14 |
| 11 | 5024330-86.2020.4.03.6100 | JFSP — 17ª Vara Federal Cível | não informada | Reposição ao erário — RT 1382/92 | Mota Advogados | Lista específica | Arquivado | out/2026 | Seção 4.15 |
| 12 | 0061254-90.1997.4.03.6100 | JFSP — 4ª Vara Federal Cível | não informada | Reajuste de 28,86% (Lei 8.627/1993) — ação de conhecimento | Mota Advogados | Lista específica | Não informada | out/2026 | Seção 4.16 |
| 13 | 970025637-5 | JFRS — 6ª Vara Federal | não informada | Reajuste de 28,86% | Mota Advogados | Lista específica | Arquivado | out/2026 | Seção 4.16 |
| 14 | 0031048-60.2001.4.01.3400 | JFDF — 15ª Vara Federal Cível | não informada | Reajuste de 28,86% | Mota Advogados | Lista específica | Arquivado | out/2026 | Seção 4.16 |
| 15 | 38782-33.1999.4.01.3400 | JFSP — 4ª Vara Federal Cível (conforme planilha) | não informada | Reajuste de 28,86% | Mota Advogados | Lista específica | Arquivado | out/2026 | Seção 4.16 |
| 16 | 8426-69.2010.4.01.3400 | JFDF | não informada | Averbação, cômputo e conversão de tempo de serviço especial | Mota Advogados | Não informado | Não informada | out/2026 | Seção 4.17 |
| 17 | 1022299-41.2018.4.01.3400 | JFDF — 22ª Vara Federal Cível | 22/10/2018 | Adicional (indenização) de fronteira — Lei 12.855/2013 | Mota Advogados | Não informado | Sentença de improcedência; apelação da UNASLAF pendente no TRF-1 | jul/2023 | Seção 4.1 |
| 18 | 1024043-71.2018.4.01.3400 | JFDF — 2ª Vara Federal Cível | não informada | IN 02/2018 — abono de ponto de dirigentes para atividades da entidade | Mota Advogados | Entidade/dirigentes | Sentença de improcedência; apelação da UNASLAF (02/02/2023) | jul/2023 | Seção 4.2 |
| 19 | 0727196-31.2020.8.07.0001 (origem 1012481-65.2018.4.01.3400; REsp 1.987.466/DF) | TJDFT — 6ª Vara Cível de Brasília; STJ (Rel. Min. Humberto Martins) | 28/06/2018 (JFDF) | Danos materiais — reajustes da GEAP (Resoluções 99/2015, 168/2016 e 269/2017) | Mota Advogados | Rol de associados | Improcedente nas instâncias ordinárias; recurso especial admitido e concluso no STJ | jul/2023 | Seção 4.3 |
| 20 | 1007732-68.2019.4.01.3400 | JFDF — 6ª Vara Federal Cível | não informada | Desconto em folha das mensalidades associativas — MP 873/2019 | Mota Advogados | Entidade/dirigentes | Procedente; apelação da União pendente no TRF-1 | jul/2023 | Seção 4.4 |
| 21 | 1009517-65.2019.4.01.3400 | JFDF — 22ª Vara Federal Cível | não informada | Auxílio-transporte — grupo específico de servidores | Mota Advogados | Lista específica | Procedente; apelação da União conclusa no TRF-1 | jul/2023 | Seção 4.6 |
| 22 | 2005.71.00.020255-3 | JFRS | não informada | Execução de sentença — ação principal nº 97.00.023625-0/RS (28,86%) | Mota Advogados | Lista específica | Não informada | out/2026 | Seção 4.16 |
| 23 | 5002118-66.2011.4.04.7100 | JFRS | não informada | Execução de sentença — ação principal nº 97.00.023625-0/RS (28,86%) | Mota Advogados | Lista específica | Não informada | out/2026 | Seção 4.16 |
| 24 | 5002121-21.2011.4.04.7100 | JFRS | não informada | Embargos à execução — ação principal nº 97.00.023625-0/RS (28,86%) | Mota Advogados | Não informado | Arquivado | out/2026 | Seção 4.16 |
| 25 | 5005264-18.2011.4.04.7100 | JFRS | não informada | Embargos à execução — ação principal nº 97.00.023625-0/RS (28,86%) | Mota Advogados | Não informado | Arquivado | out/2026 | Seção 4.16 |
| 26 | 5053568-38.2017.4.04.7100 | JFRS | não informada | Execução de sentença — ação principal nº 97.00.023625-0/RS (28,86%) | Mota Advogados | Lista específica | Não informada | out/2026 | Seção 4.16 |
| 27 | 0055884-14.2012.4.01.3400 | JFDF — 1ª Vara Federal Cível | 13/11/2012 | Ação ordinária — transformação no cargo de Analista-Tributário | Raphael Malinverni | Lista específica | Não informada | out/2026 | Seção 5 |
| 28 | 0005911-80.2018.4.01.3400 | JFDF — 7ª Vara Federal Cível | não informada | Execução provisória 1 — nomenclatura | Raphael Malinverni | Lista específica | Não informada | out/2026 | Seção 5 |
| 29 | 0012872-86.2008.4.01.3400 | JFDF — 7ª Vara Federal Cível | 22/04/2008 | Correção de nomenclatura | Raphael Malinverni | Lista específica | Não informada | out/2026 | Seção 5 |
| 30 | 0020259-84.2010.4.01.3400 | JFDF — 22ª Vara Federal Cível | 27/04/2010 | Contra descontos de contribuição previdenciária (INSS) sobre o terço de férias | Raphael Malinverni | Não informado | Não informada | out/2026 | Seção 5 |
| 31 | 0038104-37.2007.4.01.3400 | JFDF — 16ª Vara Federal Cível | 29/10/2007 | Suspensão do prazo de retorno ao INSS | Raphael Malinverni | Não informado | Arquivado | out/2026 | Seção 5 |
| 32 | 1018458-28.2024.4.01.3400 | JFDF — 7ª Vara Federal Cível | 21/03/2024 | Execução provisória 2 — nomenclatura | Raphael Malinverni | Lista específica | Arquivado | out/2026 | Seção 5 |
| 33 | 0036028-35.2010.4.01.3400 | JFDF — 9ª Vara Federal Cível | não informada | Exclusão do PECFAZ | Raphael Malinverni | Não informado | Apelação e embargos de declaração da União rejeitados | out/2026 | Seção 5 |
| 34 | 1098257-23.2024.4.01.3400 | JFDF — 7ª Vara Federal Cível | 03/12/2024 | Segunda correção de nomenclatura | Raphael Malinverni | Lista específica | Não informada | out/2026 | Seção 5 |
| 35 | 0031897-85.2008.4.01.3400 | JFDF | não informada | Suspensão do art. 256-A (PECFAZ) | Raphael Malinverni | Não informado | Não informada | out/2026 | Seção 5 |
| 36 | 1014667-95.2026.4.01.0000 | TRF-1 — 1ª Turma | 20/04/2026 | Agravo de instrumento no MS contra a Portaria DGP/SSC/MGI nº 1.985/2026 (exclusão de aposentados da transformação) | Saliba e Malinverni | Lista específica (12 associados) | Decisão favorável: restabelecimento do enquadramento; MGI ainda mantinha a portaria em set/2026 | set/2026 | Seção 3 |
| 37 | 1021420-53.2026.4.01.3400 | JFDF — 18ª Vara Federal Cível | 04/03/2026 | Mandado de segurança contra a Portaria DGP/SSC/MGI nº 1.985/2026 | Saliba e Malinverni | Lista específica (12 associados) | Em tramitação; ver agravo nº 1014667-95.2026.4.01.0000 | set/2026 | Seção 3 |
| 38 | 5007253-93.2022.4.03.6100 (origem 1005217-89.2021.4.01.3400; AI 5014983-25.2022.4.03.0000) | JFSP — 17ª Vara Federal Cível; agravo no TRF-3 | 29/03/2022 | Reposição ao erário — RT 1382/92 | Mota Advogados | Não informado | Juízo aguardava julgamento do agravo de instrumento da UNASLAF | jul/2023 | Seção 4.15 |
---

## 2. ADI Nº 4.151/DF — TRANSFORMAÇÃO DOS CARGOS (STF)

**Tribunal:** Supremo Tribunal Federal · **Relator:** Min. Gilmar Mendes · **Autora:** UNASLAF · **Beneficiários:** categoria representada (critérios abaixo) · **Situação em:** 19/10/2026

### 2.1 Do que trata
A ADI 4.151 discutiu a exclusão dos cargos da Carreira do Seguro Social redistribuídos à RFB da transformação de cargos prevista no art. 10, inciso II, da Lei nº 11.457/2007. O STF deu interpretação conforme à Constituição para incluir os cargos de **Analista do Seguro Social** e de **Técnico do Seguro Social** nos preceitos e efeitos do art. 10, II, com a consequente transformação no cargo de **Analista-Tributário da Receita Federal do Brasil**.

### 2.2 O que o STF decidiu (embargos de declaração — ED-ED, Plenário, unanimidade, Sessão Virtual de 17 a 28/04/2026)
a) **Analistas do Seguro Social:** efeitos a partir de **7 de abril de 2022** (data da cautelar ratificada na ADI 6.966).
b) **Técnicos do Seguro Social:** incluídos nos termos da Lei nº 10.855/2004, Anexo V, alínea "b", Tabela III, **excluídos os que não foram redistribuídos à RFB ou que optaram pelo retorno ao INSS**.
c) **Técnicos do Seguro Social:** efeitos a partir de **6 de setembro de 2024**.
d) A decisão também alcança os **servidores inativos** que estavam em exercício na antiga SRP, foram transferidos para a RFB e lá se aposentaram, conforme o regime previdenciário aplicável a cada um.

Ponto importante: o voto do Relator nos ED-ED registrou que a Tabela III da Lei 10.855/2004 reúne sob a denominação única de Técnico do Seguro Social cargos de origens diferentes (por exemplo, Técnico Previdenciário, Agente Administrativo, Escriturário, Secretária, Técnico de Secretariado), e que não seria adequado segmentá-los para contemplar só uma parte.

### 2.3 Força executória
- A ata do julgamento foi publicada em **05/05/2026**.
- A própria Advocacia-Geral da União, pelo **Ofício nº 01412/2026/SGCT/AGU (08/05/2026)**, certificou à Consultoria Jurídica do MGI a força executória da decisão a partir dessa data. O Ofício nº 01413/2026/SGCT/AGU comunicou a decisão à PGFN "para ciência e observância pela Administração".
- Ou seja, desde maio de 2026 a decisão deve ser cumprida.

### 2.4 Cumprimento: onde está o problema
- A Nota Informativa SEI nº 718/2024/MF, da COGEP/RFB, já havia identificado **657 servidores** abrangidos; desses, apenas **180** foram transformados até agora.
- A **NOTA nº 00375/2026/CONJUR-MGI/CGU/AGU** (02/06/2026) fixou critérios de alcance: (a) ocupar o cargo de Técnico do Seguro Social na forma da Lei 10.855/2004, Anexo V, "b", Tabela III; (b) ter sido redistribuído à RFB; (c) não ter optado pelo retorno ao INSS; (d) para os inativos, ter passado à inatividade na RFB **após 06/09/2024**. A UNASLAF contesta o critério (d) e a exclusão de aposentados e pensionistas anteriores a essa data, que constam da **Portaria DGP/SSC/MGI nº 1.985/2026**.
- A **Portaria DGP/SSC/MGI nº 3.043/2025** é a portaria de enquadramento (transformação). A Portaria nº 1.985/2026 tornou sem efeito o Anexo II dela, que tratava de aposentados e instituidores de pensão.
- A UNASLAF entende que **datas de efeitos financeiros** (7/4/2022 e 6/9/2024) **não se confundem com quem tem direito**: a modulação trata de quando os efeitos começam, e não exclui quem se aposentou antes.
- A Administração (MGI) também vem indeferindo pedidos de Técnicos do Seguro Social cujo cargo de origem não era o de Técnico Previdenciário (p. ex., Nota Técnica SEI nº 47314/2026/MGI, out/2026). A UNASLAF sustenta que isso contraria o acórdão, que não permite separar os TSS pela origem do cargo.
- A COGEP/RFB, em ofícios de agosto de 2026, afirmou não ter competência para definir quem está abrangido e que não haveria pendências a seu cargo. Em reunião de **28/09/2026**, o Secretário Especial da RFB informou que trataria do assunto com o MGI. Em outubro de 2026 o processo administrativo (NUP 90849.003014/2024-81) foi encaminhado ao MGI (CODEJ/DIDEJ/DGP).
- Outra frente: parecer da CONJUR-MGI (Parecer nº 00413/2026) defende pagar os **valores retroativos por precatório**. A UNASLAF sustenta o pagamento em folha.

### 2.5 Recurso pendente no STF (ED-ED-ED)
- Há novos embargos de declaração da UNASLAF (e de um amicus curiae, a ANARF) em julgamento.
- O Relator, Min. Gilmar Mendes, votou no sentido de **esclarecer que o acórdão não distinguiu servidores pela data da aposentadoria**, sendo descabida a separação entre os que se aposentaram antes ou depois de 6/9/2024. O voto não conhece dos embargos da ANARF.
- O julgamento foi suspenso por pedido de vista do Min. Dias Toffoli (17/08/2026). Retomado na sessão virtual de 09 a 19/10/2026, foi **novamente suspenso em 15/10/2026 por pedido de vista do Min. Cristiano Zanin**. Até então, **4 votos** acompanhavam o Relator no ponto de maior interesse da categoria (Gilmar Mendes, Alexandre de Moraes, Cármen Lúcia e Dias Toffoli).
- **Não há ainda decisão final** sobre esses embargos. Enquanto isso, o acórdão unânime de abril de 2026 continua com força executória, e a UNASLAF adotará novas providências para denunciar o descumprimento e pedir a implementação do julgado.

### 2.6 O que o associado pode fazer
- A UNASLAF disponibilizou **modelos de reclamação/requerimento administrativo** para protocolo pelos próprios associados na Ouvidoria do MGI (plataforma **Fala.BR**): um para servidores **em atividade** ocupantes do cargo de Técnico do Seguro Social e um simplificado para **aposentados e pensionistas**. Oriente o associado a procurar esses modelos nos canais da UNASLAF ou a pedi-los à Diretoria Jurídica.
- O assistente não deve afirmar se determinado associado será ou não transformado: isso depende dos dados funcionais de cada um, que constam dos registros da RFB.

---

## 3. MANDADO DE SEGURANÇA SOBRE A PORTARIA Nº 1.985/2026 (APOSENTADOS — LISTA ESPECÍFICA)

**Processos:** MS nº 1021420-53.2026.4.01.3400 (18ª Vara Federal Cível da JFDF, distribuído em 04/03/2026) e Agravo de Instrumento nº 1014667-95.2026.4.01.0000 (TRF-1, 1ª Turma, distribuído em 20/04/2026) · **Escritório:** Saliba e Malinverni · **Beneficiários:** lista específica de 12 associados · **Situação em:** set/2026

- Objeto: impugnar a Portaria DGP/SSC/MGI nº 1.985/2026, que excluiu aposentados e instituidores de pensão da transformação.
- No agravo, o **TRF-1 afastou a tese da União de excluir os inativos em abstrato** e determinou o **restabelecimento do enquadramento**. Também distinguiu quem tem direito (inativos incluídos) de quando começam os efeitos financeiros (a partir de 6/9/2024).
- Documento do MGI de set/2026 (Nota Informativa SEI nº 29991/2026) mantém a Portaria 1.985/2026, o que indica que a liminar ainda não havia sido cumprida.
- Vale **apenas para os 12 associados que constam do processo**. É um precedente favorável, mas não estende automaticamente o direito aos demais.

---

## 4. AÇÕES COLETIVAS — ESCRITÓRIO MOTA ADVOGADOS

> Atenção: a situação processual detalhada abaixo vem do relatório do escritório **atualizado em julho de 2023**, salvo quando indicada a fonte de 2026 (planilha de controle da UNASLAF, out/2026). Informe sempre a data ao associado.

### 4.1 Adicional de Fronteira (pasta 10H25)
- **Processo:** 1022299-41.2018.4.01.3400 — 22ª Vara Federal Cível/JFDF.
- **Objeto:** indenização de fronteira (Lei nº 12.855/2013) para os servidores da Carreira do Seguro Social redistribuídos à RFB em exercício em localidades estratégicas, desde o Decreto nº 9.227/2017.
- **Andamento:** tutela negada; sentença de improcedência (abr/2020); embargos rejeitados (jan/2021); **apelação da UNASLAF** interposta em 13/07/2021; redistribuída no TRF-1 em 05/2023. Aguardava julgamento (jul/2023).

### 4.2 IN nº 02/2018 — Jornada de trabalho / abono de ponto para dirigentes (pasta 10H26)
- **Processo:** MS coletivo 1024043-71.2018.4.01.3400 — JFDF.
- **Objeto:** afastar o art. 36 da IN 02/2018 para que dirigentes da UNASLAF participem de atividades da entidade sem compensar horas.
- **Andamento:** liminar indeferida; sentença de improcedência (nov/2021); embargos rejeitados (nov/2022); **apelação da UNASLAF** em 02/02/2023.

### 4.3 Danos materiais — reajustes da GEAP (pasta 10H27)
- **Processos:** originalmente 1012481-65.2018.4.01.3400 (21ª Vara/JFDF); depois remetido à Justiça do DF como **0727196-31.2020.8.07.0001** (TJDFT); **REsp nº 1.987.466/DF** no STJ.
- **Objeto:** ilegalidade das Resoluções GEAP/CAND nº 99/2015, 168/2016 e 269/2017 (aumento das contribuições) e devolução de diferenças.
- **Andamento:** a Justiça Federal excluiu a União e remeteu o caso ao TJDFT; sentença de improcedência mantida em apelação (nov/2021); **recurso especial** admitido em 07/02/2022, concluso ao Min. Humberto Martins (jul/2023).

### 4.4 MP nº 873/2019 — desconto em folha das mensalidades associativas (pasta 10H29)
- **Processo:** 1007732-68.2019.4.01.3400 — 6ª Vara Federal Cível/JFDF.
- **Objeto:** manter o desconto em folha das mensalidades da UNASLAF, suprimido pela MP 873/2019 e pelo Decreto 9.735/2019.
- **Andamento:** tutela deferida; **sentença de procedência** (abr/2020), que manda restabelecer a consignação; apelação da União remetida ao TRF-1 em out/2020, aguardando julgamento. Beneficiária: a entidade (planilha indica "diretores UNASLAF").

### 4.5 Auxílio-transporte — ação coletiva
- **Processo:** 1004692-44.2020.4.01.3400 — 6ª Vara Federal Cível/JFDF (distribuída em 29/01/2020).
- **Objeto:** invalidar a IN SGDP/ME nº 207/2019 e garantir o auxílio-transporte independentemente do meio de transporte (inclusive veículo próprio), com devolução do que foi suprimido.
- **Andamento:** tutela negada; sentença de improcedência (02/08/2021); embargos rejeitados (02/03/2022); **apelação da UNASLAF** (04/04/2022); redistribuída no TRF-1 em 05/2023.

### 4.6 Auxílio-transporte — grupo específico (pasta 10H30)
- **Processo:** 1009517-65.2019.4.01.3400 — 22ª Vara Federal Cível/JFDF.
- **Objeto:** manter o auxílio-transporte, inclusive com veículo próprio, para os servidores listados na inicial.
- **Andamento:** tutela deferida; **sentença de procedência** (12/03/2020), com pagamento das diferenças observada a prescrição de 5 anos; apelação da União (17/03/2021), conclusa no TRF-1 desde 07/02/2022. **Beneficiários: só os servidores listados.**

### 4.7 Mandado de segurança — COVID-19 / atendimento presencial
- **Processo:** 1015579-87.2020.4.01.3400 — 4ª Vara Federal Cível/JFDF.
- **Objeto:** restringir o atendimento presencial nas unidades da RFB durante a pandemia.
- **Andamento:** liminar deferida e depois segurança denegada (out/2020); embargos rejeitados; **arquivado definitivamente** em 19/10/2021. Ação encerrada.

### 4.8 PASEP
- **Processo:** 0727740-19.2020.8.07.0001 — 24ª Vara Cível/TJDFT (distribuída em 31/08/2020) · Réu: Banco do Brasil · Beneficiários: lista específica.
- **Objeto:** diferenças de correção e rendimentos nas contas PASEP.
- **Andamento:** suspenso por IRDR e pelo Tema/SIRDR 9 do STJ (2020–2022). **Planilha de out/2026: extinto.**

### 4.9 Abono de permanência no terço de férias e no 13º
- **Processo:** 1019847-53.2021.4.01.3400 — 6ª Vara Federal Cível/JFDF.
- **Objeto:** incluir o abono de permanência na base de cálculo do terço de férias e da gratificação natalina, para ativos, aposentados e pensionistas, observados 5 anos.
- **Andamento:** **sentença de procedência** (08/04/2022). Em **junho de 2023 o TRF-1 negou a apelação da União** e deu provimento à da UNASLAF (honorários sobre o valor da condenação). Também afirmou que a decisão coletiva não se limita territorialmente (Tema 1.075/STF). Prazo de recurso da União até 14/08/2023. Desfecho posterior: não informado neste documento.

### 4.10 Paridade de aposentados e pensionistas
- **Processo:** 1023229-54.2021.4.01.3400 — 2ª Vara Federal Cível/JFDF.
- **Objeto:** revisar aposentadorias e pensões para garantir a paridade com os ativos, inclusive em gratificações de desempenho e reestruturações de carreira, e garantir a paridade futura.
- **Andamento:** valor da causa aceito (05/2022); contestação da União (08/2022); **réplica da UNASLAF** (08/03/2023). Aguardava sentença (jul/2023).

### 4.11 Conversão em dinheiro da licença-prêmio não gozada
- **Processo:** 1074276-67.2021.4.01.3400 — 8ª Vara Federal Cível/JFDF.
- **Objeto:** converter em pecúnia, na aposentadoria, a licença-prêmio/especial não gozada, sem imposto de renda (Súmula 136/STJ).
- **Andamento:** o juízo exigiu emenda da inicial (valor da causa e comprovação de hipossuficiência); prazo final em 19/07/2023. Desfecho posterior: não informado neste documento.

### 4.12 Imposto de renda sobre auxílio-creche / pré-escolar
- **Processo:** 1079393-39.2021.4.01.3400 — 5ª Vara Federal Cível/JFDF.
- **Objeto:** não incidência de IR sobre o auxílio-creche e restituição dos últimos 5 anos.
- **Andamento:** **sentença de procedência** (17/03/2022), não recorrida; **trânsito em julgado em 16/05/2022**. Restituição pela Selic, para os associados relacionados na inicial (valores anteriores a 09/11/2016 prescritos). **Planilha de out/2026: arquivado, aguardando execução.**

### 4.13 Cota de participação no auxílio-creche
- **Processo:** 1080942-84.2021.4.01.3400 — 3ª Vara Federal Cível/JFDF.
- **Objeto:** afastar o desconto da cota de participação do servidor no custeio do auxílio pré-escolar/creche e devolver o descontado.
- **Andamento:** tutela negada (24/01/2023); **agravo de instrumento nº 1036859-27.2023.4.01.0000** (TRF-1), segundo a planilha de 2026.

### 4.14 Contribuição previdenciária — "dobra do teto do RGPS"
- **Processo:** MS coletivo 1084980-42.2021.4.01.3400 — 17ª Vara Federal Cível/JFDF.
- **Objeto:** impedir a cobrança imediata da contribuição ao RPPS sobre aposentadorias e pensões sem a isenção da "dobra do teto" do RGPS, sem respeitar o prazo de 90 dias após a EC 103/2019.
- **Andamento:** a UNASLAF confirmou interesse no prosseguimento (15/03/2023); aguardava citação da União (jul/2023).

### 4.15 Reposição ao erário — RT 1382/92
- **Processos:** 5024330-86.2020.4.03.6100 (17ª Vara Federal/JFSP — **arquivado**) e **5007253-93.2022.4.03.6100** (17ª Vara Federal/JFSP, distribuído em 29/03/2022, vindo da JFDF, onde tinha o nº 1005217-89.2021.4.01.3400); agravo de instrumento nº 5014983-25.2022.4.03.0000 (TRF-3).
- **Objeto:** anular a cobrança, em processo administrativo, de valores recebidos por força da Reclamação Trabalhista nº 0138200-51.1992.5.02.0044 (rubrica RT 1382/92), cuja decisão foi depois rescindida.
- **Andamento:** o juízo exigiu documentos sobre os associados afetados; a UNASLAF agravou (06/2022); aguardava o agravo (jul/2023).
- Tema relacionado: a **ASPLAF** (entidade coirmã) discute a reposição ao erário no STJ, no **AREsp nº 3.135.204/SP**, originado de mandado de segurança coletivo do TRF-3. O recurso especial da União não foi conhecido por decisão do Min. Francisco Falcão; a União interpôs agravo interno, respondido pela ASPLAF. Esse processo é da ASPLAF, não da UNASLAF.

### 4.16 Reajuste de 28,86% (Lei nº 8.627/1993) e execuções
- **Processos (lista específica):** 0061254-90.1997.4.03.6100 (4ª Vara Cível/JFSP); 970025637-5 (JFRS — arquivado); 0031048-60.2001.4.01.3400 (JFDF — arquivado); 38782-33.1999.4.01.3400 (arquivado).
- **Execuções da ação principal nº 97.00.023625-0/RS (JFRS):** 2005.71.00.020255-3; 5002118-66.2011.4.04.7100; 5053568-38.2017.4.04.7100; embargos à execução 5002121-21.2011.4.04.7100 e 5005264-18.2011.4.04.7100 (arquivados).
- Beneficiários: apenas os associados nominados em cada processo. **Não divulgue nomes.**

### 4.17 Tempo de serviço especial
- **Processo:** 8426-69.2010.4.01.3400 — JFDF. **Objeto:** averbação, cômputo e conversão de tempo de serviço especial. Situação: não informada neste documento.

---

## 5. AÇÕES DE LISTA ESPECÍFICA — ADV. RAPHAEL MALINVERNI

Todas beneficiam **somente os associados nominados** no processo. As situações não estão detalhadas, salvo indicação.

| Processo | Vara | Distribuição | Objeto | Situação |
|---|---|---|---|---|
| 0055884-14.2012.4.01.3400 | 1ª Vara Cível/JFDF | 13/11/2012 | Ação ordinária — transformação no cargo de Analista-Tributário | não informada |
| 0012872-86.2008.4.01.3400 | 7ª Vara Cível/JFDF | 22/04/2008 | Correção de nomenclatura | não informada |
| 0005911-80.2018.4.01.3400 | 7ª Vara Cível/JFDF | — | Execução provisória 1 — nomenclatura | não informada |
| 1018458-28.2024.4.01.3400 | 7ª Vara Cível/JFDF | 21/03/2024 | Execução provisória 2 — nomenclatura | arquivado |
| 1098257-23.2024.4.01.3400 | 7ª Vara Cível/JFDF | 03/12/2024 | Segunda correção de nomenclatura | não informada |
| 0020259-84.2010.4.01.3400 | 22ª Vara Cível/JFDF | 27/04/2010 | Contra desconto de contribuição previdenciária sobre o terço de férias | não informada |
| 0038104-37.2007.4.01.3400 | 16ª Vara Cível/JFDF | 29/10/2007 | Suspensão do prazo de retorno ao INSS | arquivado |
| 0036028-35.2010.4.01.3400 | 9ª Vara Cível/JFDF | — | Exclusão do PECFAZ | apelação e embargos da União rejeitados |
| 0031897-85.2008.4.01.3400 | JFDF | — | Suspensão do art. 256-A (PECFAZ) | não informada |

---

## 6. PERGUNTAS FREQUENTES (FAQ)

**A decisão da ADI 4.151 já está valendo?**
Sim. O acórdão dos embargos de abril de 2026 tem força executória desde a publicação da ata, em 05/05/2026, como reconheceu a própria AGU (Ofício nº 01412/2026/SGCT/AGU). O que falta é a Administração implementar a transformação para todos os alcançados.

**Sou aposentado(a) antes de setembro de 2024. Tenho direito?**
A decisão do STF inclui os inativos que estavam na antiga SRP, foram para a RFB e lá se aposentaram, e não fez distinção pela data da aposentadoria. O MGI, porém, vem excluindo quem se aposentou antes de 06/09/2024 (Portaria nº 1.985/2026). A UNASLAF contesta essa exclusão no STF, e o voto do Relator nos embargos pendentes confirma que não cabe essa separação. O julgamento ainda não terminou (vista do Min. Zanin em 15/10/2026). A data de 6/9/2024 é o início dos efeitos financeiros, e não um corte de quem tem direito.

**Meu cargo de origem não era Técnico Previdenciário (era Agente Administrativo, por exemplo). Estou incluído(a)?**
O STF incluiu o cargo de Técnico do Seguro Social conforme a Tabela III da Lei 10.855/2004, que reúne cargos de várias origens, e o voto do Relator diz que não cabe segmentá-los. A UNASLAF contesta os indeferimentos do MGI baseados na origem do cargo. Não é possível confirmar a situação individual pelo assistente; procure a Diretoria Jurídica.

**Quando vou receber os atrasados?**
Não há data. Os efeitos financeiros contam de 7/4/2022 (Analistas) e de 6/9/2024 (Técnicos). Há divergência sobre a forma de pagamento: a CONJUR/MGI defende precatório, e a UNASLAF defende pagamento em folha.

**O que eu posso fazer agora?**
Protocolar, pela Ouvidoria do MGI (Fala.BR), o modelo de reclamação/requerimento preparado pela UNASLAF para o seu caso (ativo ou aposentado/pensionista).

**Como sei se estou em uma ação de "lista específica"?**
Só a Diretoria Jurídica ou o escritório responsável pode confirmar, mediante identificação do associado. O assistente não divulga listas de beneficiários.

**A ação do auxílio-creche já pagou?**
A sentença que afastou o IR sobre o auxílio-creche transitou em julgado em 16/05/2022 e vale para os associados relacionados na inicial. Pela planilha de out/2026 o processo está arquivado, aguardando execução. Não há informação sobre pagamento.

**Quem são os advogados das ações?**
ADI 4.151: equipe jurídica da UNASLAF. Ações coletivas (pastas 10H): Mota Advogados. Transformação/nomenclatura/PECFAZ (listas específicas): Raphael Malinverni. Mandado de segurança sobre a Portaria 1.985/2026: Saliba e Malinverni.

---

## 7. GLOSSÁRIO RÁPIDO

- **ADI:** Ação Direta de Inconstitucionalidade, julgada pelo STF, com efeito para todos.
- **Embargos de declaração (ED):** recurso para esclarecer ou corrigir a decisão. "ED-ED" e "ED-ED-ED" indicam embargos sucessivos.
- **Força executória:** a decisão já deve ser cumprida.
- **Modulação de efeitos:** definição pelo STF da data a partir da qual a decisão produz efeitos.
- **Pedido de vista:** um ministro pede mais tempo para analisar, e o julgamento fica suspenso.
- **Lista específica × rol de associados:** na primeira, só os nominados no processo; na segunda, os associados da entidade, nos limites da decisão.
- **Trânsito em julgado:** não cabe mais recurso.
- **Precatório:** pagamento de dívida judicial da União em fila orçamentária, diferente do pagamento em folha.
- **Fala.BR:** plataforma oficial de ouvidoria do Governo Federal.

---

*Fontes internas: planilha de controle de ações judiciais da UNASLAF (out/2026); Relatório das Ações Coletivas — Mota Advogados (jul/2023); Relatório histórico e fático COGEP/ADI 4.151 (09/09/2026); registros da Diretoria Jurídica sobre a ADI 4.151 (até 19/10/2026). Atualize este documento sempre que houver novo andamento relevante.*`
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
