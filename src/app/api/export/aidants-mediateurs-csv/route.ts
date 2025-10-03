import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { buildFiltresForExport, FiltresURLParams } from '@/shared/filtresAidantsMediateursUtils'
import { AidantMediateurAvecAccompagnementReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    const utilisateur = await utilisateurLoader.get(await getSessionSub())

    const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
    const territoireResult = await territoireUseCase.handle(utilisateur)

    let territoire: string
    if (territoireResult.type === 'france') {
      territoire = 'France'
    } else if (territoireResult.codes.length > 0) {
      territoire = territoireResult.codes[0]
    } else {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupération des paramètres de filtre
    const searchParams = request.nextUrl.searchParams
    const params: FiltresURLParams = {
      codeDepartement: searchParams.get('codeDepartement') ?? undefined,
      codeRegion: searchParams.get('codeRegion') ?? undefined,
      formations: searchParams.get('formations') ?? undefined,
      habilitations: searchParams.get('habilitations') ?? undefined,
      roles: searchParams.get('roles') ?? undefined,
    }

    // Utiliser la fonction utilitaire pour construire les filtres
    const filtres = buildFiltresForExport(
      params,
      territoire,
      utilisateur.state.role.nom
    )

    // Récupération des données avec accompagnements pour l'export
    const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
    const aidantsForExport = await listeAidantsMediateursLoader.getForExport(filtres)

    if ('type' in aidantsForExport) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    // Génération du CSV
    const csvContent = generateCSV(aidantsForExport)

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `aidants-mediateurs-${timestamp}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'text/csv; charset=utf-8',
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'export CSV:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(aidants: Array<AidantMediateurAvecAccompagnementReadModel>): string  {
  // En-têtes CSV
  const headers = [
    'ID',
    'Nom',
    'Prénom',
    'Rôles',
    'Labelisations',
    'Formations',
    'Nb Accompagnements',
  ]

  // Fonction pour échapper les valeurs CSV
  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Construction des lignes CSV
  const rows = aidants.map(aidant => [
    escapeCSV(aidant.id),
    escapeCSV(aidant.nom),
    escapeCSV(aidant.prenom),
    escapeCSV(aidant.role.join(', ')),
    escapeCSV(aidant.labelisations.join(', ')),
    escapeCSV(aidant.formations.join(', ')),
    aidant.nbAccompagnements.toString(),
  ])

  // Assemblage final avec BOM UTF-8 pour Excel
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))]
  return `\uFEFF${  csvLines.join('\n')}`
}