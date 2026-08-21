import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRechercheTerritoiresLoader } from '@/gateways/PrismaRechercheTerritoiresLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { perimetreRechercheDuContexte } from '@/use-cases/queries/PerimetreRechercheTerritoire'
import { RechercherTerritoires, TerritoiresTrouvesReadModel } from '@/use-cases/queries/RechercherTerritoires'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

// Recherche territoriale du tableau de bord : le périmètre est appliqué côté serveur selon le contexte.
export async function GET(request: NextRequest): Promise<NextResponse<null | TerritoiresTrouvesReadModel>> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(null, { status: 403 })
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const perimetre = perimetreRechercheDuContexte(contexte)
  if (perimetre === null) {
    return NextResponse.json(null, { status: 403 })
  }

  const terme = (request.nextUrl.searchParams.get('q') ?? '').trim()
  if (terme.length < 2) {
    return NextResponse.json({ territoires: [], total: 0 })
  }

  const readModel = await new RechercherTerritoires(new PrismaRechercheTerritoiresLoader()).handle({
    perimetre,
    terme,
  })
  return NextResponse.json(readModel)
}
