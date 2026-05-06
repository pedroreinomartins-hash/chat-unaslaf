# UNASLAF App — Atendente Virtual do Associado

Sistema web de atendimento ao associado com autenticação via WhatsApp (Z-API) e chat com IA.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML/CSS/JS SPA (sem build) |
| Backend | Node.js serverless (Vercel) |
| Banco | Google Sheets |
| IA | OpenAI gpt-4o-mini |
| Auth | CPF + OTP via WhatsApp (Z-API) |
| Docs | Google Drive |

---

## Estrutura de arquivos

```
unaslaf-app/
├── vercel.json
├── package.json
├── public/
│   └── index.html              ← SPA completo
└── api/
    ├── auth/
    │   ├── request-code.js     ← POST /api/auth/request-code
    │   └── verify-code.js      ← POST /api/auth/verify-code
    ├── documentos/
    │   └── download.js         ← GET /api/documentos/download?fileId=...
    ├── lib/
    │   ├── auth.js             ← middleware de sessão
    │   ├── sheets.js           ← Google Sheets helper
    │   ├── store.js            ← store OTP em memória
    │   └── zapi.js             ← Z-API WhatsApp helper
    ├── cadastro.js             ← GET|PATCH /api/cadastro
    ├── chat.js                 ← POST /api/chat
    ├── context-static.js       ← base de conhecimento RAG
    └── documentos.js           ← GET /api/documentos
```

---

## Variáveis de ambiente no Vercel

| Variável | Descrição |
|---|---|
| `OPENAI_API_KEY` | Chave da OpenAI |
| `ZAPI_INSTANCE` | ID da instância Z-API |
| `ZAPI_TOKEN` | Token da instância Z-API |
| `ZAPI_CLIENT_TOKEN` | Client-Token da conta Z-API |
| `SHEETS_ID` | ID da planilha Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT` | JSON completo da conta de serviço (stringify) |
| `CONTEXT_FOLDER_ID` | ID pasta de contexto no Drive |
| `REPO_FOLDER_ID` | ID pasta de documentos no Drive |
| `SESSION_SECRET` | String secreta para tokens de sessão (defina uma senha) |

---

## Deploy

```bash
# 1. Clone ou faça upload do projeto para o GitHub
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/SEU_USER/unaslaf-app.git
git push -u origin main

# 2. No Vercel: importe o repositório
# 3. Configure as variáveis de ambiente acima
# 4. Deploy automático a cada push na branch main
```

---

## Planilha de associados (ROLDEASSOCIADOS_APP_CONSOLIDADO)

Colunas esperadas (A–P):
```
A: Origem | B: SIAPE | C: Nome | D: CPF | E: Email
F: Telefone | G: Observações | H: Cargo | I: Servidor/Pensionista
J: Situação funcional | K: Órgão | L: Endereço | M: Cidade | N: UF
O: Data Atualização | P: Alterado por
```

- CPF na coluna D: apenas dígitos (sem pontos/traços)
- Telefone na coluna F: formato `5519991234567` (55 + DDD + número)

---

## Atualizar base de conhecimento (RAG)

Edite `/api/context-static.js` diretamente no GitHub.
Localize o documento pelo `id` e edite o campo `content`.
O Vercel faz redeploy automático em 1–2 minutos após o commit.

---

## Fluxo de autenticação

```
1. Usuário informa CPF
2. Backend busca CPF na planilha → retorna nome e telefone mascarado
3. Backend gera OTP (6 dígitos, TTL 10 min) e envia via Z-API
4. Usuário informa o código
5. Backend valida → retorna token de sessão (base64, TTL 8h)
6. Frontend armazena token em memória e usa em todos os requests
```
