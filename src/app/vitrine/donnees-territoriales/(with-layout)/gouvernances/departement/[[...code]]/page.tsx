import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MembreRempli from '@/components/Gouvernance/Membre/MembreRempli'
import SectionRemplie from '@/components/Gouvernance/SectionRemplie'
import GouvernancePref from '@/components/TableauDeBord/Gouvernance/GouvernancePref'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { PrismaGouvernanceTerritorialeLoader } from '@/gateways/vitrine/PrismaGouvernanceTerritorialeLoader'
import { gouvernancesTerritorialesPresenter } from '@/presenters/vitrine/gouvernancesTerritoriales/gouvernancesTerritorialesPresenter'
import { RecupererGouvernanceTerritoriale } from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

export default async function Gouvernances({ params }: Props): Promise<ReactElement> {
  const { code } = await params

  // La page gouvernances nécessite obligatoirement un code département
  if (code === undefined || code.length === 0) {
    notFound()
  }

  // Récupération des données via le use-case
  const useCase = new RecupererGouvernanceTerritoriale(new PrismaGouvernanceTerritorialeLoader())
  const readModel = await useCase.handle({ codeDepartement: code[0] })
  const viewModel = gouvernancesTerritorialesPresenter(readModel)

  return (
    <div
      className="fr-pr-10w"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <h2 className="fr-h2 color-blue-france">
        Gouvernances
      </h2>

      {/* Section statistiques - 2 cartes (Membres et Feuilles de route) */}
      <GouvernancePref gouvernanceViewModel={viewModel.gouvernanceStats} />

      {/* Section listing des membres */}
      <section aria-labelledby="membres-gouvernance">
        <SectionRemplie
          id="membres-gouvernance"
          title={`${viewModel.membres.total} membres`}
        >
          <MembreRempli coporteurs={viewModel.membres.coporteurs} />
        </SectionRemplie>
      </section>

      {/* Section Sources et données utilisées */}
      <section
        aria-labelledby="sources-donnees"
        className="fr-mt-8w fr-mb-4w"
      >
        <SectionSources />
      </section>
    </div>
  )
}

type Props = Readonly<{
  params: Promise<{ code?: ReadonlyArray<string> }>
}>
