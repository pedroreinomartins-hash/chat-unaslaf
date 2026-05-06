// api/lib/store.js
// Store em memória para códigos OTP
// Em serverless o store persiste apenas enquanto a função está "quente".
// Para produção com alta concorrência, substituir por Redis ou Sheets.

const codes = new Map(); // key: CPF, value: { code, expiresAt, phone }

/**
 * Armazena código OTP com TTL de 10 minutos
 */
export function setCode(cpf, code, phone) {
  codes.set(cpf, {
    code,
    phone,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
  });
}

/**
 * Verifica código OTP. Retorna true se válido e remove da store.
 */
export function verifyCode(cpf, code) {
  const entry = codes.get(cpf);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    codes.delete(cpf);
    return false;
  }
  if (entry.code !== code) return false;
  codes.delete(cpf);
  return true;
}
