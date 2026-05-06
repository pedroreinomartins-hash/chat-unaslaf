// Consulta processual real nos portais dos tribunais
// Usa CPF do associado e CNPJ da UNASLAF como parâmetros

const UNASLAF_CNPJ = '73369795000183';

const TRIBUNAIS = {
  trf1: {
    nome: 'TRF1 — 1ª Região',
    // API pública do TRF1 via MNI/PJe
    urls: [
      cpf => `https://processual.trf1.jus.br/consultaProcessual/pessoa.php?nome=&cpf=${cpf}&enviar=Pesquisar`,
      () => `https://processual.trf1.jus.br/consultaProcessual/pessoa.php?nome=UNASLAF&cpf=${UNASLAF_CNPJ}&enviar=Pesquisar`,
    ],
    portalUrl: 'https://processual.trf1.jus.br/consultaProcessual/processo.php',
  },
  trf2: {
    nome: 'TRF2 — 2ª Região',
    urls: [
      cpf => `https://eproc2g.trf2.jus.br/eproc/externo_controlador.php?acao=processo_consulta_publica&cpf=${cpf}`,
    ],
    portalUrl: 'https://portal.trf2.jus.br/portal/consulta/cons_proc.asp',
  },
  trf3: {
    nome: 'TRF3 — 3ª Região',
    urls: [
      cpf => `https://web.trf3.jus.br/base-textual/Home/ListaColecao/9?np=${cpf}`,
    ],
    portalUrl: 'https://web.trf3.jus.br/base-textual',
  },
  trf4: {
    nome: 'TRF4 — 4ª Região',
    urls: [
      cpf => `https://eproc.trf4.jus.br/eproc2trf4/controlador.php?acao=processo_consulta_publica&cpf_cnpj=${cpf}`,
    ],
    portalUrl: 'https://www.trf4.jus.br/trf4/processos/acompanhamento/consulta_processual.php',
  },
  trf5: {
    nome: 'TRF5 — 5ª Região',
    urls: [
      cpf => `https://eproc1g.trf5.jus.br/eproc/externo_controlador.php?acao=processo_consulta_publica&cpf=${cpf}`,
    ],
    portalUrl: 'https://www.trf5.jus.br',
  },
  trf6: {
    nome: 'TRF6 — 6ª Região',
    urls: [
      cpf => `https://eproc.trf6.jus.br/eproc/externo_controlador.php?acao=processo_consulta_publica&cpf=${cpf}`,
    ],
    portalUrl: 'https://www.trf6.jus.br',
  },
  stj: {
    nome: 'STJ — Superior Tribunal de Justiça',
    urls: [
      cpf => `https://processo.stj.jus.br/SCON/pesquisar.jsp?tipo_visualizacao=RESUMO&b=ACOR&livre=${cpf}`,
      () => `https://processo.stj.jus.br/SCON/pesquisar.jsp?tipo_visualizacao=RESUMO&b=ACOR&livre=UNASLAF`,
    ],
    portalUrl: 'https://processo.stj.jus.br/processo/pesquisa/',
  },
  stf: {
    nome: 'STF — Supremo Tribunal Federal',
    urls: [
      () => `https://portal.stf.jus.br/processos/listarPartes.asp?classe=ADI&numero=4151`,
      cpf => `https://portal.stf.jus.br/processos/listarPartes.asp?cpf=${cpf}`,
    ],
    portalUrl: 'https://portal.stf.jus.br/processos/',
  },
};

async function fetchPortal(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html;
  } catch (e) {
    console.warn('Fetch portal error:', e.message);
    return null;
  }
}

function extractProcessos(html, tribunal) {
  if (!html) return [];
  const processos = [];

  // Padrões comuns de número de processo nos portais
  const patterns = [
    /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g,  // CNJ: 0000000-00.0000.0.00.0000
    /\d{4}\.\d{2}\.\d{2}\.\d{6}-\d/g,           // TRF legado
    /proc[^"]*(\d{5,})[^"]/gi,
  ];

  for (const pattern of patterns) {
    const matches = html.match(pattern);
    if (matches) {
      matches.slice(0, 10).forEach(m => {
        const num = m.replace(/[^0-9.-]/g, '').trim();
        if (num.length > 8 && !processos.includes(num)) processos.push(num);
      });
    }
  }

  // Verifica presença de palavras-chave indicando resultado
  const temResultado = /processo|classe|vara|juiz|distribuição|data/i.test(html);
  const semResultado = /não encontrado|nenhum processo|0 processo|sem resultado/i.test(html);

  return { processos, temResultado, semResultado, htmlLength: html.length };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cpf, nome, tribunal = 'trf1', numProcesso } = req.body;

  if (!cpf && !numProcesso) {
    return res.status(400).json({ error: 'CPF ou número de processo obrigatório' });
  }

  const trib = TRIBUNAIS[tribunal] || TRIBUNAIS.trf1;
  const cpfLimpo = (cpf || '').replace(/\D/g, '');
  const resultados = [];

  // Consulta 1: pelo CPF do associado
  if (cpfLimpo && trib.urls[0]) {
    const url = trib.urls[0](cpfLimpo);
    console.log('Consultando CPF em:', url);
    const html = await fetchPortal(url);
    const extracted = extractProcessos(html, tribunal);
    resultados.push({
      tipo: 'CPF do associado',
      url,
      ...extracted,
    });
  }

  // Consulta 2: pelo CNPJ da UNASLAF (ações coletivas)
  if (trib.urls[1]) {
    const url = trib.urls[1](cpfLimpo);
    console.log('Consultando UNASLAF em:', url);
    const html = await fetchPortal(url);
    const extracted = extractProcessos(html, tribunal);
    resultados.push({
      tipo: 'CNPJ UNASLAF (ações coletivas)',
      url,
      ...extracted,
    });
  }

  // Consulta 3: por número de processo específico
  if (numProcesso) {
    const numLimpo = numProcesso.replace(/\s/g, '');
    const url = `${trib.portalUrl}?proc=${numLimpo}`;
    const html = await fetchPortal(url);
    const extracted = extractProcessos(html, tribunal);
    resultados.push({
      tipo: 'Número de processo',
      url,
      numProcesso: numLimpo,
      ...extracted,
    });
  }

  // Monta resumo para a IA interpretar
  const resumo = resultados.map(r => {
    if (!r.htmlLength) return `• ${r.tipo}: portal não respondeu`;
    if (r.semResultado) return `• ${r.tipo}: nenhum processo encontrado`;
    if (r.processos?.length > 0) return `• ${r.tipo}: processos encontrados — ${r.processos.join(', ')}`;
    if (r.temResultado) return `• ${r.tipo}: página retornou resultados mas números não foram extraídos — verificar manualmente em ${r.url}`;
    return `• ${r.tipo}: consulta realizada, resultado inconclusivo — verificar em ${r.url}`;
  }).join('\n');

  return res.status(200).json({
    tribunal: trib.nome,
    portalUrl: trib.portalUrl,
    cpfConsultado: cpfLimpo,
    cnpjUnaslaf: UNASLAF_CNPJ,
    resumo,
    resultados: resultados.map(r => ({
      tipo: r.tipo,
      url: r.url,
      processos: r.processos,
      temResultado: r.temResultado,
      semResultado: r.semResultado,
    })),
  });
}
