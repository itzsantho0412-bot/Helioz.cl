import type { OrderSelection, CustomInquiry } from './types'

// Owner WhatsApp number (no + sign, no spaces).
export const OWNER_WHATSAPP = '916379407292'
// Display version used in UI.
export const OWNER_WHATSAPP_DISPLAY = '+91 63794 07292'

export function formatOrderMessage(sel: OrderSelection): string {
  const lines: string[] = []
  lines.push('*New Order Request — HELIOZ CLOTHING*')
  lines.push('')
  lines.push(`Product: ${sel.product.name}`)
  lines.push(`Price: ₹${sel.product.price}`)
  lines.push(`Size: ${sel.size}`)
  lines.push(`Color: ${sel.color}`)
  lines.push(`Quantity: ${sel.quantity}`)
  lines.push(`Total: ₹${sel.product.price * sel.quantity}`)
  lines.push('')
  lines.push('Please confirm availability. Thank you.')

  return lines.join('\n')
}

export function formatCustomInquiry(inq: CustomInquiry): string {
  const lines: string[] = []
  lines.push('*Custom / Bulk Order Inquiry — HELIOZ CLOTHING*')
  lines.push('')
  lines.push(`Name: ${inq.name}`)
  lines.push(`Phone: ${inq.phone}`)
  if (inq.email) lines.push(`Email: ${inq.email}`)
  lines.push(`Quantity: ${inq.quantity}`)
  lines.push('')
  lines.push('Order details:')
  lines.push(inq.details || '(not provided)')
  lines.push('')
  lines.push('Looking forward to your response.')

  return lines.join('\n')
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`
}
