import { NextRequest, NextResponse } from 'next/server'

import { TypologieRole } from '@/domain/Role'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { buildFiltresForExport, FiltresURLParams } from '@/shared/filtresAidantsMediateursUtils'
import { AidantMediateurAvecAccompagnementReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
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

    // Récupération des paramètres de filtre
    const searchParams = request.nextUrl.searchParams
    const codeDepartementDemande = searchParams.get('codeDepartement') ?? undefined
    const codeRegionDemande = searchParams.get('codeRegion') ?? undefined

    if (scopeFiltre.type === 'departemental') {
      if (scopeFiltre.codes.length === 0) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
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
    const params: FiltresURLParams = {
      codeDepartement: estAdmin ? codeDepartementDemande : undefined,
      codeRegion: estAdmin ? codeRegionDemande : undefined,
      formations: searchParams.get('formations') ?? undefined,
      habilitations: searchParams.get('habilitations') ?? undefined,
      roles: searchParams.get('roles') ?? undefined,
    }

    // Utiliser la fonction utilitaire pour construire les filtres
    const filtres = buildFiltresForExport(params, scopeFiltre, utilisateur.role.nom as TypologieRole)

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
    console.error("Erreur lors de l'export CSV:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(aidants: Array<AidantMediateurAvecAccompagnementReadModel>): string {
  // En-têtes CSV
  const headers = [
    'ID',
    'Nom',
    'Prénom',
    'Rôles',
    'Labelisations',
    'Formations',
    'Nb Accompagnements',
    'Nom structure',
    'SIRET structure',
    'Adresse structure',
  ]

  // Fonction pour échapper les valeurs CSV
  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Construction des lignes CSV
  const rows = aidants.map((aidant) => [
    escapeCSV(aidant.id),
    escapeCSV(aidant.nom),
    escapeCSV(aidant.prenom),
    escapeCSV(aidant.role.join(', ')),
    escapeCSV(aidant.labelisations.join(', ')),
    escapeCSV(aidant.formations.join(', ')),
    aidant.nbAccompagnements.toString(),
    escapeCSV(aidant.nomStructure),
    escapeCSV(aidant.siretStructure),
    escapeCSV(aidant.adresseStructure),
  ])

  // Assemblage final avec BOM UTF-8 pour Excel
  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
