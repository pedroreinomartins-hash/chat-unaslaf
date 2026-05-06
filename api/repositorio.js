// Lista e serve arquivos do repositório de documentos para download

async function getAccessToken(credentials) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now    = Math.floor(Date.now() / 1000);
  const claim  = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const signingInput = `${header}.${claim}`;
  const pemKey  = credentials.private_key.replace(/\\n/g, '\n');
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, Buffer.from(signingInput));
  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Token error: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

// Ícone por tipo de arquivo
function getIcon(mimeType, name) {
  if (mimeType.includes('pdf'))  return '📄';
  if (mimeType.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return '📝';
  if (mimeType.includes('sheet') || name.endsWith('.xlsx') || name.endsWith('.xls')) return '📊';
  if (mimeType.includes('presentation') || name.endsWith('.pptx')) return '📑';
  if (mimeType.includes('image')) return '🖼️';
  return '📎';
}

// Categoria baseada no nome do arquivo
function getCategoria(name) {
  const n = name.toLowerCase();
  if (n.includes('filia')) return 'Filiação';
  if (n.includes('desfilia') || n.includes('cancelamento')) return 'Desfiliação';
  if (n.includes('procura')) return 'Procuração';
  if (n.includes('requerimento') || n.includes('solicit')) return 'Requerimentos';
  if (n.includes('estatuto')) return 'Estatuto';
  if (n.includes('regimento')) return 'Regimento';
  if (n.includes('portaria')) return 'Portarias';
  if (n.includes('formulario') || n.includes('ficha')) return 'Formulários';
  return 'Geral';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const folderId    = process.env.REPO_FOLDER_ID || '1puL9ZzO2OBqm3ZwMe4VO0UiwL8a0Udoi';
    const token       = await getAccessToken(credentials);

    // Lista todos os arquivos da pasta repositório
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const url   = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&pageSize=50&orderBy=name`;

    const listRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listRes.ok) {
      const err = await listRes.json();
      return res.status(listRes.status).json({ error: err.error?.message });
    }

    const data  = await listRes.json();
    const files = (data.files || []).map(f => ({
      id:           f.id,
      name:         f.name,
      mimeType:     f.mimeType,
      size:         f.size ? Math.round(parseInt(f.size) / 1024) + ' KB' : '—',
      modified:     f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : '—',
      downloadUrl:  `/api/download?id=${f.id}`,
      viewUrl:      f.webViewLink,
      icon:         getIcon(f.mimeType, f.name),
      categoria:    getCategoria(f.name),
    }));

    return res.status(200).json({ success: true, total: files.length, files });

  } catch (err) {
    console.error('Repositório error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
