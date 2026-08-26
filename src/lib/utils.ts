/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a CPF string into Brazilian format:
 * - Up to 11 digits: XXX.XXX.XXX-XX
 */
export function formatCPF(value: string): string {
  if (!value) return ''

  // Keep only digits and limit to 11 characters
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

/**
 * Valida os dígitos verificadores do CPF utilizando o algoritmo oficial da Receita Federal.
 * Retorna true se válido, false se inválido.
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false
  const cleanCPF = cpf.replace(/\D/g, '')

  if (cleanCPF.length !== 11) return false

  // Rejeita sequências com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // 1º Dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i)
  }
  let remainder = sum % 11
  let firstCheckDigit = remainder < 2 ? 0 : 11 - remainder

  if (firstCheckDigit !== parseInt(cleanCPF.charAt(9), 10)) {
    return false
  }

  // 2º Dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i)
  }
  remainder = sum % 11
  let secondCheckDigit = remainder < 2 ? 0 : 11 - remainder

  if (secondCheckDigit !== parseInt(cleanCPF.charAt(10), 10)) {
    return false
  }

  return true
}

/**
 * Formats a phone string into Brazilian phone format:
 * - Up to 10 digits: (XX) XXXX-XXXX
 * - 11 digits: (XX) XXXXX-XXXX
 */
export function formatPhone(value: string): string {
  if (!value) return ''

  // Keep only digits and limit to 11 characters
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : ''
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}
