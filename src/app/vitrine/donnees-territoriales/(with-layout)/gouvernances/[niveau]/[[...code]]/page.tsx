import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { recupererTerritoireVitrine } from '../../../../territoire'
import MembreRempli from '@/components/Gouvernance/Membre/MembreRempli'
import SectionRemplie from '@/components/Gouvernance/SectionRemplie'
import GouvernancePref from '@/components/TableauDeBord/Gouvernance/GouvernancePref'
import NoticeInformation from '@/components/vitrine/DonneesTerritoriales/NoticeInformation'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { PrismaGouvernanceTerritorialeLoader } from '@/gateways/vitrine/PrismaGouvernanceTerritorialeLoader'
import { gouvernancesTerritorialesPresenter } from '@/presenters/vitrine/gouvernancesTerritoriales/gouvernancesTerritorialesPresenter'
import { noticeGouvernanceDepartementalePresenter } from '@/presenters/vitrine/noticeGouvernanceDepartementalePresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'
import { RecupererGouvernanceTerritoriale } from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])

  return generateTerritoireMetadata(
    niveau,
    code?.[0],
    {
      descriptionTemplate:
        "Découvrez la gouvernance de l'inclusion numérique pour {territoire}. Membres, co-porteurs et organisation territoriale du programme France Numérique Ensemble.",
      keywords: [
        'gouvernance',
        'inclusion numérique',
        'France Numérique Ensemble',
        'co-porteurs',
        'membres',
        'collectivités',
      ],
      titleTemplate: 'Gouvernance - {territoire} - Inclusion Numérique',
    },
    territoire !== null && territoire.type === 'epci' ? territoire.nom : undefined
  )
}

export default async function Gouvernances({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  // Rediriger vers la page d'accueil des données territoriales si niveau national ou régional
  if (niveau === 'national' || niveau === 'region') {
    redirect('/vitrine/donnees-territoriales/synthese-et-indicateurs/national')
  }

  // Les gouvernances sont pilotées à l'échelle départementale : un code département ou EPCI est obligatoire
  if ((niveau !== 'departement' && niveau !== 'epci') || code === undefined || code.length === 0) {
    notFound()
  }

  // Pour un EPCI, la gouvernance affichée est celle de son département de rattachement
  let codeDepartement = code[0]
  let noticeGouvernance = null
  if (niveau === 'epci') {
    const territoire = await recupererTerritoireVitrine(niveau, code[0])
    if (territoire === null || territoire.type !== 'epci' || territoire.codeDepartement === null) {
      notFound()
    }
    codeDepartement = territoire.codeDepartement
    noticeGouvernance = noticeGouvernanceDepartementalePresenter({ codeDepartement, nom: territoire.nom })
  }

  // Récupération des données via le use-case
  const useCase = new RecupererGouvernanceTerritoriale(new PrismaGouvernanceTerritorialeLoader())
  const readModel = await useCase.handle({ codeDepartement })
  const viewModel = gouvernancesTerritorialesPresenter(readModel)

  return (
    <div className="fr-pr-md-10w" style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 className="fr-h2 color-blue-france">Gouvernances</h2>

      {/* Bandeau d'information : pas de gouvernance propre à une intercommunalité */}
      {noticeGouvernance === null ? null : <NoticeInformation viewModel={noticeGouvernance} />}

      {/* Section statistiques - 2 cartes (Membres et Feuilles de route) */}
      <GouvernancePref gouvernanceViewModel={viewModel.gouvernanceStats} />

      {/* Section listing des membres */}
      <section aria-labelledby="membres-gouvernance">
        <SectionRemplie id="membres-gouvernance" title={`${viewModel.membres.total} membres`}>
          <MembreRempli coporteurs={viewModel.membres.coporteurs} />
        </SectionRemplie>
      </section>

      {/* Section Sources et données utilisées */}
      <section aria-labelledby="sources-donnees" className="fr-mt-8w fr-mb-4w">
        <SectionSources />
      </section>
    </div>
  )
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
