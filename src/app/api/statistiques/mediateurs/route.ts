import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import type { MediateurCoopOption } from '@/gateways/PrismaMediateursCoopLoader'
import { PrismaMediateursCoopLoader } from '@/gateways/PrismaMediateursCoopLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export async function GET(request: NextRequest): Promise<NextResponse<null | ReadonlyArray<MediateurCoopOption>>> {
  const session = await getSession()
  if (!session) return NextResponse.json(null, { status: 403 })

  const recherche = request.nextUrl.searchParams.get('q') ?? ''
  if (recherche.length < 2) return NextResponse.json([])

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(await getSessionSub())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const scopeFiltre: ScopeFiltre =
    contexte.role === 'gestionnaire_structure'
      ? { id: contexte.idStructure(), type: 'structure' }
      : contexte.scopeFiltre()

  const options = await new PrismaMediateursCoopLoader().rechercher(recherche, scopeFiltre)
  return NextResponse.json(options)
}
