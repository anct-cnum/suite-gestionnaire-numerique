import { ReactElement } from 'react'

import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import CarteFragiliteDepartement from '@/components/TableauDeBord/EtatDesLieux/CarteFragiliteDepartement'
import CarteIndicesFrance from '@/components/TableauDeBord/EtatDesLieux/CarteIndicesFrance'
import EtatDesLieux from '@/components/TableauDeBord/EtatDesLieux/EtatDesLieux'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import {
  indiceFragiliteDepartementsPresenter,
  indiceFragilitePresenter,
} from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { fetchAccompagnementsRealises } from '@/use-cases/queries/fetchAccompagnementsRealises'
import { FiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'
import {
  filtreTerritorialDuTerritoire,
  TerritoireGeographique,
  TerritoireTableauDeBord,
} from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export default async function BlocEtatDesLieux({ territoire }: Props): Promise<ReactElement> {
  const filtre: FiltreTerritorial =
    territoire.type === 'structure'
      ? { code: String(territoire.structureId), type: 'departement' }
      : filtreTerritorialDuTerritoire(territoire)

  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()

  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(filtre)
  const lieuxInclusionViewModel = handleReadModelOrError(lieuxInclusionReadModel, lieuxInclusionNumeriquePresenter)

  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(filtre)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const carte = territoire.type === 'structure' ? <></> : await carteDuTerritoire(indicesLoader, territoire)

  const accompagnementsProps = accompagnements(territoire, filtre)

  return (
    <EtatDesLieux
      {...accompagnementsProps}
      carte={carte}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
    />
  )
}

type AccompagnementsProps =
  | Readonly<{ accompagnementsRealisesPromise: ReturnType<typeof fetchAccompagnementsRealises> }>
  | Readonly<{ accompagnementsStructureId: number }>
  | Readonly<{ accompagnementsTerritoire: string }>

function accompagnements(territoire: TerritoireTableauDeBord, filtre: FiltreTerritorial): AccompagnementsProps {
  switch (territoire.type) {
    case 'departement':
      return { accompagnementsTerritoire: territoire.code }
    case 'france':
      return { accompagnementsTerritoire: 'France' }
    case 'structure':
      return { accompagnementsStructureId: territoire.structureId }
    default:
      // Région et EPCI : la route client des accompagnements ne connaît que France/département,
      // on résout la promesse côté serveur avec le filtre territorial complet.
      return { accompagnementsRealisesPromise: fetchAccompagnementsRealises(filtre) }
  }
}

async function carteDuTerritoire(
  indicesLoader: PrismaIndicesDeFragiliteLoader,
  territoire: TerritoireGeographique
): Promise<ReactElement> {
  switch (territoire.type) {
    case 'departement': {
      const indicesReadModel = await indicesLoader.getForDepartement(territoire.code)
      const indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragilitePresenter)
      return (
        <CarteFragiliteDepartement
          fragilite={'type' in indicesFragilite ? [] : indicesFragilite}
          territoire={{ code: territoire.code, type: 'departement' }}
        />
      )
    }
    case 'epci': {
      const indicesReadModel = await indicesLoader.getForCommunes(territoire.codesInsee)
      const indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragilitePresenter)
      return (
        <CarteFragiliteDepartement
          fragilite={'type' in indicesFragilite ? [] : indicesFragilite}
          territoire={{ bbox: territoire.bbox, code: territoire.code, codesInsee: territoire.codesInsee, type: 'epci' }}
        />
      )
    }
    case 'france': {
      const indicesReadModel = await indicesLoader.getForFrance()
      if (isErrorReadModel(indicesReadModel)) {
        return <CarteIndicesFrance departementsFragilite={[]} />
      }
      return (
        <CarteIndicesFrance
          departementsFragilite={indiceFragiliteDepartementsPresenter(indicesReadModel.departements)}
        />
      )
    }
    case 'region': {
      const indicesReadModel = await indicesLoader.getForDepartements(territoire.codesDepartement)
      const indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragiliteDepartementsPresenter)
      return (
        <CarteFragiliteDepartement
          fragilite={'type' in indicesFragilite ? [] : indicesFragilite}
          territoire={{ bbox: territoire.bbox, codesDepartement: territoire.codesDepartement, type: 'region' }}
        />
      )
    }
  }
}

type Props = Readonly<{
  territoire: TerritoireTableauDeBord
}>
