import { ReactElement } from 'react'

import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import CarteFragiliteDepartement from '@/components/TableauDeBord/EtatDesLieux/CarteFragiliteDepartement'
import CarteIndicesFrance from '@/components/TableauDeBord/EtatDesLieux/CarteIndicesFrance'
import EtatDesLieux from '@/components/TableauDeBord/EtatDesLieux/EtatDesLieux'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import {
  indiceConfianceDepartementsPresenter,
  indiceFragiliteDepartementsPresenter,
  indiceFragilitePresenter,
} from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { fetchAccompagnementsRealises } from '@/use-cases/queries/fetchAccompagnementsRealises'
import { Scope } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocEtatDesLieux({ scope }: Props): Promise<ReactElement> {
  const code = scope.type === 'france' ? 'France' : scope.code

  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()

  const accompagnementsRealisesPromise = fetchAccompagnementsRealises(code)

  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(code)
  const lieuxInclusionViewModel = handleReadModelOrError(lieuxInclusionReadModel, lieuxInclusionNumeriquePresenter)

  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(code)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const carte =
    scope.type === 'france' ? await carteNationale(indicesLoader) : await carteDepartement(indicesLoader, scope.code)

  return (
    <EtatDesLieux
      accompagnementsRealisesPromise={accompagnementsRealisesPromise}
      carte={carte}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
    />
  )
}

async function carteNationale(indicesLoader: PrismaIndicesDeFragiliteLoader): Promise<ReactElement> {
  const indicesReadModel = await indicesLoader.getForFrance()

  if (isErrorReadModel(indicesReadModel)) {
    return <CarteIndicesFrance departementsFragilite={[]} />
  }

  return (
    <CarteIndicesFrance
      departementsConfiance={indiceConfianceDepartementsPresenter(indicesReadModel.departements)}
      departementsFragilite={indiceFragiliteDepartementsPresenter(indicesReadModel.departements)}
      statistiquesIcp={indicesReadModel.statistiquesicp}
    />
  )
}

async function carteDepartement(indicesLoader: PrismaIndicesDeFragiliteLoader, code: string): Promise<ReactElement> {
  const indicesReadModel = await indicesLoader.getForDepartement(code)
  const indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragilitePresenter)

  if ('type' in indicesFragilite) {
    return <CarteFragiliteDepartement communesFragilite={[]} departement={code} />
  }

  return <CarteFragiliteDepartement communesFragilite={indicesFragilite} departement={code} />
}

type Props = Readonly<{
  scope: Scope
}>
