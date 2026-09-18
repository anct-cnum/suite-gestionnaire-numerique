import { describe, expect, it } from 'vitest'

import { listeLieuxInclusionPresenter } from './listeLieuxInclusionPresenter'
import {
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusion'

describe('liste des lieux d’inclusion presenter', () => {
  const now = new Date('2026-01-01')

  it.each([
    { estLieuCoop: true, intention: 'géré dans la Coop', structureCoopId: '00000000-0000-4000-8000-000000000001' },
    { estLieuCoop: false, intention: 'géré hors Coop', structureCoopId: null },
  ])('signale un lieu $intention à partir de structure_coop_id (#1951)', ({ estLieuCoop, structureCoopId }) => {
    // GIVEN
    const readModel = createReadModel({ structure_coop_id: structureCoopId })

    // WHEN
    const viewModel = listeLieuxInclusionPresenter(readModel, now)

    // THEN
    expect(viewModel.lieux[0].estLieuCoop).toBe(estLieuCoop)
  })
})

function createReadModel(lieu: Partial<LieuInclusionNumeriqueItem>): RecupererLieuxInclusionReadModel {
  return {
    lieux: [
      {
        code_insee: '75101',
        code_postal: '75001',
        deleted_at: null,
        est_frr: false,
        est_qpv: false,
        id: '42',
        nb_accompagnements_ac: 0,
        nb_accompagnements_coop: 0,
        nom: 'Lieu test',
        nom_commune: 'Paris',
        nom_voie: 'rue de la Paix',
        numero_voie: '1',
        structure_cartographie_nationale_id: null,
        structure_coop_id: null,
        typologies: ['ASSO'],
        updated_at: new Date('2025-12-01'),
        visible_pour_cartographie_nationale: true,
        ...lieu,
      },
    ],
    limite: 10,
    page: 0,
    total: 1,
    totalActifs: 1,
    totalArchives: 0,
    totalConseillerNumerique: 0,
    totalLabellise: 0,
    totalSansRecherche: 1,
  }
}
