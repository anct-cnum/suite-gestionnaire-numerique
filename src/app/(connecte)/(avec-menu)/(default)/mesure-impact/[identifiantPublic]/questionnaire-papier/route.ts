import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { LogoDuTerritoire, pdfDuQuestionnairePapier } from './pdfDuQuestionnairePapier'
import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { questionnairePapierPresenter } from '@/presenters/mesure-impact/questionnairePapierPresenter'
import { RecupererLeQuestionnairePapier } from '@/use-cases/mesure-impact/RecupererLeQuestionnairePapier'

// Questionnaire papier de la campagne, généré à la demande depuis la version du questionnaire. Il ne change
// qu'avec la version : le navigateur le garde un jour.
export async function GET(_request: NextRequest, { params }: Contexte): Promise<NextResponse> {
  if ((await getSession()) === null) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { identifiantPublic } = await params
  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const papier = await new RecupererLeQuestionnairePapier(new PrismaCampagneLoader()).handle({
    identifiantPublic,
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  if (papier === null) {
    return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 })
  }
  if (papier === 'accesRefuse') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const viewModel = questionnairePapierPresenter(papier)
  const pdf = await pdfDuQuestionnairePapier(viewModel, await logoDuTerritoire())
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Cache-Control': 'private, max-age=86400',
      'Content-Disposition': `attachment; filename="${viewModel.nomDuFichier}"`,
      'Content-Type': 'application/pdf',
    },
  })
}

// Logo du territoire pilote, en dur comme sur le web (LogoDuTerritoire) : il viendra de la campagne quand il y en
// aura d'autres. En PNG, que pdfkit sait intégrer, à côté du SVG du web.
async function logoDuTerritoire(): Promise<LogoDuTerritoire> {
  return {
    description: 'Sicoval – L’Agglo du Sud-Est Toulousain',
    image: await readFile(path.join(process.cwd(), 'public', 'mesure-impact', 'logo-sicoval.png')),
  }
}

type Contexte = Readonly<{
  params: Promise<{ identifiantPublic: string }>
}>
