export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const instance    = process.env.ZAPI_INSTANCE;
  const token       = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  // Mostra o que o Vercel está lendo das variáveis (sem expor valores completos)
  const debug = {
    ZAPI_INSTANCE:     instance    ? `OK (${instance.slice(0,6)}...)` : 'NÃO DEFINIDO',
    ZAPI_TOKEN:        token       ? `OK (${token.slice(0,6)}...)` : 'NÃO DEFINIDO',
    ZAPI_CLIENT_TOKEN: clientToken ? `OK (${clientToken.slice(0,6)}...)` : 'NÃO DEFINIDO',
  };

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'variáveis carregadas', debug });
  }

  // POST: tenta enviar mensagem de teste
  const phone   = req.body?.phone || '5519991899977';
  const message = '🔧 Teste de diagnóstico UNASLAF';

  try {
    const url = `https://api.z-api.io/instances/${instance}/token/${token}/send-text`;
    console.log('Chamando Z-API:', url);
    console.log('client-token:', clientToken ? clientToken.slice(0,8)+'...' : 'VAZIO');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-token': clientToken || '',
      },
      body: JSON.stringify({ phone, message }),
    });

    const data = await response.json();
    console.log('Z-API retornou:', response.status, JSON.stringify(data));

    return res.status(200).json({
      debug,
      zapi_status: response.status,
      zapi_response: data,
    });

  } catch (err) {
    console.error('Erro:', err.message);
    return res.status(500).json({ debug, error: err.message });
  }
}
