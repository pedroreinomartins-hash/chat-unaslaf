import { Readable } from 'stream';

export const config = { api: { bodyParser: false } };

async function getAccessToken(credentials) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claim = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const signingInput = `${header}.${claim}`;

  // Importa chave privada via Web Crypto
  const pemKey = credentials.private_key.replace(/\\n/g, '\n');
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Falha ao obter token: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const folderId    = process.env.DRIVE_FOLDER_ID || '12E1qJeYopcT3s9IUGad4t8iFUX-MVPSi';
    const accessToken = await getAccessToken(credentials);

    // Lê o body multipart manualmente
    const rawBody = await getRawBody(req);
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'Boundary não encontrado' });

    const boundary = boundaryMatch[1];
    const parts = rawBody.toString('binary').split('--' + boundary);
    const uploaded = [];

    for (const part of parts) {
      if (!part.includes('Content-Disposition')) continue;
      if (part.trim() === '--') continue;

      const [headerSection, ...bodyParts] = part.split('\r\n\r\n');
      const bodyStr = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '');

      const nameMatch        = headerSection.match(/name="([^"]+)"/);
      const filenameMatch    = headerSection.match(/filename="([^"]+)"/);
      const mimeMatch        = headerSection.match(/Content-Type: ([^\r\n]+)/);

      if (!filenameMatch) continue; // ignora campos que não são arquivo

      const filename = filenameMatch[1];
      const mimeType = mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream';
      const fileBuffer = Buffer.from(bodyStr, 'binary');

      // Upload multipart para o Drive
      const metadata = JSON.stringify({ name: filename, parents: [folderId] });
      const delimiter = '-------unaslaf_boundary';
      const multipartBody = Buffer.concat([
        Buffer.from(`--${delimiter}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
        Buffer.from(`--${delimiter}\r\nContent-Type: ${mimeType}\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${delimiter}--`),
      ]);

      const driveRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${delimiter}`,
            'Content-Length': multipartBody.length,
          },
          body: multipartBody,
        }
      );

      const driveData = await driveRes.json();
      console.log('Drive upload:', driveData);
      uploaded.push({ filename, fileId: driveData.id, status: driveRes.status });
    }

    return res.status(200).json({ success: true, uploaded });

  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
