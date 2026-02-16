/**
 * Valid email format: local@domain.tld
 * - Local part: at least 2 chars, letters/numbers/._%+-
 * - Domain: has a dot, TLD at least 2 chars, domain part at least 6 chars total
 * Rejects: "a@b", "x@y.z", "asdf@asdf", "test@", "@domain.com", etc.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/

export function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 254 || trimmed.length < 8) return false
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false
  const domainPart = trimmed.slice(atIndex + 1)
  if (!domainPart.includes('.') || domainPart.length < 4) return false
  return EMAIL_REGEX.test(trimmed)
}
