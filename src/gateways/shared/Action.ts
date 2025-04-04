import { Prisma } from '@prisma/client'

export function isEnveloppeDeFormation(enveloppe: Prisma.EnveloppeFinancementRecordGetPayload<null>): boolean {
  return /formation/i.test(enveloppe.libelle)
}
