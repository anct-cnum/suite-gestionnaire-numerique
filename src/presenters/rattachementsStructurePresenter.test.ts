import { describe, expect, it } from 'vitest'

import { rattachementsStructurePresenter } from './rattachementsStructurePresenter'

describe('rattachements structure presenter', () => {
  it('présente les compteurs de FK en liste libellée et ordonnée', () => {
    // WHEN
    const viewModel = rattachementsStructurePresenter({
      affectations: 5,
      contacts: 2,
      contrats: 16,
      lieux: 1,
      membres: 3,
      postes: 19,
      utilisateurs: 4,
    })

    // THEN
    expect(viewModel).toStrictEqual([
      { label: 'Utilisateurs', nombre: 4 },
      { label: 'Membres de gouvernance', nombre: 3 },
      { label: 'Postes', nombre: 19 },
      { label: 'Contrats', nombre: 16 },
      { label: 'Affectations emploi', nombre: 5 },
      { label: 'Contacts référents', nombre: 2 },
      { label: 'Lieux d’inclusion', nombre: 1 },
    ])
  })
})
