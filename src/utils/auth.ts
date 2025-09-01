import { nanoid } from 'nanoid'

// Simple password hashing for Cloudflare Workers (without Node.js crypto)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'satyamgold-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

export function generateOrderNumber(): string {
  return `SG-${Date.now()}${Math.floor(Math.random() * 1000)}`
}

export function generateId(): string {
  return nanoid()
}