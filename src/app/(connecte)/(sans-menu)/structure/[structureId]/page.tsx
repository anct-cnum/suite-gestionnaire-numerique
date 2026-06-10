import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import Structure from '@/components/Structure/Structure'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRattachementsStructureLoader } from '@/gateways/PrismaRattachementsStructureLoader'
import { PrismaUneStructureLoader } from '@/gateways/PrismaUneStructureLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { rattachementsStructurePresenter } from '@/presenters/rattachementsStructurePresenter'
import { structurePresenter } from '@/presenters/structurePresenter'
import { RecupererRattachementsStructure } from '@/use-cases/queries/RecupererRattachementsStructure'
import { RecupererUneStructure } from '@/use-cases/queries/RecupererUneStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function StructureController({ params, searchParams }: Props): Promise<ReactElement> {
  const { structureId } = await params
  const { edit } = await searchParams

  if (!structureId) {
    notFound()
  }

  const structureIdNumeric = Number.parseInt(structureId, 10)

  if (Number.isNaN(structureIdNumeric)) {
    notFound()
  }

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  const uneStructureReadModel = await new RecupererUneStructure(new PrismaUneStructureLoader()).handle({
    structureId: structureIdNumeric,
  })

  const codesDepartements = uneStructureReadModel.role.gouvernances.map((gouvernance) => gouvernance.code)
  const peutGererStructure = contexte.peutGererStructure(structureIdNumeric, codesDepartements)

  // Édition du nom réservée aux administrateurs dispositif, et seulement avec ?edit=true dans l'URL.
  const editionNomActive = contexte.aCesRoles('administrateur_dispositif') && edit === 'true'

  // Rattachements (FK) chargés seulement pour le mode édition : ils alimentent la modale de
  // renommage (conséquences) et le futur onglet fusion.
  const rattachements = editionNomActive
    ? rattachementsStructurePresenter(
        await new RecupererRattachementsStructure(new PrismaRattachementsStructureLoader()).handle({
          structureId: structureIdNumeric,
        })
      )
    : []

  const viewModel = structurePresenter(uneStructureReadModel, new Date())

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Structure' }]} />
      <Structure
        editionNomActive={editionNomActive}
        peutGererStructure={peutGererStructure}
        rattachements={rattachements}
        viewModel={viewModel}
      />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      structureId: string
    }>
  >
  searchParams: Promise<
    Readonly<{
      edit?: string
    }>
  >
}>
