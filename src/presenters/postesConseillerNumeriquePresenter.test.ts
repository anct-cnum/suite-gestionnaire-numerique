import { describe, expect, it } from 'vitest'

import { postesConseillerNumeriquePresenter } from './postesConseillerNumeriquePresenter'
import { epochTime } from './testHelper'
import { PostesConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'

describe('postes conseiller numérique presenter : date de mise à jour ID Poste', () => {
  it('quand la date du dernier import ID Poste est connue, elle est formatée en français', () => {
    // GIVEN
    const readModel = postesReadModel(epochTime)

    // WHEN
    const viewModel = postesConseillerNumeriquePresenter(readModel)

    // THEN
    expect('type' in viewModel ? null : viewModel.dateMiseAJour).toBe('01/01/1970')
  })

  it('quand la date du dernier import ID Poste est inconnue, elle vaut null', () => {
    // GIVEN
    const readModel = postesReadModel(null)

    // WHEN
    const viewModel = postesConseillerNumeriquePresenter(readModel)

    // THEN
    expect('type' in viewModel ? undefined : viewModel.dateMiseAJour).toBeNull()
  })
})

function postesReadModel(dateMiseAJour: Date | null): PostesConseillerNumeriqueReadModel {
  return {
    dateMiseAJour,
    displayPagination: false,
    limite: 10,
    page: 1,
    postes: [],
    statistiques: {
      budgetTotalConventionne: 0,
      budgetTotalVerse: 0,
      nombreDePostes: 0,
      nombreDePostesOccupes: 0,
      nombreDeStructuresConventionnees: 0,
      totalPostesPourPagination: 0,
    },
    total: 0,
    totalPages: 0,
  }
}
