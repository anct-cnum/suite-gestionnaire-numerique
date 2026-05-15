import { describe, expect, it } from 'vitest'

import { classifierTypeEnveloppe, estEnveloppeDeFormation, TypeEnveloppe } from './enveloppeFinancement'

describe('classification des enveloppes de financement sur les libellés réels en base', () => {
  it.each([
    {
      intention: 'enveloppe id 1 Plan France Relance → Conseiller Numérique',
      libelle: 'Conseiller Numérique - Plan France Relance - État',
      typeAttendu: 'conseiller_numerique' as TypeEnveloppe,
    },
    {
      intention: 'enveloppe id 2 Renouvellement → Conseiller Numérique',
      libelle: 'Conseiller Numérique - Renouvellement - État',
      typeAttendu: 'conseiller_numerique' as TypeEnveloppe,
    },
    {
      intention: 'enveloppe id 3 Formation Aidant Numérique → FNE',
      libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
      typeAttendu: 'fne' as TypeEnveloppe,
    },
    {
      intention: 'enveloppe id 4 Ingénierie France Numérique Ensemble → FNE',
      libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
      typeAttendu: 'fne' as TypeEnveloppe,
    },
    {
      intention: 'libellé fantôme historique « initiale » → Conseiller Numérique',
      libelle: 'Conseiller Numérique - initiale - État',
      typeAttendu: 'conseiller_numerique' as TypeEnveloppe,
    },
  ])('classifierTypeEnveloppe : $intention', ({ libelle, typeAttendu }) => {
    // WHEN
    const type = classifierTypeEnveloppe(libelle)

    // THEN
    expect(type).toBe(typeAttendu)
  })

  it.each([
    {
      formationAttendue: false,
      intention: 'enveloppe id 1 Plan France Relance → pas formation',
      libelle: 'Conseiller Numérique - Plan France Relance - État',
    },
    {
      formationAttendue: false,
      intention: 'enveloppe id 2 Renouvellement → pas formation',
      libelle: 'Conseiller Numérique - Renouvellement - État',
    },
    {
      formationAttendue: true,
      intention: 'enveloppe id 3 Formation Aidant Numérique → formation',
      libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
    },
    {
      formationAttendue: false,
      intention: 'enveloppe id 4 Ingénierie France Numérique Ensemble → pas formation',
      libelle: 'Ingénierie France Numérique Ensemble - 2024 - État',
    },
  ])('estEnveloppeDeFormation : $intention', ({ formationAttendue, libelle }) => {
    // WHEN
    const estFormation = estEnveloppeDeFormation(libelle)

    // THEN
    expect(estFormation).toBe(formationAttendue)
  })
})
