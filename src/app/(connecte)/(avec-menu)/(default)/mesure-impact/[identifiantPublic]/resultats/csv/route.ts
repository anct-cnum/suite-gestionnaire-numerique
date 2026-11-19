import { NextRequest, NextResponse } from 'next/server'

import { filtresDeLAdresse } from '../filtresDeLAdresse'
import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaReponseLoader } from '@/gateways/mesure-impact/PrismaReponseLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resultatsCsvPresenter } from '@/presenters/mesure-impact/resultatsCsvPresenter'
import { RecupererLesResultats } from '@/use-cases/mesure-impact/RecupererLesResultats'

// Export CSV des résultats de la campagne, avec les filtres de la page
export async function GET(request: NextRequest, { params }: Contexte): Promise<NextResponse> {
  if ((await getSession()) === null) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { identifiantPublic } = await params
  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const resultats = await new RecupererLesResultats(new PrismaCampagneLoader(), new PrismaReponseLoader()).handle({
    filtres: filtresDeLAdresse(Object.fromEntries(request.nextUrl.searchParams)),
    identifiantPublic,
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  if (resultats === null) {
    return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 })
  }
  if (resultats === 'accesRefuse') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { contenu, nomDuFichier } = resultatsCsvPresenter(resultats)
  return new NextResponse(contenu, {
    headers: {
      'Content-Disposition': `attachment; filename="${nomDuFichier}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  })
}

type Contexte = Readonly<{
  params: Promise<{ identifiantPublic: string }>
}>
