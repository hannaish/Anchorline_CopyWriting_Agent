import type { DefaultListEntry } from './types'

/**
 * Sensitive categories the spec says must never reach the AI classifier and
 * must always be allowed: banking, email, health, and password managers.
 * Same editable shape as the default distracting list, just inverted intent.
 */
export const DEFAULT_NEVER_CLASSIFY_DOMAINS: DefaultListEntry[] = [
  { domain: 'mail.google.com', label: 'Gmail', enabled: true },
  { domain: 'outlook.com', label: 'Outlook', enabled: true },
  { domain: 'mail.yahoo.com', label: 'Yahoo Mail', enabled: true },
  { domain: 'proton.me', label: 'Proton Mail', enabled: true },
  { domain: 'paypal.com', label: 'PayPal', enabled: true },
  { domain: 'chase.com', label: 'Chase', enabled: true },
  { domain: 'bankofamerica.com', label: 'Bank of America', enabled: true },
  { domain: 'wellsfargo.com', label: 'Wells Fargo', enabled: true },
  { domain: '1password.com', label: '1Password', enabled: true },
  { domain: 'lastpass.com', label: 'LastPass', enabled: true },
  { domain: 'bitwarden.com', label: 'Bitwarden', enabled: true },
  { domain: 'mychart.com', label: 'MyChart', enabled: true },
]
