import { ReactElement } from 'react'

import StructureActivites from '@/components/Structure/StructureActivites'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { PrismaAccompagnementsAcStructureLoader } from '@/gateways/PrismaAccompagnementsAcStructureLoader'
import { activitesStructurePresenter } from '@/presenters/activitesStructurePresenter'
import { DATE_DEBUT_DISPOSITIF } from '@/shared/dispositif'
import { RecupererActivitesStructure } from '@/use-cases/queries/RecupererActivitesStructure'

export default async function SectionActivitesStructure({ structureId }: Props): Promise<ReactElement> {
  try {
    const maintenant = new Date()
    const readModel = await new RecupererActivitesStructure(
      createApiCoopStatistiquesLoader(false),
      new PrismaAccompagnementsAcStructureLoader()
    ).handle({ au: maintenant.toISOString().slice(0, 10), du: DATE_DEBUT_DISPOSITIF, structureId })

    return <StructureActivites viewModel={activitesStructurePresenter(readModel, structureId, maintenant)} />
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
