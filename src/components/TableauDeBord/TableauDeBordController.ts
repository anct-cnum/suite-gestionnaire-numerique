import { accompagnementsRealisesPresenter } from '@/presenters/accompagnementsRealisesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/mediateursEtAidantsPresenter'
import { RecupererAccompagnementsRealises } from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { RecupererLieuxInclusionNumerique } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { RecupererMediateursEtAidants } from '@/use-cases/queries/RecupererMediateursEtAidants'

export class TableauDeBordController {
  readonly #recupererAccompagnementsRealises: RecupererAccompagnementsRealises
  readonly #recupererLieuxInclusionNumerique: RecupererLieuxInclusionNumerique
  readonly #recupererMediateursEtAidants: RecupererMediateursEtAidants

  constructor(
    recupererLieuxInclusionNumerique: RecupererLieuxInclusionNumerique,
    recupererMediateursEtAidants: RecupererMediateursEtAidants,
    recupererAccompagnementsRealises: RecupererAccompagnementsRealises
  ) {
    this.#recupererLieuxInclusionNumerique = recupererLieuxInclusionNumerique
    this.#recupererMediateursEtAidants = recupererMediateursEtAidants
    this.#recupererAccompagnementsRealises = recupererAccompagnementsRealises
  }

  async get(codeDepartement: string): Promise<{
    accompagnementsRealises: ReturnType<typeof accompagnementsRealisesPresenter>
    lieuxInclusionNumerique: ReturnType<typeof lieuxInclusionNumeriquePresenter>
    mediateursEtAidants: ReturnType<typeof mediateursEtAidantsPresenter>
  }> {
    const [
      lieuxInclusionNumeriqueReadModel,
      mediateursEtAidantsReadModel,
      accompagnementsRealisesReadModel,
    ] = await Promise.all([
      this.#recupererLieuxInclusionNumerique.handle({ codeDepartement }),
      this.#recupererMediateursEtAidants.handle({ codeDepartement }),
      this.#recupererAccompagnementsRealises.handle({ codeDepartement }),
    ])

    return {
      accompagnementsRealises: accompagnementsRealisesPresenter(accompagnementsRealisesReadModel),
      lieuxInclusionNumerique: lieuxInclusionNumeriquePresenter(lieuxInclusionNumeriqueReadModel),
      mediateursEtAidants: mediateursEtAidantsPresenter(mediateursEtAidantsReadModel),
    }
  }
} 