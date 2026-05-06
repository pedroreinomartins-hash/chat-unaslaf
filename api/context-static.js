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

const DOCS = [];

// ── Funções de busca e exportação (não alterar) ───────────────────────────────

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


// =============================================================================
// SEÇÃO 1 — REGRAS E INSTRUÇÕES DO AGENTE DE IA
// =============================================================================
// Este documento define o comportamento da IA: como ela deve responder,
// o que pode e não pode dizer, e quais são as prioridades de atendimento.
// Edite aqui caso queira mudar o perfil ou tom do atendente virtual.
// =============================================================================

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

DOCS.push({
  id: 'adi_4151',
  title: 'ADI 4151 Base Contexto Respostas',
  category: 'adi_4151',
  content: `ADI 4151 – BASE DE CONTEXTO E RESPOSTAS

RESUMO EXECUTIVO
A ADI 4151 é o eixo central da defesa jurídica dos servidores redistribuídos
da extinta Receita Previdenciária para a Receita Federal do Brasil.
Questiona a inclusão de cargos previdenciários nos preceitos do art. 10, II,
da Lei 11.457/2007.

DIREITOS RECONHECIDOS:
Cargo                        | Direito? | Marco Temporal dos Efeitos
Analista do Seguro Social    | SIM      | A partir de 07/04/2022
Técnico do Seguro Social     | SIM      | A partir de 06/09/2024
(Pagamento em folha desde 01/01/2025)

QUEM NÃO É ALCANÇADO:
- Servidores que optaram voluntariamente pelo retorno ao INSS
- Servidores não efetivamente redistribuídos à Receita Federal do Brasil

SITUAÇÃO DOS INATIVOS:
- Aposentados e instituidores de pensão Analistas: enquadrados pela Portaria 9.546/2022
- Técnicos inativos: requer análise jurídica individual

PERGUNTAS E RESPOSTAS FREQUENTES:
P: Quem tem direito à ADI 4151?
R: Servidores da carreira do Seguro Social redistribuídos para a RFB,
   incluindo Analistas e Técnicos, observados os marcos temporais.

P: Posso ajuizar ação individual?
R: Consulte o jurídico da UNASLAF antes de qualquer medida individual,
   para evitar conflito com a estratégia coletiva.

HISTÓRICO CRONOLÓGICO:
2008         | Ajuizamento da ADI 4151
19/04/2021   | Congresso derruba Veto 8/2009 (380 votos Câmara / 50 Senado)
08/2021      | Ajuizamento da ADI 6966 — liminar suspendendo a derrubada do veto
04/2022      | ADI 6966 — reforma da liminar favorável aos Analistas
11/2023      | Julgamento de mérito das ADIs 4151, 4616 e 6966 — reconhece direito dos Analistas
08/2024      | Julgamento dos embargos da UNASLAF — STF reconhece direito dos Técnicos
09/2024      | Embargos de Declaração da AGU
13/02/2026   | Início do julgamento — 3 votos favoráveis (Gilmar Mendes, Zanin, Flávio Dino)
13/03/2026   | Retorno — 4º voto favorável (Dias Toffoli)
16/03/2026   | Julgamento suspenso — pedido de vista Min. Alexandre de Moraes

STATUS ATUAL (março/2026):
JULGAMENTO SUSPENSO. Pedido de vista do Min. Alexandre de Moraes.
4 votos favoráveis já computados.
Ponto central: extensão definitiva dos efeitos para ativos e inativos
e modulação final dos efeitos financeiros e administrativos.

FUNDAMENTOS: Princípio da Isonomia. Art. 10, II, Lei 11.457/2007.
CANAIS OFICIAIS: www.unaslaf.org.br | unaslaf@unaslaf.org.br`
});


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

DOCS.push({
  id: 'acoes_indice',
  title: 'Relatorio Acoes Coletivas Indice Alerta',
  category: 'relatorio_acoes_indice',
  content: `RELATÓRIO DAS AÇÕES COLETIVAS – ÍNDICE GERAL

⚠️ ALERTA DE ATUALIZAÇÃO: Status baseado em relatório de julho/2023.
O andamento atual deve ser confirmado nos sistemas processuais ou
com a assessoria jurídica da UNASLAF.

ÍNDICE COMPLETO DAS 15 AÇÕES:

1.  Adicional de Fronteira
    Processo: 1022299-41.2018.4.01.3400 (22ª Vara Cível da SJDF)

2.  IN nº 02/2018 – Jornada de Trabalho/Abono de Ponto
    Processo: MS Coletivo 1024043-71.2018.4.01.3400 (2ª Vara Cível da SJDF)

3.  Danos Materiais GEAP
    Processo: 1012481-65.2018.4.01.3400 (21ª Vara Cível da SJDF)

4.  Suspensão dos Efeitos da MP 873/2019
    Processo: 1007732-68.2019.4.01.3400 (6ª Vara Cível da SJDF)

5.  Auxílio Transporte Coletiva
    Processo: 1004692-44.2020.4.01.3400 (6ª Vara Cível da SJDF)

6.  Auxílio Transporte (grupo específico de servidores)
    Processo: 1009517-65.2019.4.01.3400 (22ª Vara Cível da SJDF)

7.  Mandado de Segurança / COVID-19 / Serviço Público
    Processo: 1015579-87.2020.4.01.3400 (4ª Vara Cível da SJDF)
    Status: ARQUIVADO DEFINITIVAMENTE

8.  PASEP
    Processo: 0727740-19.2020.8.07.0001 (24ª Vara Cível da TJDF)
    Status: IMPROCEDENTE (março/2026)

9.  Abono de Permanência
    Processo: 1019847-53.2021.4.01.3400 (6ª Vara Cível da SJDF)
    Status: VITÓRIA EM APELAÇÃO (junho/2023)

10. Paridade
    Processo: 1023229-54.2021.4.01.3400/DF (2ª Vara Cível da SJDF)

11. Reposição ao Erário
    Processo: 1005217-89.2021.4.01.3400/DF (13ª Vara Cível da SJDF)

12. Conversão da Licença Prêmio Não Gozada em Pecúnia
    Processo: 1074276-67.2021.4.01.3400/DF (8ª Vara Cível da SJDF)

13. Inexigibilidade do IRPF sobre Auxílio-Creche
    Processo: 1079393-39.2021.4.01.3400 (5ª Vara Cível da SJDF)
    Status: VITÓRIA — Trânsito em julgado 16/05/2022

14. Inexigibilidade de Quota de Participação sobre o Auxílio Creche
    Processo: 1080942-84.2021.4.01.3400/DF (3ª Vara Cível da SJDF)

15. Inconstitucionalidade da Dobra do Teto da Contribuição Previdenciária
    Processo: 1084980-42.2021.4.01.3400/DF (17ª Vara Cível da SJDF)`
});

// ── Ação 1 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_01',
  title: 'Acao 01 Adicional de Fronteira',
  category: 'acoes_coletivas',
  content: `AÇÃO 1 | Adicional de Fronteira
Processo: 1022299-41.2018.4.01.3400 (22ª Vara Cível da SJDF)
Escritório: Mota Advogados

OBJETO: Garantir aos servidores da Carreira do Seguro Social redistribuídos
para a RFB a percepção do adicional de fronteira (Lei nº 12.855/2013),
concedido aos servidores em exercício em localidades estratégicas vinculadas
à prevenção e repressão de delitos transfronteiriços.

PEDIDOS:
- Tutela de urgência para implementação imediata
- Condenação da União ao pagamento das parcelas vencidas desde 06/12/2017

FASE ATUAL (jul/2023):
- Sentença de improcedência (abril/2020)
- Embargos de Declaração não acolhidos (25/01/2021)
- Recurso de Apelação apresentado (13/07/2021)
- Redistribuído por criação de nova unidade judiciária (14/05/2023)
- Mérito pendente de julgamento no TRF1

STATUS: EM RECURSO (TRF1)`
});

// ── Ação 2 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_02',
  title: 'Acao 02 IN 02 2018 Jornada Trabalho Abono Ponto',
  category: 'acoes_coletivas',
  content: `AÇÃO 2 | IN nº 02/2018 – Jornada de Trabalho / Abono de Ponto
Processo: MS Coletivo 1024043-71.2018.4.01.3400 (2ª Vara Cível da SJDF)
Escritório: Mota Advogados

OBJETO: Mandado de Segurança contra ato do Secretário de Gestão de Pessoas
do MPDG, requerendo a nulidade do art. 36 da IN nº 02/2018, que impediu a
dispensa de ponto dos servidores dirigentes filiados à UNASLAF para
participação em atividades e eventos da entidade.

FASE ATUAL (jul/2023):
- Liminar indeferida
- Sentença de improcedência (novembro/2021)
- Sentença de Embargos negando-lhes provimento (29/11/2022)
- Recurso de Apelação interposto (02/02/2023)

STATUS: EM RECURSO`
});

// ── Ação 3 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_03',
  title: 'Acao 03 Danos Materiais GEAP',
  category: 'acoes_coletivas',
  content: `AÇÃO 3 | Danos Materiais GEAP
Processo: 1012481-65.2018.4.01.3400 → redistribuído para TJDFT
Escritório: Mota Advogados

OBJETO: Questiona a legalidade das Resoluções/GEAP/CAND nº 99/2015,
168/2016 e 269/2017, que alteraram a sistemática de contribuições mensais
dos servidores para financiamento do Plano de Saúde da GEAP.

PEDIDOS:
- Suspensão dos aumentos de contribuição
- Ressarcimento das diferenças com juros e correção monetária

FASE ATUAL (jul/2023):
- Sentença de improcedência
- Apelação desprovida (novembro/2021)
- REsp 1987466/DF admitido (07/02/2022)
- Processo concluso ao Min. Humberto Martins (Relator) no STJ

STATUS: AGUARDANDO JULGAMENTO NO STJ`
});

// ── Ação 4 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_04',
  title: 'Acao 04 Suspensao Efeitos MP 873 2019',
  category: 'acoes_coletivas',
  content: `AÇÃO 4 | Suspensão dos Efeitos da MP 873/2019
Processo: 1007732-68.2019.4.01.3400 (6ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Diretores UNASLAF

OBJETO: Suspender os efeitos da MP 873/2019 e do Decreto 9.735/2019,
determinando à União que mantenha os descontos em folha das mensalidades
associativas solicitadas pela UNASLAF.

RESULTADO: Sentença PROCEDENTE (22/04/2020) — União condenada a restabelecer
a consignação das mensalidades. União interpôs Apelação.

FASE ATUAL (jul/2023):
- Autos remetidos ao Tribunal (22/10/2020)
- Aguardando julgamento

STATUS: EM RECURSO`
});

// ── Ação 5 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_05',
  title: 'Acao 05 Auxilio Transporte Coletiva',
  category: 'acoes_coletivas',
  content: `AÇÃO 5 | Auxílio Transporte Coletiva
Processo: 1004692-44.2020.4.01.3400 (6ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Suspender qualquer ato administrativo que implique exclusão, redução
ou suspensão do auxílio-transporte. Questiona a IN/SGDP/ME nº 207/2019
do Ministério da Economia.

PEDIDOS:
- Declarar inválida a IN/SGDP/ME nº 207/2019
- Garantir o auxílio-transporte independentemente da forma de deslocamento
- Restituição dos valores indevidamente suprimidos

FASE ATUAL (jul/2023):
- Sentença de improcedência (02/08/2021)
- Embargos rejeitados (02/03/2022)
- Apelação da UNASLAF interposta (04/04/2022)
- Redistribuído por sorteio (14/05/2023)

STATUS: EM RECURSO`
});

// ── Ação 6 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_06',
  title: 'Acao 06 Auxilio Transporte Grupo Especifico',
  category: 'acoes_coletivas',
  content: `AÇÃO 6 | Auxílio Transporte — Grupo Específico de Servidores
Processo: 1009517-65.2019.4.01.3400 (22ª Vara Cível da SJDF)
Escritório: Mota Advogados

OBJETO: Suspender atos que impliquem exclusão ou redução do auxílio-transporte
para um grupo específico de servidores listados na petição inicial.

RESULTADO: Sentença PROCEDENTE (12/03/2020) — reconheceu o direito dos
substituídos ao auxílio-transporte sem descontos, mesmo usando transporte próprio.

FASE ATUAL (jul/2023):
- Embargos da União rejeitados (05/03/2021)
- Apelação da União interposta (17/03/2021)
- Redistribuído por dependência ao processo 1016077-38.2019.4.01.0000
- Autos conclusos para decisão (07/02/2022)

STATUS: EM RECURSO — AGUARDANDO JULGAMENTO DA APELAÇÃO DA UNIÃO`
});

// ── Ação 7 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_07',
  title: 'Acao 07 Mandado Seguranca COVID 19 Servico Publico',
  category: 'acoes_coletivas',
  content: `AÇÃO 7 | Mandado de Segurança / COVID-19 / Serviço Público
Processo: 1015579-87.2020.4.01.3400 (4ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: MS preventivo coletivo para suspender atendimentos presenciais
nos CAC e Agências da Receita Federal durante a pandemia de COVID-19,
pelo período mínimo de 15 dias.

RESULTADO:
- Liminar deferida inicialmente
- Segurança denegada (outubro/2020)
- Embargos não acolhidos (14/09/2021)
- ARQUIVADO DEFINITIVAMENTE (19/10/2021)

STATUS: ✗ ARQUIVADO DEFINITIVAMENTE`
});

// ── Ação 8 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_08',
  title: 'Acao 08 PASEP',
  category: 'acoes_coletivas',
  content: `AÇÃO 8 | PASEP
Processo: 0727740-19.2020.8.07.0001 (24ª Vara Cível do TJDF)
Escritório: Mota Advogados | Beneficiários: Lista específica

OBJETO: Ação contra o Banco do Brasil pleiteando diferenças a título de PASEP.
Com a aposentadoria dos servidores, surgiu o direito ao recebimento dos valores
depositados no PIS/PASEP, porém o valor disponibilizado está muito aquém do
que resultaria de tantos anos de rendimentos e atualização monetária.

PEDIDOS: Condenação do Banco do Brasil a pagar os valores devidos em
conformidade com a LC nº 08/1970, Decreto nº 4.751/2003 e Lei nº 9.365/1996.

FASE ATUAL (jul/2023):
- Processo suspenso por decisão do Presidente do STJ (SIRDR nº 9)
- Aguardava trânsito em julgado de IRDRs relacionados

NOTA ATUALIZADA (março/2026): Ação julgada IMPROCEDENTE.

STATUS: ✗ IMPROCEDENTE`
});

// ── Ação 9 ───────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_09',
  title: 'Acao 09 Abono de Permanencia',
  category: 'acoes_coletivas',
  content: `AÇÃO 9 | Abono de Permanência
Processo: 1019847-53.2021.4.01.3400 (6ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Condenação da União ao pagamento das diferenças decorrentes da
inclusão do Abono de Permanência na base de cálculo do Adicional de ⅓
de Férias e da Gratificação Natalina (13º salário).

RESULTADO 1ª INSTÂNCIA: Sentença PROCEDENTE (08/04/2022) — reconheceu
a natureza remuneratória do abono de permanência e determinou sua inclusão
na base de cálculo do terço constitucional de férias e do 13º.

RESULTADO EM RECURSO (junho/2023):
- Apelação da UNASLAF: PROVIDA (base de cálculo dos honorários)
- Apelação da União: NÃO PROVIDA
- STJ (Tema 424): abono de permanência tem natureza remuneratória ✓
- STF (Tema 1.075): impossibilidade de restrição territorial dos efeitos ✓

STATUS: ✓ VITÓRIA EM APELAÇÃO (junho/2023)`
});

// ── Ação 10 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_10',
  title: 'Acao 10 Paridade',
  category: 'acoes_coletivas',
  content: `AÇÃO 10 | Paridade
Processo: 1023229-54.2021.4.01.3400/DF (2ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Condenação da União a revisar aposentadorias e pensões, assegurando
o pagamento de todas as diferenças decorrentes da aplicação da paridade —
nos mesmos índices, vantagens e benefícios atribuídos aos servidores ativos,
inclusive os decorrentes de reenquadramento, reclassificação ou reorganização
de carreiras e cargos públicos.

FASE ATUAL (jul/2023):
- União contestou a ação (03/08/2022)
- Réplica apresentada pela UNASLAF (08/03/2023)
- Aguardando julgamento

STATUS: AGUARDANDO JULGAMENTO`
});

// ── Ação 11 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_11',
  title: 'Acao 11 Reposicao ao Erario',
  category: 'acoes_coletivas',
  content: `AÇÃO 11 | Reposição ao Erário
Processos: 1005217-89.2021.4.01.3400/DF (13ª Vara Cível da SJDF)
           5024330-86.2020.4.03.6100 (17ª Vara Federal de São Paulo)
Escritório: Mota Advogados | Beneficiários: Lista específica

OBJETO: Suspender cobranças a título de reposição ao erário dos valores
objeto da Reclamação Trabalhista nº 0138200-51.1992.5.02.0044
(rubrica RT 1382/92), rescindida pela ação nº 1121900-59.1997.5.02.0000.

FASE ATUAL (jul/2023):
- Processo redistribuído para São Paulo (5007253-93.2022.4.03.6100/SP)
- Agravo de Instrumento interposto (AI 5014983-25.2022.4.03.0000/SP)
- Juízo aguarda julgamento do AI para prosseguir
- Contraminuta juntada em 19/09/2022

STATUS: AGUARDANDO JULGAMENTO DO AGRAVO DE INSTRUMENTO`
});

// ── Ação 12 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_12',
  title: 'Acao 12 Conversao Licenca Premio Nao Gozada em Pecunia',
  category: 'acoes_coletivas',
  content: `AÇÃO 12 | Conversão da Licença Prêmio Não Gozada em Pecúnia
Processo: 1074276-67.2021.4.01.3400/DF (8ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Reconhecimento do direito dos filiados de converter em pecúnia os
períodos de licença-prêmio e/ou licença especial não gozados, no momento
da aposentadoria ou durante o seu gozo. Inclui pedido de não incidência
de IRPF sobre o valor indenizado (Súmula 136/STJ).

FASE ATUAL (jul/2023):
- Juízo indeferiu o pedido formulado e determinou emenda da petição
- Prazo fatal para emenda: 19/07/2023

STATUS: AGUARDANDO EMENDA / JULGAMENTO`
});

// ── Ação 13 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_13',
  title: 'Acao 13 Inexigibilidade IRPF Auxilio Creche',
  category: 'acoes_coletivas',
  content: `AÇÃO 13 | Inexigibilidade do IRPF sobre os Valores de Auxílio-Creche
Processo: 1079393-39.2021.4.01.3400 (5ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Declaração de inexigibilidade do IRPF sobre os valores recebidos
a título de auxílio-creche e assistência pré-escolar, e condenação da União
a restituir os valores cobrados nos últimos 5 anos (com SELIC).

RESULTADO: Sentença PROCEDENTE (17/03/2022) — declarou a não-incidência
do imposto de renda sobre o auxílio-creche. União NÃO recorreu.
TRÂNSITO EM JULGADO: 16/05/2022

STATUS: ✓ VITÓRIA — AGUARDANDO INÍCIO DO CUMPRIMENTO DE SENTENÇA`
});

// ── Ação 14 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_14',
  title: 'Acao 14 Inexigibilidade Quota Participacao Auxilio Creche',
  category: 'acoes_coletivas',
  content: `AÇÃO 14 | Inexigibilidade de Quota de Participação sobre o Auxílio Creche
Processo: 1080942-84.2021.4.01.3400/DF (3ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Declarar a inexigibilidade de quota de participação dos associados
sobre o custeio do auxílio pré-escolar/creche mensalmente recebido, e
determinar à União que retire do contracheque o desconto da quota-parte,
com restituição dos valores descontados.

FASE ATUAL (jul/2023):
- Tutela de urgência indeferida (24/01/2023)
- Com Agravo de Instrumento 1036859-27.2023.4.01.0000
- Aguarda intimação e citação da União

STATUS: AGUARDANDO JULGAMENTO`
});

// ── Ação 15 ──────────────────────────────────────────────────────────────────
DOCS.push({
  id: 'acao_15',
  title: 'Acao 15 Inconstitucionalidade Dobra Teto Contribuicao',
  category: 'acoes_coletivas',
  content: `AÇÃO 15 | Inconstitucionalidade da Dobra do Teto da Contribuição Previdenciária
Processo: 1084980-42.2021.4.01.3400/DF (17ª Vara Cível da SJDF)
Escritório: Mota Advogados | Beneficiários: Rol de associados

OBJETO: Mandado de Segurança para declarar a inconstitucionalidade da exação
que desconsidera a isenção da dobra do teto da contribuição previdenciária,
em desrespeito ao princípio constitucional da anterioridade nonagesimal
(§21, art. 40 da CF, introduzido pela EC nº 103/2019).

FASE ATUAL (jul/2023):
- Entidade confirmou persistência do interesse (15/03/2023)
- Aguarda citação da União

STATUS: AGUARDANDO CITAÇÃO / JULGAMENTO`
});


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

DOCS.push({
  id: 'lista_28_pt1',
  title: 'Lista Associados Acao 28 Parte 01',
  category: 'lista_associados_acao_28',
  content: `LISTA DE ASSOCIADOS – AÇÃO 28% – BASE SANITIZADA

⚠️ USO INTERNO: Consultar apenas por CPF/nome em atendimento autenticado.
A IA não deve exibir esta lista completa ao usuário final.

PARTE 1 (registros 1 a 370):
1;ADAÍS RIBEIRO PEIXOTO;viúva;678.861.248-04
2;ADÉLIA MARIA BARNEZE COSTA;casada;828.192.548-53
3;ADRIANA DE FÁTIMA JANUÁRTO;solteira;005.323.588-64
4;ADRIANA MARIA LEONELLO CASTRO;casada;052.957.728-37
5;AGENOR BUONANNO JÚNIOR;casado;924.468.178-15
6;AÍDA YOUSSIF IBRAIM GONÇALVES;casada;478.015.578-91
7;AÍLTON APARECIDO RODRIGUES;solteiro;039.741.768-37
8;ALBERTO EMILIO GONÇALVES;solteiro;050.891.898-70
9;ALCINO BEZERRA COSTA DA SELVA;casado;015.208.938-17
10;ALEXANDRE THOBIAS;solteiro;107.867.658-52
11;ALMIR LOPES FARIAS;casado;017.847.828-82
12;AMÉRICO ANTONIO ALVES DE CARVALHO;casado;872.869.128-87
13;ANA AMÉLIA ROSSETTO DA SELVA;casada;038.743.358-95
14;ANA CRISTINA DOS SANTOS;divorciada;093.935.258-38
15;ANA CRISTINA PACINI;solteira;051.357.528-62
16;ANA ESMÉRIA DA CONCEIÇÃO CALDAS;casada;826.661.308-78
17;ANA LÚCIA GRANCIERO;desquitada;242.776.818-91
18;ANA MARIA BORTOLOMAI SOARES;casada;826.286.968-00
19;ANA MARIA BULGARELLI FERREIRA ADORNO;solteira;049.609.608-76
20;ANA MARIA ESPOSTO BIONDO;casada;983.130.028-91
21;ANA MARIA MARGOTO BOVO;casada;083.253.428-54
22;ANA REGINA PIMENTA;solteira;784.443.908-44
23;ANÁLIA CRISTINA AUZIER CALVACANTE HARA;casada;829.501.808-68
24;ANDRÉ LUÍS PALOMO DOS SANTOS;casado;068.859.478-65
25;ANDRÉ LUIZ FARIA DE CARVALHO ROCHA;casado;679.098.508-59
26;ANDREA TERESA MICHELI ROCHETTI;casada;021.673.188-71
27;ANGELA MIRIAM ZAMBOM DA SILVA;casada;058.516.638-20
28;ANGELINA ZAMIAN TTOMA;casada;559.081.608-49
29;ANTÔNIA AP. GONZALEZ MENDES BARTOLOMEU;casada;109.401.318-89
30;ANTONIO CARLOS DA SILVA;solteiro;021.947.558-02
31;ANTONIO CARLOS DOS SANTOS;casado;073.797.178-98
32;ANTONIO FIOVARANTE DE MENEZES NETO;casado;058.757.218-39
33;APARECIDA ALICE POLETINI GOMES;casada;051.385.708-70
34;APARECIDA DE ALMEIDA PRADO;divorciada;098.319.138-76
35;APARECIDA DE LOURDES FERREIRA DA CRUZ;casada;022.044.358-05
36;ARMANDO SCAGION FILHO;casado;715.406.528-15
37;ÁUREA RITA DE OLIVEIRA SAMPAIO;casada;015.695.418-41
38;BELARMINA DA CONCEIÇÃO VENANCIO;divorciada;100.888.881-90
39;BENEDICTA SONYA RIBEIRO PARISI;casada;429.323.948-00
40;BENEDITA APARECIDA PRADO NOVELLO;casada;007.304.278-11
41;BENEDITA MARIA DANIEL;divorciada;816.343.238-15
42;CARLOS ALBERTO BOZZA;casado;060.639.828-76
43;CARLOS ALBERTO PATELLI;solteiro;103.623.598-06
44;CARLOS MULLER;casado;363.581.508-04
45;CARMEN LÚCIA FONSECA CLEMENTINO;casada;707.019.628-87
46;CARMEN SÍLVIA MANDOLINI;casada;035.137.898-74
47;CECÍLIA MARIA TILIO ALBERTO VICENTE;solteira;515.152.538-72
48;CECÍLIA REEKO TAMASHIRO ARAKEKI;casada;782.297.158-15
49;CÉLIA APARECIDA ANDRETA DA COSTA;solteira;069.643.248-01
50;CELIA REGINA ZAIA BONETO;casada;075.855.818-07
[Lista completa disponível para consulta interna por CPF/nome mediante autenticação]`
});

DOCS.push({
  id: 'lista_28_pt2',
  title: 'Lista Associados Acao 28 Parte 02',
  category: 'lista_associados_acao_28',
  content: `LISTA DE ASSOCIADOS – AÇÃO 28% – BASE SANITIZADA (PARTE 2)

⚠️ USO INTERNO: Consultar apenas por CPF/nome em atendimento autenticado.
A IA não deve exibir esta lista completa ao usuário final.

PARTE 2 (registros 371 a 487):
371;PAULO ANTONIO BUENO;casado;072.972.628-20
372;PAULO SERGIO CARDOSO;;172.037.688-30
373;PRIMO ANTÔNIO SALVATO;solteiro;038.711.888-83
374;PRISCILA SZUSTER;solteira;860.459.468-04
375;RAMON COSTA NAPOLEÃO;solteiro;375.537.394-72
376;RAQUEL MARIA PERES;solteira;969.674.558-34
377;REGINA APARECIDA JULIANO ANANIAS;casada;045.542.008-41
378;REGINA CELI GARCIA ANDREZZI;casada;774.162.608-68
379;RITA DE CÁSSIA DELGADO DIAS;casada;777.953.508-87
380;RIVALDAR JOSÉ DA SILVA;casado;001.509.818-48
381;ROBERTO CARLOS VIANA;casado;709.817.528-53
382;ROBERTO DOS SANTOS;solteiro;032.088.678-67
383;ROGÉRIA REGINA GALERA DE MENEZES;casada;017.764.788-43
384;ROSA MARIA NOBRE DE OLIVEIRA;casada;958.686.318-20
385;ROSANA DE SOUZA PIRES;casada;231.209.407-04
386;ROSANA MARA VEIGA ARAÚJO;divorciada;029.672.248-04
387;ROSÂNGELA APARECIDA TÓCHETTI PAGIN;casada;052.301.768-57
388;ROSANGELA DIAS DE MORAES MONTE;casada;094.398.248-08
389;ROSELY CORTEZ GALAN;solteira;988.474.148-49
390;ROSI FERNANDES MENDES;casada;059.099.218-00
391;RUTH ASAKO NAKANDAKARE;solteira;653.785.048-72
392;RUTH BONETTI MOSSO;casada;867.414.208-78
393;RUTH NASCIMENTO PENHA MARTINS;casada;990.715.508-00
394;SANDRA APARECIDA SERAFIM;divorciada;025.662.988-90
395;SANDRA MARIA CREPALDI VOLPATO;casada;908.665.178-04
396;SÉRGIO DA SELVA;casado;192.647.718-91
397;SÉRGIO MAURÍCIO DE ARAÚJO;casado;978.464.498-34
398;SHIRLEY BATISTA DIAS;casada;002.167.328-40
399;SILVANA DE CÁSSIA MAIA VAINICKAS;casada;065.974.648-42
400;SILVANA DE FÁTIMA FERRUCI MARCON;casada;005.848.778-62
401;SILVIA APARECIDA DAUDT VIANA;casada;113.214.232-68
402;SILVIA KIYOMI TATEMOTO;solteira;062.063.728-55
403;SILVIA MARA FAGUNDES;casada;867.789.788-72
404;SÍLVIO VALENTIM RODRIGUES;publico;027.952.508-70
405;SOLANGE NUNES LOPES;divorciada;055.163.998-90
406;SOLANGE VIETRI MARTINS;casada;068.806.238-59
407;SÔNIA MARIA BORGES;solteira;930.360.608-63
408;SÔNIA MARIA DA COSTA DO AMARAL;casada;144.178.668-64
409;SÔNIA MARIA DOS SANTOS;solteira;017.919.098-85
410;SUELI APARECIDA RODRIGUES;solteira;843.911.708-68
411;SUELI GARCIA LOBO DA COSTA;casada;844.760.448-91
412;TÂNIA APARECIDA BARBOSA;solteira;074.031.778-43
413;TÂNIA REGINA FERREIRA ROSSI;casada;052.765.918-57
414;TERESA CRISTINA RAMOS BUZON DE SOUZA;casada;079.470.108-62
415;THEREZINHA APARECIDA CROCHIQUIA MUSCOVICK;casada;851.894.308-63
416;UBIRAJARA MORO DE PAULA;casado;025.825.378-96
417;VALDINÉA NATÁLIA DE SOUZA LIMA;solteira;732.792.428-00
418;VALÉRIA CRISTINA PIOLI;solteira;027.866.718-09
419;VÂNIA MARIA DE CARVALHO SANTOS;casada;834.831.288-91
420;VERA LÚCIA DA SILVA RIBEIRO;separada;829.941.298-68
421;VERA LÚCIA DO NASCIMENTO;solteira;809.187.438-34
422;VERA LÚCIA PETRELLI MARTINS;casada;466.751.919-34
423;VERA LUCIA SANCHES CARNEVALE;casada;975.267.548-49
424;VICENTE CORTE;casado;780.832.578-34
425;VILMA APARECIDA DE OLIVEIRA SILVA;casada;604.126.238-20
426;VILNA BATISTA GOMES;casada;369.726.068-53
427;WAGNER AKIO MOROCO SHI;solteiro;048.837.618-19
428;WALDETE ALVES CANCELIERI;casada;902.511.138-68
429;WALDINA LÚCIA DO NASCIMENTO CAYRES;casada;120.190.418-80
430;WATFA CHAMEL ELIAS;solteira;068.646.648-99
431;YARA TRABALLI BOZZI;solteira;338.442.597-91
432;ZELITA GONÇALVES DE OLIVEIRA PINELLI;casada;768.000.598-20`
});


// =============================================================================
// FIM DO ARQUIVO
// Para adicionar novo documento, insira acima desta linha:
// DOCS.push({ id:'novo_id', title:'Título', category:'categoria', content:`conteúdo` });
// =============================================================================

console.log('context-static.js carregado:', DOCS.length, 'documentos em', [
  'regras', 'estatuto', 'regimento', 'adi_4151',
  'portarias (2)', 'ações coletivas (16)', 'processos completo', 'listas 28% (2)'
].join(' | '));
