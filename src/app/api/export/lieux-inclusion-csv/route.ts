import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { LieuInclusionNumeriqueItem } from '@/use-cases/queries/RecupererLieuxInclusion'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    const scopeFiltre = contexte.scopeFiltre()

    if (scopeFiltre.type === 'departemental' && scopeFiltre.codes.length === 0) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupération des paramètres de filtre depuis l'URL
    const { searchParams } = new URL(request.url)
    const codeDepartementDemande = searchParams.get('codeDepartement') ?? undefined
    const codeRegionDemande = searchParams.get('codeRegion') ?? undefined
    const typeStructure = searchParams.get('typeStructure')
    const qpv = searchParams.get('qpv') === 'true'
    const frr = searchParams.get('frr') === 'true'
    const horsZonePrioritaire = searchParams.get('horsZonePrioritaire') === 'true'

    if (scopeFiltre.type === 'departemental') {
      if (codeDepartementDemande !== undefined && !scopeFiltre.codes.includes(codeDepartementDemande)) {
        return NextResponse.json(
          { error: 'Accès refusé : vous ne pouvez exporter que les données de votre département' },
          { status: 403 }
        )
      }
      if (codeRegionDemande !== undefined) {
        return NextResponse.json({ error: 'Accès refusé : vous ne pouvez pas filtrer par région' }, { status: 403 })
      }
    }

    const estAdmin = scopeFiltre.type === 'national'
    const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()
    const listeLieuxInclusionReadModel = await listeLieuxInclusionLoader.getLieuxWithPagination(
      0,
      100000,
      estAdmin ? codeDepartementDemande : undefined,
      typeStructure ?? undefined,
      qpv ? qpv : undefined,
      frr ? frr : undefined,
      estAdmin ? codeRegionDemande : undefined,
      horsZonePrioritaire ? horsZonePrioritaire : undefined,
      scopeFiltre
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
    console.error("Erreur lors de l'export CSV:", error)
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
    "Nombre d'accompagnements AC",
    "Nombre d'accompagnements Coop",
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
  const rows = lieux.map((lieu) => {
    const adresse = [lieu.numero_voie, lieu.nom_voie, lieu.code_postal, lieu.nom_commune].filter(Boolean).join(' ')

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
  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
