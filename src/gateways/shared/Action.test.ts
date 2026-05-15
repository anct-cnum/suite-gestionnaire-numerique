import { Prisma } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { isEnveloppeDeFormation } from './Action'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('isEnveloppeDeFormation : caractérisation sur les libellés réels en base', () => {
  it.each([
    {
      attendu: false,
      intention: 'enveloppe Conum Plan France Relance (id 1) → pas une enveloppe de formation',
      libelle: 'Conseiller Numérique - Plan France Relance - État',
    },
    {
      attendu: false,
      intention: 'enveloppe Conum Renouvellement (id 2) → pas une enveloppe de formation',
      libelle: 'Conseiller Numérique - Renouvellement - État',
    },
    {
      attendu: true,
      intention: 'enveloppe FNE Formation Aidant Numérique (id 3) → enveloppe de formation',
      libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
    },
    {
      attendu: false,
      intention: 'enveloppe FNE Ingénierie France Numérique Ensemble (id 4) → pas une enveloppe de formation',
      libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
    },
  ])('$intention', ({ attendu, libelle }) => {
    // GIVEN
    const enveloppe = enveloppeFinancementRecord(libelle)

    // WHEN
    const resultat = isEnveloppeDeFormation(enveloppe)

    // THEN
    expect(resultat).toBe(attendu)
  })
})

function enveloppeFinancementRecord(libelle: string): Prisma.EnveloppeFinancementRecordGetPayload<null> {
  return {
    dateDeDebut: epochTime,
    dateDeFin: epochTimePlusOneDay,
    id: 1,
    libelle,
    montant: 0,
  }
}
