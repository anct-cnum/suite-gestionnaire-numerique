import { describe, expect, it } from 'vitest'

import { doublonsProfessionnelsPresenter } from './doublonsProfessionnelsPresenter'
import { DoublonsProfessionnelsReadModel } from '@/use-cases/queries/RecupererDoublonsProfessionnels'

describe('doublons professionnels presenter', () => {
  it('quand il y a des doublons, alors ils sont groupés par source dans l’ordre AC, coop, CN avec leurs libellés', () => {
    // GIVEN
    const readModel: DoublonsProfessionnelsReadModel = [
      {
        nom: 'Durand',
        personneId1: 5,
        personneId2: 6,
        prenom: 'Paul',
        source: 'conseiller-numerique',
        sourceId1: 'cn-1',
        sourceId2: 'cn-2',
        structure: 'CC DE TEST',
        structureAdministrativeId: 20,
      },
      {
        nom: 'Dupont',
        personneId1: 1,
        personneId2: 2,
        prenom: 'Marie',
        source: 'aidants-connect',
        sourceId1: 'ac-1',
        sourceId2: 'ac-2',
        structure: 'COMMUNE DE TEST',
        structureAdministrativeId: 10,
      },
    ]

    // WHEN
    const viewModel = doublonsProfessionnelsPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      sections: [
        {
          doublons: [
            {
              idsPersonne: '1 / 2',
              idsSource: 'ac-1 / ac-2',
              nomComplet: 'Marie Dupont',
              structure: 'COMMUNE DE TEST',
            },
          ],
          libelle: 'Aidants Connect',
          source: 'aidants-connect',
        },
        {
          doublons: [
            {
              idsPersonne: '5 / 6',
              idsSource: 'cn-1 / cn-2',
              nomComplet: 'Paul Durand',
              structure: 'CC DE TEST',
            },
          ],
          libelle: 'Conseiller numérique',
          source: 'conseiller-numerique',
        },
      ],
      total: 2,
    })
  })

  it('quand il n’y a aucun doublon, alors le view model est vide avec un total à zéro', () => {
    // GIVEN
    const readModel: DoublonsProfessionnelsReadModel = []

    // WHEN
    const viewModel = doublonsProfessionnelsPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      sections: [],
      total: 0,
    })
  })
})
