import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { LieuInclusionNumeriqueItem } from '@/use-cases/queries/RecupererLieuxInclusion'
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

    // Récupération des paramètres de filtre depuis l'URL
    const { searchParams } = new URL(request.url)
    const codeDepartement = searchParams.get('codeDepartement')
    const codeRegion = searchParams.get('codeRegion')
    const typeStructure = searchParams.get('typeStructure')
    const qpv = searchParams.get('qpv') === 'true'
    const frr = searchParams.get('frr') === 'true'
    const horsZonePrioritaire = searchParams.get('horsZonePrioritaire') === 'true'

    // Détermination du département à utiliser selon le scope de l'utilisateur
    let departementFinal: string | undefined
    let regionFinale: string | undefined

    if (territoireResult.type === 'france') {
      // Administrateur : peut filtrer par département ou région demandé
      departementFinal = codeDepartement ?? undefined
      regionFinale = codeRegion ?? undefined
    } else if (territoireResult.codes.length > 0) {
      // Gestionnaire département ou structure : limité à son département
      const territoireDepartement = territoireResult.codes[0]

      // Vérifier que le filtre demandé correspond bien au scope de l'utilisateur
      if (codeDepartement !== null && codeDepartement !== territoireDepartement) {
        return NextResponse.json({ error: 'Accès refusé : vous ne pouvez exporter que les données de votre département' }, { status: 403 })
      }
      if (codeRegion !== null) {
        return NextResponse.json({ error: 'Accès refusé : vous ne pouvez pas filtrer par région' }, { status: 403 })
      }

      departementFinal = territoireDepartement
      regionFinale = undefined
    } else {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Utiliser une limite élevée pour récupérer tous les résultats pour l'export
    const page = 0
    const limite = 100000

    const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()
    const listeLieuxInclusionReadModel = await listeLieuxInclusionLoader.getLieuxWithPagination(
      page,
      limite,
      departementFinal,
      typeStructure ?? undefined,
      qpv ? qpv : undefined,
      frr ? frr : undefined,
      regionFinale,
      horsZonePrioritaire ? horsZonePrioritaire : undefined
    )

    // Génération du CSV
    const csvContent = generateCSV(listeLieuxInclusionReadModel.lieux)

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const exportFilename = `lieux-inclusion-${timestamp}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Disposition': `attachment; filename="${exportFilename}"`,
        'Content-Type': 'text/csv; charset=utf-8',
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'export CSV:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(lieux: Array<LieuInclusionNumeriqueItem>): string {
  // En-têtes CSV
  const headers = [
    'ID',
    'Nom',
    'Adresse',
    'Type de structure',
    'SIRET',
    'ID Cartographie Nationale',
    'FRR',
    'QPV',
    'Nombre de mandats AC',
    'Nombre d\'accompagnements AC',
    'Nombre d\'accompagnements Coop',
    'Code INSEE',
  ]

  // Fonction pour échapper les valeurs CSV
  function escapeCSV(value: null | number | string | undefined): string {
    if (value === null || value === undefined) {
      return ''
    }
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Construction des lignes CSV
  const rows = lieux.map(lieu => {
    const adresse = [
      lieu.numero_voie,
      lieu.nom_voie,
      lieu.code_postal,
      lieu.nom_commune,
    ].filter(Boolean).join(' ')

    return [
      escapeCSV(lieu.id),
      escapeCSV(lieu.nom),
      escapeCSV(adresse),
      escapeCSV(lieu.categorie_juridique),
      escapeCSV(lieu.siret),
      escapeCSV(lieu.structure_cartographie_nationale_id),
      lieu.est_frr ? 'Oui' : 'Non',
      lieu.est_qpv ? 'Oui' : 'Non',
      escapeCSV(lieu.nb_mandats_ac),
      escapeCSV(lieu.nb_accompagnements_ac),
      escapeCSV(lieu.nb_accompagnements_coop),
      escapeCSV(lieu.code_insee),
    ]
  })

  // Assemblage final avec BOM UTF-8 pour Excel
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}