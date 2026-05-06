// context-static.js — gerado a partir do context-data-validado.js
// 25 documentos com conteúdo integral embutido
// Zero chamadas ao Drive — carregado em memória no boot do serverless

const DOCS = [];

// ── Função de busca RAG simples ──────────────────────────────
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

// ── Contexto completo como string ────────────────────────────
export function buildContextString() {
  return DOCS.map(d => `===== ${d.title.toUpperCase()} =====\n${d.content}`).join('\n\n');
}

// ── Documentos ───────────────────────────────────────────────

DOCS.push({ id:'apresentacao', title:'Apresentação Fontes Regras Matriz', category:'regras', content:`BASE DE CONTEXTO E PESQUISA – UNASLAF

FINALIDADE
Este arquivo foi estruturado para alimentar base de conhecimento de agente virtual com IA, com foco em atendimento institucional da UNASLAF, pesquisa contextual e recuperação por embeddings/RAG.

POLÍTICA DE DADOS APLICADA
- Foram excluídos dados pessoais de endereço e documentos de identificação civil.
- Foram mantidos nome, CPF e matrícula SIAPE/matrícula funcional.
- Para atendimento automatizado, NÃO expor listas completas de associados em conversas abertas.
- A IA não deve dar parecer jurídico definitivo. Deve responder de forma institucional e encaminhar casos concretos ao jurídico da UNASLAF.
- Status processuais atualizados até julho/2023. Para andamento atual, consultar PJe/eproc/STF/STJ/TJDFT.

REGRAS DE RESPOSTA:
[REGRA 1] Responder em português do Brasil, tom cordial, institucional e seguro.
[REGRA 2] Não prometer pagamento, prazo, implantação ou vitória judicial.
[REGRA 3] Quando tema for ADI 4151, distinguir: Analista do Seguro Social, Técnico do Seguro Social, ativos, aposentados, pensionistas, redistribuídos e optantes pelo retorno ao INSS.
[REGRA 4] Quando tema for ação coletiva, informar que resposta tem base no relatório de julho/2023 e recomendar confirmação do andamento atual.
[REGRA 5] Pergunta individual ("tenho direito?", "estou na lista?"): verificar CPF/SIAPE em ambiente seguro/autenticado.
[REGRA 6] Não divulgar lista completa de associados. Usar apenas para consulta interna.
[REGRA 7] Se pedir orientação jurídica definitiva: "Essa análise depende da verificação documental individual e deve ser encaminhada ao jurídico da UNASLAF."
[REGRA 9] Conflito entre documento antigo e informação posterior: priorizar informação mais recente validada pela Diretoria/Jurídico.
[REGRA 10] Em dúvida: "Com base nos documentos disponíveis..." ou "O documento analisado indica...".

MATRIZ DE PERTINÊNCIA:
[Alta pertinência] ADI 4151, Portarias 7.243 e 9.546, Relatório de ações coletivas, Estatuto.
[Pertinência condicionada] Regimento Eleitoral (dúvidas eleitorais/assembleias), Lista 28% (consulta interna).
[Baixa pertinência] Conclusões jurídicas individualizadas → encaminhar ao jurídico.` });

DOCS.push({ id:'estatuto', title:'Estatuto UNASLAF Base Operacional', category:'estatuto', content:`ESTATUTO UNASLAF – BASE OPERACIONAL

1. Natureza, denominação, sede e finalidade institucional
- A UNASLAF é associação nacional, pessoa jurídica de direito privado, sem fins econômicos, com duração indeterminada e jurisdição nacional.
- Tem personalidade jurídica distinta da de seus filiados; os associados não respondem ativa, passiva, solidária ou subsidiariamente pelas obrigações da entidade.
- É entidade democrática, sem caráter político-partidário ou religioso, independente e autônoma em relação ao Estado.
- Finalidade geral: defesa, organização, coordenação, proteção de direitos e interesses coletivos e individuais e representação profissional de seus associados.

2. Prerrogativas essenciais da UNASLAF
- Representar os associados perante os poderes públicos e a sociedade.
- Colaborar como órgão técnico e consultivo no estudo e solução de problemas da categoria.
- Organizar e apoiar atividades assistenciais, sociais, científicas, técnicas e culturais.
- Atuar judicial e extrajudicialmente como substituta processual, nos termos constitucionais aplicáveis.
- Defender a democracia, as liberdades individuais e coletivas, o Estado Democrático de Direito, as instituições democráticas e os direitos humanos.
- Propor medidas, encaminhamentos e requerimentos às autoridades administrativas e judiciais quando pertinentes à defesa dos associados.

3. Objetivos institucionais
- Congregar servidores da extinta Secretaria da Receita Previdenciária, ativos e inativos, em defesa de seus direitos.
- Defender interesses dos associados e da categoria profissional perante autoridades e no âmbito administrativo e judicial.
- Promover a unidade, congregação, desenvolvimento social, cultural e comunitário dos associados.
- Manter contato e intercâmbio com entidades públicas e privadas, preservando a autonomia e independência da UNASLAF.
- Defender direitos e interesses profissionais coletivos e individuais dos associados em juízo ou fora dele.
- Encaminhar manifestações, solicitações e pleitos às autoridades.

4. Associados: filiação, categorias e requisitos
- A admissão ao quadro social obedece às normas do Estatuto, mediante proposta própria apresentada à UNASLAF.
- O quadro associativo é composto por associados naturais e participantes.
- Associado natural: servidor que se encontrava em efetivo exercício na Secretaria da Receita Previdenciária ou nas unidades técnicas administrativas a ela vinculadas em 16/03/2007.
- Associado participante: pensionista dos servidores indicados no Estatuto.
- Não podem associar-se os ocupantes do cargo originário de Auditor-Fiscal da Previdência Social.

5. Direitos dos associados
- Participar das Convenções Nacionais, exercendo liberdade de discussão e opinião.
- Frequentar a sede da entidade.
- Gozar dos serviços e benefícios oferecidos indistintamente pela entidade.
- Apresentar propostas e sugestões aos órgãos representativos da UNASLAF.
- Recorrer de atos e decisões que entendam lesivos a seus direitos.
- Votar e ser votado nas eleições da UNASLAF, desde que preenchidas as condições estatutárias.

6. Deveres dos associados
- Cumprir as normas do Estatuto.
- Acatar decisões dos órgãos representativos da entidade.
- Contribuir regularmente com as mensalidades estabelecidas.
- Colocar interesses gerais acima de interesses pessoais ou individuais.
- Apoiar iniciativas da entidade e participar de atividades institucionais.
- Zelar pela imagem da UNASLAF e tratar dirigentes e associados com respeito, dignidade e urbanidade.
- Atender aos princípios do Código de Ética.

7. Sanções disciplinares
- Sanções possíveis: advertência, multa, perda de mandato e exclusão do quadro social.
- Advertência: aplicável, por escrito, pelo Presidente, após decisão do Conselho Executivo.
- Multa: até cinco vezes o valor da mensalidade associativa.
- Perda de mandato: aplicável a associado eleito que deixe de tomar posse, falte injustificadamente, seja declarado inidôneo, etc.
- Exclusão do quadro social: aplicável por reincidência, inadimplência prolongada, atos graves.

8. Processo apuratório do procedimento disciplinar
- O Presidente do Conselho de Ética deve designar relator após tomar conhecimento de transgressões.
- Prazo ordinário de apuração: 30 dias, prorrogável por igual período.
- Da decisão cabe recurso em cinco dias ao Conselho Executivo.

9. Organização da UNASLAF
- Órgãos/poderes: Assembleia Geral, Conselho Executivo, Conselho Fiscal e Conselho de Ética.
- Assembleia Geral é órgão máximo e soberano; delibera matéria de interesse da entidade e elege dirigentes.
- Conselho Executivo é órgão administrador e executor das normas estatutárias e deliberações.

10. Conselho Executivo
- Composto por Presidente, Vice-Presidente, Diretor de Finanças, Diretor de Política de Classe, Diretor de Comunicação Social, Diretor de Assuntos Jurídicos, Diretor de Assuntos Parlamentares e Diretor de Inativos.

11. Receita, despesa e orçamento
- Receita inclui contribuições mensais, rendas de convênios, doações, legados, subvenções, auxílios, rendimentos e outras receitas aprovadas.
- Orçamento anual deve ser elaborado pelo Conselho Executivo, com previsão de receitas e despesas.` });

DOCS.push({ id:'regimento', title:'Regimento Assembleias Processo Eleitoral', category:'regimento_eleitoral', content:`REGIMENTO DAS ASSEMBLEIAS E DO PROCESSO ELEITORAL – BASE OPERACIONAL

1. Assembleias
- Deliberações nas assembleias da UNASLAF são realizadas por voto dos associados naturais.
- Convencionais delegados representantes dos filiados são associados naturais eleitos nos Estados e no Distrito Federal, na proporção de 1 delegado por 30 associados ou fração, respeitado mínimo de 1 delegado por Estado.
- A escolha dos Delegados Estaduais é realizada por reunião de associados naturais, convocada na forma regimental.

2. Época das eleições
- Eleições da UNASLAF devem ocorrer, sempre que possível, com antecedência mínima de 30 dias antes do término do mandato da diretoria em exercício.

3. Elegibilidade
- São elegíveis para Diretoria Executiva, Conselho Fiscal e Conselho de Ética os associados naturais que:
  a) preencham condições estatutárias;
  b) não incorram em impedimentos expressos no regimento;
  c) estejam filiados à UNASLAF por pelo menos 3 anos;
  d) participem de chapa completa registrada.

4. Qualificação do eleitor
- É qualificado como eleitor todo associado natural que, na data de publicação do edital de convocação, esteja em pleno gozo dos direitos sociais e quite com a contribuição mensal.

5. Voto
- Voto é individual, secreto, direto e qualificado.
- Voto pode ser feito por meio de cédula ou sistema eletrônico/correio, conforme regras do edital.

6. Publicação e convocação das eleições
- Eleições são convocadas pelo Presidente da UNASLAF por edital com antecedência mínima de 60 dias.
- Edital deve ser publicado no site oficial.

7. Inscrição de chapas/candidatos e Comissão Eleitoral
- Prazo para inscrição de chapa e candidatos: 20 dias contados da publicação do edital.
- Comissão Eleitoral é designada pelo Presidente; conduz processo de eleição, votação, apuração e proclamação do resultado.

8. Impugnações
- Prazo de impugnação: 3 dias contados da publicação da relação nominal das chapas registradas.
- Impugnação deve versar sobre causas de inelegibilidade previstas no Estatuto ou Regimento.

9. Apuração de votos
- Maioria simples de votos elege a chapa.
- Em caso de empate, realiza-se nova votação limitada às chapas empatadas.

10. Recursos
- Prazo para interposição: 10 dias, contado da divulgação oficial do resultado.

11. Posse
- Posse dos eleitos ocorre após proclamação do resultado, até no máximo o último dia útil do mandato da diretoria em exercício.` });

DOCS.push({ id:'adi_4151', title:'ADI 4151 Base Contexto Respostas', category:'adi_4151', content:`ADI 4151 – BASE DE CONTEXTO E RESPOSTAS

[RESUMO EXECUTIVO]
A ADI 4151 constitui o eixo de defesa jurídica dos servidores redistribuídos da extinta Receita Previdenciária para a Receita Federal do Brasil. A linha institucional da UNASLAF enfatiza a longa jornada legislativa e judicial, a derrubada do Veto 8/2009, o julgamento conjunto das ADIs 4151, 4616 e 6966, o reconhecimento dos Analistas e, posteriormente, a inclusão dos Técnicos via embargos de declaração.

[TESES-CHAVE PARA CHATBOT]
- A tese central envolve a inclusão de cargos previdenciários nos preceitos e efeitos do art. 10, II, da Lei 11.457/2007.
- Analistas do Seguro Social: direito reconhecido com marco temporal de efeitos a partir de 07/04/2022.
- Técnicos do Seguro Social: direito reconhecido com marco temporal de efeitos a partir de 06/09/2024.
- Pagamento em folha desde 01/01/2025.
- Limites: não alcança servidores que optaram voluntariamente pelo retorno ao INSS ou que não foram efetivamente redistribuídos à RFB.
- Tema dos inativos: deve ser tratado com cuidado, considerando segurança jurídica, paridade/integralidade quando aplicável e análise jurídica específica.

[PERGUNTAS E RESPOSTAS SUGERIDAS]
Pergunta: Quem tem direito à ADI 4151?
Resposta: A decisão alcança servidores da carreira do Seguro Social redistribuídos para a Receita Federal do Brasil, incluindo Analistas e Técnicos, observados os limites da decisão e a situação individual de cada servidor.

Pergunta: Qual o marco temporal dos Analistas?
Resposta: Marco de efeitos a partir de 07/04/2022 para Analistas do Seguro Social.

Pergunta: Qual o marco temporal dos Técnicos?
Resposta: Marco de efeitos a partir de 06/09/2024 para Técnicos do Seguro Social. Pagamento em folha desde 01/01/2025.

Pergunta: Quem não é alcançado?
Resposta: Quem optou voluntariamente pelo retorno ao INSS e quem não foi efetivamente redistribuído à Receita Federal do Brasil.

Pergunta: Aposentados e pensionistas estão incluídos?
Resposta: Há portaria administrativa que enquadrou aposentados e instituidores de pensão ocupantes do cargo de Analista do Seguro Social. Para Técnicos e demais situações, é necessária análise individual.

Pergunta: Posso ajuizar ação individual?
Resposta: O associado deve consultar o jurídico da UNASLAF antes de qualquer medida individual, para evitar conflito com a estratégia coletiva.

HISTÓRICO CRONOLÓGICO:
2008 | Ajuizamento da ADI 4151
2007–2021 | A Luta Legislativa: 14 anos de atuação da UNASLAF
19/04/2021 | Marco Histórico: Congresso Nacional derruba o Veto 8 de 2009 (380 votos na Câmara / 50 no Senado)
08/2021 | Ajuizamento da ADI 6966 – Liminar suspendendo derrubada do veto
04/2022 | ADI 6966 – Reforma da Liminar favorável aos Analistas Previdenciários
11/2023 | Julgamento de mérito das ADIs 4151, 4616 e 6966 – ratifica liminar e reconhece direito dos Analistas (omissa quanto aos técnicos)
08/2024 | ADI 4151 – Julgamento dos embargos da UNASLAF – STF reconhece o direito dos Técnicos Previdenciários
09/2024 | ADI 4151 – Embargos de Declaração da AGU
29/10/2025 | Incluído em pauta de 14 a 25/11/2025
13/11/2025 | Retirado de pauta
25/11/2025 | Incluído em pauta de 12 a 19/12/2025
11/12/2025 | Retirado de pauta
18/12/2025 | Incluído em pauta de 13 a 24/02/2026
13/02/2026 | Início julgamento – Voto do relator Ministro GILMAR MENDES acompanhado pelos Ministros CRISTIANO ZANIN E FLÁVIO DINO (TOTAL 3 VOTOS)
23/02/2026 | Julgamento Suspenso com pedido de vista do Ministro Dias Toffoli
04/03/2026 | Incluído em pauta de 13 a 20/03/2026
13/03/2026 | Retorno do julgamento - Voto favorável do Ministro Dias Toffoli (TOTAL 4 VOTOS)
16/03/2026 | JULGAMENTO SUSPENSO com pedido de vista do Ministro Alexandre de Moraes

STATUS ATUAL (março/2026): JULGAMENTO SUSPENSO. Pedido de vista Min. Alexandre de Moraes. 4 votos favoráveis já computados. Ponto central: extensão definitiva dos efeitos para os servidores ativos e inativos e a modulação final dos efeitos financeiros e administrativos.

DIREITOS RECONHECIDOS:
Cargo | Direito Reconhecido? | Marco Temporal (Efeitos)
Analista do Seguro Social | SIM | A partir de 07/04/2022
Técnico do Seguro Social | SIM | A partir de 06/09/2024

LIMITES DA DECISÃO:
01 - Opção de Retorno: Servidores que optaram voluntariamente pelo retorno ao quadro de pessoal do INSS não são beneficiados.
02 - Não Redistribuídos: Servidores que não foram efetivamente redistribuídos à Receita Federal do Brasil.

FUNDAMENTOS: Princípio da Isonomia. Art. 10, II, Lei 11.457/2007. Voto condutor: Min. Gilmar Mendes.

CANAIS OFICIAIS DA UNASLAF:
www.unaslaf.org.br | unaslaf@unaslaf.org.br | WhatsApp - Notas Oficiais` });

DOCS.push({ id:'portaria_7243', title:'Portaria 7243 2022 Analistas Ativos', category:'portarias_enquadramento', content:`PORTARIA 7.243/2022 – ANALISTAS ATIVOS

[USO PARA CHATBOT]
Documento administrativo que enquadra, no cargo de Analista-Tributário da Receita Federal do Brasil, Classe S, Padrão III, servidores então ocupantes do cargo de Analista do Seguro Social, com efeitos a contar de 07/04/2022. A lista nominal contém matrícula SIAPE e nome. O agente pode usar para conferência individual por nome ou SIAPE, evitando divulgação em massa.

PORTARIA DE PESSOAL DGP/SGC/SE/ME Nº 7.243, DE 28 DE JUNHO DE 2022

Art. 1º Enquadrar no cargo de Analista Tributário da Receita Federal do Brasil, Classe S, Padrão III, da Carreira Tributária e Aduaneira da Receita Federal do Brasil, os servidores elencados no anexo desta portaria, os quais atualmente ocupam o cargo de Analista do Seguro Social, com efeitos a contar de 7 de abril de 2022.

LISTA DE ANALISTAS ENQUADRADOS (SIAPE | NOME):
1376007 ADEMIR MIGUEL | 1376019 ADRIANA SATIE OSHIRO | 1378392 ADRIANA SQUERICH STANIECKI | 1451804 ADRIANO KISHIMOTO | 1375281 AILTON DE MELO MESSIAS JUNIOR | 1444748 ALECSANDRA FRANCO DE MELO | 1375125 ALEXANDRE CREMER | 1449803 ALEXANDRE DE LIMA E SILVA | 1376114 ALOISIO BARBOSA CAMPOS | 1451877 ANA CATARINA DE LUCENA | 1440179 ANA KARLA JALES DANTAS | 1379056 ANDERSON JACO MARAN | 1453527 ANDERSON JOSE RIBEIRO SALEME | 1374985 ANDRE GIORDANI SANTOS SILVA | 1453000 ANDREA GRANGEIRO GOMES LEITAO | 1432129 ANDREIA CRISTINA MARQUES OTERO | 1441776 ANGELA BOSSO FARIA BRITO | 1378136 ANGELA REGINA FERNANDES PAVANI | 1450553 ANTONIO CARLOS ROCHA MOREIRA | 1380487 ANTONIO VENANCIO CARDOSO | 1418325 BENARDETE MARIA TOMAZI | 1450030 CARINE GISELE HANKE | 1418718 CARLOS ROBERTO THOME | 1450005 CAROLINA SCIAMARELLI RELA | 1377645 CAROLINA VIVAN CARVALHO | 1379061 CECILIO FELINTO DE OLIVEIRA NETO | 1376613 CELIA MARIA SANCHES LOURINHO QUEIROZ | 1375992 CESAR CARLOS RIBEIRO | 1375953 CHARLES ARAUJO | 1450819 CLAUDIR CORREA LEMOS | 1377932 CLEY ANDERSON DE FREITAS BITTENCOURT | 1376370 CRISTIANE WEIS | 1376424 DAISY LUCI RIBEIRO DE ARAGAO HEREDA | 1378511 DANIEL DE OLIVEIRA LEMOS | 1446246 DANIEL TANIGUCHI | 1376972 DANIELA BARROSO COSTA BADARO | 1351009 DANIELA GODOY DE VASCONCELLOS | 1377227 DANIELE MAIA TOURAO | 1380134 DANNIELLI DONINI CAMPOLIM | 1376218 DENISE MARTINEZ GONCALVES | 1435325 DIEGO MARTINES SENGER | 1376661 DORIS BECK PAMPLONA SOARES | 1378508 EDIMAR RIBEIRO AMORIM | 1432850 EDUARDO SANTOS FELISMINO | 1451654 EDVAN TEIXEIRA DE SOUSA | 1450471 ELIZABETH AURELIA DE ANTONI | 1376652 ELZA HELENA MARTINS FONTANA | 1450248 EMANUELLE SILVA PEDREIRA | 1442793 EMILIA MARIA DE SANTANA | 1379914 ENEDINA PINHEIRO SIMAO AZEVEDO | 1452771 EVERSON JAIR CASAGRANDE MOREIRA | 1377393 FABIANA CRISTINA DE MELLO | 1420697 FABIANA DE TONI MARQUES DE OLIVEIRA | 1361701 FABIO DOS ANJOS BARBOSA | 1426182 FERNANDA MION CRUZ | 1376198 FLAVIA MARIA RUBACK CASCARDO DE ALMEIDA | 1450017 FLAVIA SILVA BARBOSA | 1418658 FLAVIA TAZINAFFO RODRIGUES DE FARIA | 1375911 FLAVIANA DE CARVALHO CHAVES DUTRA | 1098434 FRANCISCO VALDILEME RIBEIRO MOTA | 1450205 GEIZA CELESTE DA SILVA ASSUNCAO | 1379286 GEORGE CAVALCANTI CAMELO | 1380280 GLACYELLE BECE SIMOES GAHIVA | 1380819 GRAZIELA PIMENTEL | 1376846 GRAZIELLE DA HORA BARAUNA | 1420286 GUILHERME BRUNOW NOGUEIRA | 1377428 HELMUT FERNANDO ROLKE | 1379742 ISABELA DE SA BEZ GRAHL | 1437745 ISABELE CRISTINA BARBERO PERES BALDISERA | 1449804 IVANI DAS GRACAS DAL PRA LAZAROTTO | 1376741 JACKELINE NUNES DA SILVA | 1418142 JEFERSON BARBOSA BARRIONUEVO | 1425198 JOANA DARC DOS SANTOS NASCIMENTO | 1379502 JOAO DE SOUSA MOTA NETO | 1450969 JORGE PEDRO BANDEIRA DORES | 1418737 JOSE ANTONIO BAPTISTA DE ABREU | 1452346 JOSE DONIZETE DE PAULA | 1376319 JOSE TAIRONE RODRIGUES DA SILVA | 1375290 JOSILENE GIOVANA IDALGO BALBINO BELFORT | 1376388 JULIANA FIASCHI DOTTO | 1452721 JULIANA WOHLGEMUTH FLEURY VELOSO DA SILVEIRA | 1285610 JULIANO BATISTA BOHNERT | 1418477 KAMILLE MARIA CORDEIRO FERNANDES | 1378816 KARINA CRESTANI DE SOUZA MEGALE | 1378853 KARINA MARANHA | 1379690 KIYOKA YONEYA GENDA | 1377433 KLEBER MOURA DO NASCIMENTO | 1450047 LECI MARTINS BARBOSA | 1377136 LILIAN CRISTINA SALDANHA | 1377983 LUCIANA APARECIDA DA SILVA | 1452965 LUCIANA TREVENZOLI VALLE | 1450910 LUCIANE DE FATIMA SOUZA DA SILVA | 1451162 LUIZ ANTONIO TELO | 1380193 LUIZ HENRIQUE VILLAR GUIMARAES | 0941679 LUIZA HELENA ULIANO | 1377115 MAGALI APARECIDA FLORENCIO RAZERA | 1377036 MARCELO DOMINGUES LEMOS | 1451223 MARCELO GOMES DA SILVA | 1378916 MARCELO MORGANTE | 0910657 MARCO ANTONIO FIGUEIREDO | 1453823 MARCOS SOUZA OLIVEIRA | 1376715 MARIA FERNANDA VASQUES LESSA | 1374992 MARIA JOSE SOUZA DE MOURA | 0933763 MARIA PERPETUO SOCORRO NOVAES SOUTO | 1377330 MARIA SALETE COSTA | 1376204 MARLEY FERNANDA ARAUJO RABELLO MEDINA | 1377838 MARTHA DE CARVALHO BRESSER DORES | 1378351 MARTHA FRANCA CAMARA | 1449864 MAURA RIGON MACHADO | 1440123 MICHELE NAIRA SALOMAO | 1420132 MILTON NOBUHIRO ITAGAKI | 1377500 MURILO VIOLA | 1450113 NAIR SANAE KIYOTA | 1377945 NANCY YARA GRILLI | 1378934 NELSON PEREIRA VILASBOAS | 1418392 ODAMIR FEITOSA DE SA FILHO | 1375364 OLGA MARIA CARDOSO DE SOUZA | 1443462 OSCAR FERNANDO DE MATTOS FILHO | 1445465 OSVALDO YOSHIHARU HIRAMA | 1446275 PATRICIA CINTIA MACHADO | 1375940 PRISCILA NUBIA DA SILVA | 1445723 RAQUEL CRISTINA DARONCO RADIS | 1449868 RENATA APARECIDA AGUIAR DA SILVA | 1450637 RENATA PESTILHO SENNA | 1376654 RITA MARIA CRUZ FREITAS | 1379224 ROBSON RODRIGUES MACHADO | 1377461 ROCICLENE DE ALMEIDA BARBOSA | 1377068 RODRIGO TELLES CORREIA DAS NEVES | 1375787 RODRIGO VARELLA DOTTO | 1374682 ROMERO MOREIRA PIMENTEL | 1420811 RONI RODRIGUES DE SOUZA | 1418778 ROSANGELA SANTOS PEREIRA SILVA | 1460236 RUTILEIA DE SOUSA AGUIAR | 1420986 SABURO MORIYA | 1451188 SAMANTHA MARA BROCCO SILVA CARDOSO | 1418201 SAMANTHA SILVEIRA CORREA DE MELO | 1376306 SANDRA ALVES CRUZ MENDONCA | 1420765 SANDRA SILVA ACRAS | 1375822 SANDRO NERY DORTAS MONTARGIL | 1378514 SERGIO LUIS DA SILVA | 1451392 SERGIO LUIZ HAGEMANN | 1376777 SIMONE APARECIDA DE OLIVEIRA BUENO | 1452575 SIMONE CRISTINA VALENTIM DE PAULA BARRETO | 1450989 SOLANGE APARECIDA VIANNA CARECHO | 1375736 TATIANA FLORAO CORREA | 1450461 TERENCE FERNANDEZ XAVIER | 1376906 THELMA COLOMBO BOLLA | 1451482 TIAGO DE CASTRO RUBIATTI | 1377298 VALNI DE SOUZA | 1379182 VICENTE ARAUJO DE SOUZA VERAS NETO | 1376103 WILLIAN ANDRADE SERAFIM | 1377600 WOLFGANG ADOLFO FIEDLER` });

DOCS.push({ id:'portaria_9546', title:'Portaria 9546 2022 Aposentados Pensionistas', category:'portarias_enquadramento', content:`PORTARIA 9.546/2022 – ANALISTAS APOSENTADOS E INSTITUIDORES DE PENSÃO

[USO PARA CHATBOT]
Documento administrativo que enquadra servidores aposentados e instituidores de pensão ocupantes do cargo de Analista do Seguro Social no cargo de Analista-Tributário da Receita Federal do Brasil, com efeitos a partir de 07/04/2022.

PORTARIA DE PESSOAL DGP/SGC/SE/ME Nº 9.546, DE 19 DE AGOSTO DE 2022

Art. 1º Enquadrar os servidores aposentados e instituidores de pensão ocupantes do cargo de Analista do Seguro Social, no cargo de Analista Tributário da Receita Federal do Brasil, nas respectivas Classes e Padrões, com efeitos a partir de 7 de abril de 2022.

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
SHEILA MONIQUE SOUTO LEITE NAJAR | 0753562 | APOSENTADO | S-III` });

DOCS.push({ id:'acoes_indice', title:'Relatorio Acoes Coletivas Indice Alerta', category:'relatorio_acoes_indice', content:`RELATÓRIO DAS AÇÕES COLETIVAS – JULHO/2023

[ALERTA DE ATUALIZAÇÃO]
O relatório de ações coletivas está atualizado em julho/2023. O chatbot pode explicar o histórico, objeto e fase indicada no relatório, mas deve advertir que o andamento atual precisa ser confirmado nos sistemas processuais ou com a assessoria jurídica.

[ÍNDICE COMPLETO DAS 15 AÇÕES IDENTIFICADAS]

1. Assunto: Adicional de Fronteira | Processo: 1022299-41.2018.4.01.3400 (22ª Vara Cível da SJDF)
2. Assunto: IN nº 02/2018 – Jornada de Trabalho/Abono de Ponto | Processo: MS Coletivo 1024043-71.2018.4.01.3400 (2ª Vara Cível da SJDF)
3. Assunto: Danos Materiais GEAP | Processo: 1012481-65.2018.4.01.3400 (21ª Vara Cível da SJDF)
4. Assunto: Suspensão dos Efeitos da MP 873/2019 | Processo: 1007732-68.2019.4.01.3400 (6ª Vara Cível da SJDF)
5. Assunto: Auxílio Transporte Coletiva | Processo: 1004692-44.2020.4.01.3400 (6ª Vara Cível da SJDF)
6. Assunto: Auxílio Transporte (grupo específico de servidores) | Processo: 1009517-65.2019.4.01.3400 (22ª Vara Cível da SJDF)
7. Assunto: Mandado de Segurança/COVID-19/Serviço Público | Processo: 1015579-87.2020.4.01.3400 (4ª Vara Cível da SJDF)
8. Assunto: PASEP | Processo: 0727740-19.2020.8.07.0001 (24ª Vara Cível da SJDF)
9. Assunto: Abono de Permanência | Processo: 1019847-53.2021.4.01.3400 (6ª Vara Cível da SJDF)
10. Assunto: Paridade | Processo: 1023229-54.2021.4.01.3400/DF (2ª Vara Cível da SJDF)
11. Assunto: Reposição ao erário | Processo: 1005217-89.2021.4.01.3400/DF (13ª Vara Cível da SJDF)
12. Assunto: Conversão da licença prêmio não gozada em pecúnia | Processo: 1074276-67.2021.4.01.3400/DF (8ª Vara Cível da SJDF)
13. Assunto: Inexigibilidade do IRPF sobre valores de auxílio-creche | Processo: 1079393-39.2021.4.01.3400 (5ª Vara Cível da SJDF)
14. Assunto: Inexigibilidade de quota de participação sobre o auxílio creche | Processo: 1080942-84.2021.4.01.3400/DF (3ª Vara Cível da SJDF)
15. Assunto: Inconstitucionalidade e inexigibilidade de exação (dobra do teto da contribuição previdenciária) | Processo: 1084980-42.2021.4.01.3400/DF (17ª Vara Cível da SJDF)` });

DOCS.push({ id:'acao_01', title:'Acao 01 Adicional de Fronteira', category:'acoes_coletivas', content:`AÇÃO 1 | Adicional de Fronteira
Processo: 1022299-41.2018.4.01.3400 (22ª Vara Cível da SJDF)

OBJETO: Ação Ordinária proposta pela UNASLAF em desfavor da União Federal, com o desiderato de garantir aos servidores integrantes da Carreira do Seguro Social redistribuídos para a Secretaria da Receita Federal do Brasil (RFB) a percepção da indenização a ser concedida ao servidor em exercício nas unidades da RFB, situadas em localidades estratégicas, vinculadas à prevenção, controle, fiscalização e repressão dos delitos transfronteiriços, de que trata a Lei nº 12.855, de 02 de setembro de 2013.

PEDIDOS: i) concessão de tutela de urgência para implementação imediata; ii) condenação da União na obrigação de fazer concernente à implementação definitiva; iii) condenação da União ao pagamento das parcelas vencidas desde a data de publicação do Decreto Regulamentador n. 9.227/2017 (06/12/2017).

FASE ATUAL (jul/2023):
- Sentença de improcedência (abril/2020)
- Embargos de Declaração Não-acolhidos (25/01/2021)
- Recurso de Apelação apresentado (13/07/2021)
- Juntada de Contrarrazões (21/07/2021)
- REDISTRIBUÍDO POR SORTEIO EM RAZÃO DE CRIAÇÃO DE UNIDADE JUDICIÁRIA (14/05/2023)
- Mérito pendente de julgamento no TRF1` });

DOCS.push({ id:'acao_02', title:'Acao 02 IN 02 2018 Jornada Trabalho Abono Ponto', category:'acoes_coletivas', content:`AÇÃO 2 | IN nº 02/2018 – Jornada de Trabalho/Abono de Ponto
Processo: MS Coletivo 1024043-71.2018.4.01.3400 (2ª Vara Cível da SJDF)

OBJETO: Mandado de Segurança proposto pela UNASLAF contra ato do Secretário de Gestão de Pessoas do Ministério do Planejamento, Desenvolvimento e Gestão (MPDG), requerendo: i) concessão de liminar para que seja suspenso o artigo 36 da IN n. 02/2018; ii) no mérito, a nulidade do artigo 36 da Instrução Normativa n. 02/2018, possibilitando a dispensa de ponto dos servidores dirigentes filiados/associados à entidade Impetrante, para participação em atividades e eventos promovidos pela UNASLAF sem a necessidade de compensação das horas não trabalhadas, nos termos da Portaria RFB n. 631/2013.

FASE ATUAL (jul/2023):
- Liminar indeferida
- Sentença de improcedência (novembro/2021)
- Sentença de Embargos negando-lhes provimento (29/11/2022)
- Recurso de Apelação da entidade interposto (02/02/2023)` });

DOCS.push({ id:'acao_03', title:'Acao 03 Danos Materiais GEAP', category:'acoes_coletivas', content:`AÇÃO 3 | Danos Materiais GEAP
Processo: 1012481-65.2018.4.01.3400 (21ª Vara Cível da SJDF) → redistribuído para TJDFT

OBJETO: Ação proposta pela UNASLAF em desfavor da União Federal e da GEAP – Autogestão em Saúde, na qual questiona a legalidade das Resoluções/GEAP/CAND nº 99/2015, 168/2016 e 269/2017 que alteram a sistemática de contribuições mensais devidas pelos servidores para o financiamento do Plano de Saúde mantido pela referida entidade.

PEDIDOS: i) tutela de urgência para suspender aumentos; ii) condenação das rés na ilegalidade das Resoluções; iii) ressarcimento das diferenças com juros e correção monetária.

FASE ATUAL (jul/2023):
- Sentença de improcedência dos pedidos
- Apelação desprovida (novembro/2021)
- REsp 1987466/DF admitido (07/02/2022)
- Processo concluso para decisão ao Ministro HUMBERTO MARTINS (Relator) no STJ` });

DOCS.push({ id:'acao_04', title:'Acao 04 Suspensao Efeitos MP 873 2019', category:'acoes_coletivas', content:`AÇÃO 4 | Suspensão dos Efeitos da MP 873/2019
Processo: 1007732-68.2019.4.01.3400 (6ª Vara Cível da SJDF)

OBJETO: Ação para suspender os efeitos da Medida Provisória 873, de 1º de março de 2019 e do Decreto 9.735 de 22 de março de 2019, determinando-se à demandada que mantenha os descontos/consignações em folha das mensalidades/contribuições associativas solicitadas pela autora.

RESULTADO: Sentença PROCEDENTE (22/04/2020) – União condenada a restabelecer a consignação em pagamento das mensalidades. União interpôs recurso de Apelação.

FASE ATUAL (jul/2023):
- Remetidos os Autos (em grau de recurso) de 6ª Vara Federal Cível da SJDF para Tribunal (22/10/2020)
- Aguardando julgamento` });

DOCS.push({ id:'acao_05', title:'Acao 05 Auxilio Transporte Coletiva', category:'acoes_coletivas', content:`AÇÃO 5 | Auxílio Transporte Coletiva
Processo: 1004692-44.2020.4.01.3400 (6ª Vara Cível da SJDF)

OBJETO: Ação para suspender qualquer ato administrativo que implique exclusão, redução ou suspensão do pagamento do auxílio-transporte na remuneração dos servidores associados à entidade autora. Questiona a IN/SGDP/ME n. 207/2009 do Ministério da Economia.

PEDIDOS: i) declarar inválida a IN/SGDP/ME n. 207/2019; ii) declarar o direito dos associados à percepção do auxílio-transporte independentemente da forma de deslocamento (veículo próprio ou coletivo); iii) restituição dos valores indevidamente suprimidos.

FASE ATUAL (jul/2023):
- Sentença de improcedência (02/08/2021)
- Sentença dos embargos – rejeição (02/03/2022)
- Recurso de Apelação da UNASLAF interposto (04/04/2022)
- REDISTRIBUÍDO POR SORTEIO (14/05/2023)` });

DOCS.push({ id:'acao_06', title:'Acao 06 Auxilio Transporte Grupo Especifico', category:'acoes_coletivas', content:`AÇÃO 6 | Auxílio Transporte (grupo específico de servidores)
Processo: 1009517-65.2019.4.01.3400 (22ª Vara Cível da SJDF)

OBJETO: Ação para suspender qualquer ato administrativo que implique a exclusão, redução ou suspensão do pagamento do auxílio transporte na remuneração dos servidores listados na petição inicial.

RESULTADO: Sentença PROCEDENTE (12/03/2020) – reconheceu o direito dos substituídos à percepção da vantagem "auxílio-transporte" sem a incidência de descontos remuneratórios, ainda que a despesa decorra de gastos efetuados em deslocamento usando meio próprio de transporte.

FASE ATUAL (jul/2023):
- Sentença dos Embargos da União – rejeição (05/03/2021)
- Recurso de Apelação da União interposto (17/03/2021)
- Redistribuído por dependência ao processo 1016077-38.2019.4.01.0000 (Desembargadora Federal MARIA MAURA MARTINS MORAES TAYER)
- Autos conclusos para decisão (07/02/2022)` });

DOCS.push({ id:'acao_07', title:'Acao 07 Mandado Seguranca COVID 19 Servico Publico', category:'acoes_coletivas', content:`AÇÃO 7 | Mandado de Segurança/COVID-19/Serviço Público
Processo: 1015579-87.2020.4.01.3400 (4ª Vara Cível da SJDF)

OBJETO: Mandado de Segurança preventivo coletivo, impetrado pela UNASLAF, requerendo o reconhecimento do direito líquido e certo para que a autoridade impetrada suspenda os atendimentos presenciais abertos ao público pelo período mínimo de 15 dias nos Centros de Atendimento ao Contribuinte (CAC), bem como nas Agências da Receita Federal do Brasil, durante a pandemia de COVID-19.

FASE ATUAL:
- Liminar deferida inicialmente
- Segurança denegada (outubro/2020)
- Embargos de Declaração Não-acolhidos (14/09/2021)
- ARQUIVADO DEFINITIVAMENTE (19/10/2021)

STATUS: ARQUIVADO` });

DOCS.push({ id:'acao_08', title:'Acao 08 PASEP', category:'acoes_coletivas', content:`AÇÃO 8 | PASEP
Processo: 0727740-19.2020.8.07.0001 (24ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento da entidade em desfavor do Banco do Brasil para pleitear as diferenças a título de PASEP. Com a superveniência da aposentadoria dos servidores associados, surgiu o direito ao recebimento dos valores depositados nos programas PIS/PASEP, porém o valor disponibilizado está muito aquém do que resultaria tantos anos de rendimentos e atualização monetária.

PEDIDOS: Condenação do Banco do Brasil a pagar os valores devidamente atualizados da conta PASEP dos associados da entidade autora, em conformidade com a LC nº 08/1970; Decreto nº 4.751/2003; Lei nº 9.365/1996.

FASE ATUAL (jul/2023):
- Processo SUSPENSO por Decisão do Presidente do STJ em razão da SIRDR número 9
- Aguarda trânsito em julgado da decisão a ser proferida em qualquer dos IRDRs 0720138-77/TJDFT, 0010218-16/TJTO, 0812604-05/TJPB ou 0756585-58/TJPI

NOTA ATUALIZADA (março/2026): Ação julgada IMPROCEDENTE.

STATUS: SUSPENSO/IMPROCEDENTE` });

DOCS.push({ id:'acao_09', title:'Acao 09 Abono de Permanencia', category:'acoes_coletivas', content:`AÇÃO 9 | Abono de Permanência
Processo: 1019847-53.2021.4.01.3400 (6ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento que pretende a condenação da União no pagamento das diferenças remuneratórias decorrentes do direito dos servidores públicos federais associados da Autora à inclusão do Abono de Permanência na base de cálculo do adicional de um Terço de Férias e da Gratificação Natalina (13º).

RESULTADO: Sentença PROCEDENTE (08/04/2022) – Reconheceu a natureza remuneratória do abono de permanência e determinou sua inclusão na base de cálculo do terço constitucional de férias e da gratificação natalina.

RESULTADO DO RECURSO (junho/2023): Apelação – Sentença reformada em parte. Honorários devem incidir sobre o valor da condenação.

- STF (Tema 1.075): impossibilidade de restrição dos efeitos da sentença aos limites de competência territorial.
- STJ (Tema 424): abono de permanência possui natureza remuneratória.
- Apelação da União: NÃO PROVIDA
- Apelação da UNASLAF: PROVIDA (base de cálculo dos honorários)

STATUS: VITÓRIA EM APELAÇÃO (junho/2023)` });

DOCS.push({ id:'acao_10', title:'Acao 10 Paridade', category:'acoes_coletivas', content:`AÇÃO 10 | Paridade
Processo: 1023229-54.2021.4.01.3400/DF (2ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento objetivando a condenação da União a proceder a REVISÃO de aposentadorias e pensões dos servidores públicos federais representados/substituídos pela AUTORA, a fim de assegurar-lhes o pagamento de todas as diferenças de proventos e pensões decorrentes da aplicação do instituto da paridade nos mesmos índices, vantagens, benefícios, inclusive os decorrentes de reenquadramento, reclassificação, redenominação ou reorganização das carreiras e cargos públicos, da mesma e igual forma e valores atribuídos aos servidores ativos.

FASE ATUAL (jul/2023):
- União contestou a ação (03/08/2022)
- Réplica apresentada pela UNASLAF (08/03/2023)
- Aguardando julgamento` });

DOCS.push({ id:'acao_11', title:'Acao 11 Reposicao ao Erario', category:'acoes_coletivas', content:`AÇÃO 11 | Reposição ao Erário
Processos: 1005217-89.2021.4.01.3400/DF (13ª Vara Cível da SJDF) e 5024330-86.2020.4.03.6100 (17ª Vara Federal de São Paulo)

OBJETO: Ação de conhecimento que pretende a condenação da União nos seguintes pedidos: a) deferimento da tutela de urgência para suspensão de quaisquer pagamentos a título de reposição ao erário dos valores objeto da Reclamação Trabalhista nº 0138200-51.1992.5.02.0044 – rubrica RT 1382/92 – rescindida pela ação nº 1121900-59.1997.5.02.0000, exigidos dos associados ora representados.

FASE ATUAL (jul/2023):
- Processo foi redistribuído para São Paulo (5007253-93.2022.4.03.6100/SP)
- Entidade interpôs Agravo de Instrumento (AI 5014983-25.2022.4.03.0000/SP)
- O juízo aguarda o julgamento do Agravo de Instrumento para prosseguir no julgamento da ação
- Contraminuta juntada em 19/09/2022
- Recurso aguarda análise do pedido de efeito suspensivo` });

DOCS.push({ id:'acao_12', title:'Acao 12 Conversao Licenca Premio Nao Gozada em Pecunia', category:'acoes_coletivas', content:`AÇÃO 12 | Conversão da Licença Prêmio Não Gozada em Pecúnia
Processo: 1074276-67.2021.4.01.3400/DF (8ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento que pretende a condenação da União nos seguintes pedidos: a) reconhecimento do direito dos filiados à entidade autora de converter em pecúnia os períodos de licença-prêmio e/ou licença especial, conquistados e não gozados, no momento de sua aposentadoria ou durante o seu gozo; b) condenação da União no pagamento dos valores devidos; c) determinação da não incidência do Imposto de Renda da Pessoa Física (IRPF) sobre o valor indenizado (Súmula 136/STJ).

FASE ATUAL (jul/2023):
- Juízo indeferiu o pedido formulado pela entidade e determinou a emenda
- Prazo fatal para emenda: 19/07/2023` });

DOCS.push({ id:'acao_13', title:'Acao 13 Inexigibilidade IRPF Auxilio Creche', category:'acoes_coletivas', content:`AÇÃO 13 | Inexigibilidade do IRPF sobre os Valores de Auxílio-Creche
Processo: 1079393-39.2021.4.01.3400 (5ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento que pretende: a) a declaração da inexigibilidade do Imposto de Renda da Pessoa Física (IRPF) sobre os valores recebidos pelos filiados da autora a título de auxílio-creche e assistência pré-escolar; b) condenação da União a restituir os valores já cobrados a esse título nos últimos cinco anos, com juros e correção monetária pela TAXA SELIC.

RESULTADO: Sentença PROCEDENTE (17/03/2022) – Declarou a não-incidência do imposto de renda sobre o auxílio-creche pago aos representados. União não recorreu.

TRÂNSITO EM JULGADO: 16/05/2022
STATUS: VITÓRIA — AGUARDANDO INÍCIO DO CUMPRIMENTO DE SENTENÇA` });

DOCS.push({ id:'acao_14', title:'Acao 14 Inexigibilidade Quota Participacao Auxilio Creche', category:'acoes_coletivas', content:`AÇÃO 14 | Inexigibilidade de Quota de Participação sobre o Auxílio Creche
Processo: 1080942-84.2021.4.01.3400/DF (3ª Vara Cível da SJDF)

OBJETO: Ação de conhecimento que pretende: 1) declarar a inexigibilidade de quota de participação dos associados da entidade autora sobre o custeio do auxílio pré-escolar e/ou creche mensalmente recebido; 2) determinar à União que retire do contracheque dos substituídos a consignação do débito da quota parte; 3) condenar a União a pagar os valores descontados, excluídas as parcelas prescritas, com correção monetária e juros.

FASE ATUAL (jul/2023):
- Tutela urgência indeferida (24/01/2023)
- Aguarda intimação da decisão e a ordem de citação da União` });

DOCS.push({ id:'acao_15', title:'Acao 15 Inconstitucionalidade Dobra Teto Contribuicao', category:'acoes_coletivas', content:`AÇÃO 15 | Inconstitucionalidade e Inexigibilidade de Exação (Dobra do Teto da Contribuição Previdenciária)
Processo: 1084980-42.2021.4.01.3400/DF (17ª Vara Cível da SJDF)

OBJETO: Mandado de Segurança para: a) declarar a inconstitucionalidade da exação pretendida pela Administração Pública Federal que desconsidera a isenção da dobra do teto da contribuição, proventos e pensões dos servidores ora substituídos e seus pensionistas, sem a observância do período nonagesimal; b) determinar que a autoridade impetrada suspenda imediatamente a cobrança dos valores pretendidos a título de contribuição social para o RPPS em desrespeito ao princípio constitucional da anterioridade nonagesimal (§21, art. 40 da CF, introduzido pela EC nº 103/2019).

FASE ATUAL (jul/2023):
- Entidade confirmou persistência do interesse no processamento (15/03/2023)
- Aguarda citação da União` });

export { DOCS };

DOCS.push({ id:'lista_28_pt1', title:'Lista Associados Acao 28 Parte 01', category:'lista_associados_acao_28', content:`LISTA DE ASSOCIADOS – AÇÃO 28% – BASE SANITIZADA

[USO PARA CHATBOT]
Lista de referência nominal para consulta interna da ação dos 28%.
Campos mantidos: número, nome, estado civil e CPF.
A IA não deve exibir a lista completa ao usuário final. Deve consultar apenas por CPF/nome informado em atendimento autenticado.

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
[Lista completa disponível para consulta interna por CPF/nome mediante autenticação]` });

DOCS.push({ id:'lista_28_pt2', title:'Lista Associados Acao 28 Parte 02', category:'lista_associados_acao_28', content:`LISTA DE ASSOCIADOS – AÇÃO 28% – BASE SANITIZADA (PARTE 2)

[USO PARA CHATBOT]
Continuação da lista de referência nominal para consulta interna da ação dos 28%.
A IA não deve exibir a lista completa ao usuário final. Deve consultar apenas por CPF/nome informado em atendimento autenticado.

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
432;ZELITA GONÇALVES DE OLIVEIRA PINELLI;casada;768.000.598-20` });

console.log('context-static.js carregado com', DOCS.length, 'documentos');
