import { Prisma } from '@prisma/client'

import { estEnveloppeDeFormation } from '@/shared/enveloppeFinancement'

export function isEnveloppeDeFormation(enveloppe: Prisma.EnveloppeFinancementRecordGetPayload<null>): boolean {
  return estEnveloppeDeFormation(enveloppe.libelle)
}
