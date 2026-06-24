// utils/validators.js

/**
 * Valida formato de e-mail (simples, mas eficaz para 99% dos casos)
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida CPF (algoritmo dos dígitos verificadores + rejeita todos iguais)
 */
export const isValidCpf = (cpf) => {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // Ex.: 111.111.111-11

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleaned.substring(9, 10))) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
};

/**
 * Normaliza CPF (remove pontuação)
 */
export const normalizeCpf = (cpf) => cpf.replace(/\D/g, '');