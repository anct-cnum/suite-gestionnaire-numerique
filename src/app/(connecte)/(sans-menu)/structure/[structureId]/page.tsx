import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import Structure from '@/components/Structure/Structure'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUneStructureLoader } from '@/gateways/PrismaUneStructureLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { structurePresenter } from '@/presenters/structurePresenter'
import { RecupererUneStructure } from '@/use-cases/queries/RecupererUneStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function StructureController({ params }: Props): Promise<ReactElement> {
  const { structureId } = await params

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

  const viewModel = structurePresenter(uneStructureReadModel, new Date())

  return <Structure peutGererStructure={peutGererStructure} viewModel={viewModel} />
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      structureId: string
    }>
  >
}>
