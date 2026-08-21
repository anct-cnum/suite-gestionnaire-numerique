import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import GouvernanceAdmin from '@/components/TableauDeBord/Gouvernance/GouvernanceAdmin'
import GouvernancePref from '@/components/TableauDeBord/Gouvernance/GouvernancePref'
import { PrismaGouvernanceTableauDeBordLoader } from '@/gateways/PrismaGouvernanceTableauDeBordLoader'
import { PrismaGouvernanceAdminLoader } from '@/gateways/tableauDeBord/PrismaGouvernanceAdminLoader'
import { gouvernanceAdminPresenter } from '@/presenters/tableauDeBord/gouvernanceAdminPresenter'
import { gouvernancePrefPresenter } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export default async function BlocGouvernance({ territoire }: Props): Promise<ReactElement> {
  switch (territoire.type) {
    case 'departement':
      return gouvernanceDepartement(territoire.code)
    case 'france':
      return gouvernanceNationale()
    case 'region':
      return gouvernanceRegion(territoire.codesDepartement)
    default:
      // EPCI : bloc masqué par le registre ; structure : bloc jamais affiché.
      return <></>
  }
}

async function gouvernanceNationale(): Promise<ReactElement> {
  const gouvernanceAdminLoader = new PrismaGouvernanceAdminLoader()
  const gouvernanceReadModel = await gouvernanceAdminLoader.get()
  const gouvernanceViewModel = handleReadModelOrError(gouvernanceReadModel, gouvernanceAdminPresenter)

  return <GouvernanceAdmin gouvernanceViewModel={gouvernanceViewModel} lienGouvernance="/gouvernances" />
}

async function gouvernanceDepartement(code: string): Promise<ReactElement> {
  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const gouvernanceReadModel = await gouvernanceLoader.get(code)
  const gouvernanceViewModel = handleReadModelOrError(gouvernanceReadModel, gouvernancePrefPresenter)

  return <GouvernancePref gouvernanceViewModel={gouvernanceViewModel} lienGouvernance={`/gouvernance/${code}`} />
}

// Agrégat des départements de la région ; lien de détail masqué (les pages /gouvernance ne connaissent pas la région).
async function gouvernanceRegion(codesDepartement: ReadonlyArray<string>): Promise<ReactElement> {
  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const gouvernanceReadModel = await gouvernanceLoader.getPourDepartements(codesDepartement)
  const gouvernanceViewModel = handleReadModelOrError(gouvernanceReadModel, gouvernancePrefPresenter)

  return <GouvernancePref gouvernanceViewModel={gouvernanceViewModel} />
}

type Props = Readonly<{
  territoire: TerritoireTableauDeBord
}>
