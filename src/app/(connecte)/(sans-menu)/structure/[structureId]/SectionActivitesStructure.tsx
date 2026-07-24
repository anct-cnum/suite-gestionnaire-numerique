import { ReactElement } from 'react'

import StructureActivites from '@/components/Structure/StructureActivites'
import { ApiCoopStatistiquesLoader } from '@/gateways/apiCoop/ApiCoopStatistiquesLoader'
import { PrismaAccompagnementsAcStructureLoader } from '@/gateways/PrismaAccompagnementsAcStructureLoader'
import { PrismaMediateursCoopLoader } from '@/gateways/PrismaMediateursCoopLoader'
import { activitesStructurePresenter } from '@/presenters/activitesStructurePresenter'
import { RecupererActivitesStructure } from '@/use-cases/queries/RecupererActivitesStructure'

export default async function SectionActivitesStructure({ structureId }: Props): Promise<ReactElement> {
  try {
    const readModel = await new RecupererActivitesStructure(
      new PrismaMediateursCoopLoader(),
      new ApiCoopStatistiquesLoader(),
      new PrismaAccompagnementsAcStructureLoader()
    ).handle({ structureId })

    return <StructureActivites viewModel={activitesStructurePresenter(readModel, structureId, new Date())} />
  } catch {
    return (
      <section
        aria-labelledby="activites"
        className="grey-border border-radius fr-mb-2w fr-p-4w"
        id="activites"
        style={{ scrollMarginTop: '56px' }}
      >
        <h2 className="fr-h6 fr-m-0">Activités</h2>
        <div className="fr-alert fr-alert--error fr-mt-2w">
          <p>Erreur de récupération des données d&apos;activité depuis la Coop</p>
        </div>
      </section>
    )
  }
}

type Props = Readonly<{
  structureId: number
}>
