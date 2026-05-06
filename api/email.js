// Envia código de verificação por e-mail via Resend API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, nome, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: 'E-mail e código obrigatórios' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada' });
  }

  try {
    const res2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UNASLAF <onboarding@resend.dev>',
        to: [email],
        subject: 'Seu código de acesso — UNASLAF',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e2e2e2; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 22px; font-weight: 700; color: #185FA5;">UNASLAF</div>
              <div style="font-size: 13px; color: #666; margin-top: 4px;">Atendimento Virtual</div>
            </div>
            <p style="color: #333; font-size: 15px;">Olá, <strong>${nome || 'associado(a)'}</strong>!</p>
            <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
              Seu código de acesso ao sistema de atendimento virtual da UNASLAF é:
            </p>
            <div style="background: #F0F7FF; border: 2px solid #185FA5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #185FA5;">${codigo}</div>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center; margin-bottom: 8px;">
              Este código é válido por <strong>10 minutos</strong> e é de uso pessoal e intransferível.
            </p>
            <p style="color: #aaa; font-size: 11px; text-align: center;">
              Se você não solicitou este código, ignore este e-mail.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #aaa; font-size: 11px; text-align: center;">
              UNASLAF — Associação Nacional dos Servidores da Extinta Secretaria da Receita Previdenciária<br>
              <a href="https://unaslaf.org.br" style="color: #185FA5;">unaslaf.org.br</a>
            </p>
          </div>
        `,
      }),
    });

    const data = await res2.json();

    if (!res2.ok) {
      console.error('Resend error:', JSON.stringify(data));
      return res.status(res2.status).json({ error: data.message || 'Erro ao enviar e-mail' });
    }

    console.log(`E-mail enviado para ${email}: código ${codigo}`);
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
