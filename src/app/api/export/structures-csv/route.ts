import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeStructuresLoader } from '@/gateways/PrismaListeStructuresLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import {
  buildFiltresListeStructuresForExport,
  FiltresListeStructuresURLParams,
} from '@/shared/filtresListeStructuresUtils'
import { estLabelConumActif } from '@/use-cases/commands/AttesterLabellisationStructure'
import { StructureListeReadModel } from '@/use-cases/queries/RecupererListeStructures'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

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
    const params: FiltresListeStructuresURLParams = {
      codeDepartement: estAdmin ? codeDepartementDemande : undefined,
      codeRegion: estAdmin ? codeRegionDemande : undefined,
      labellisation: searchParams.get('labellisation') ?? undefined,
      recherche: searchParams.get('recherche') ?? undefined,
    }

    const filtres = buildFiltresListeStructuresForExport(params, scopeFiltre)

    const structures = await new PrismaListeStructuresLoader().getForExport(filtres)

    if ('type' in structures) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    const now = new Date()
    const csvContent = generateCSV(structures, now)

    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `structures-${timestamp}.csv`

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

function generateCSV(structures: Array<StructureListeReadModel>, now: Date): string {
  const headers = ['Nom', 'Typologie', 'Code postal', 'Commune', 'Adresse', 'SIRET', 'Labellisation / habilitation']

  // Fonction pour échapper les valeurs CSV
  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  function labellisations(structure: StructureListeReadModel): string {
    const labels: Array<string> = []
    if (estLabelConumActif(structure.derniereAttestationLabelConum, now) || structure.possedePosteConumActif) {
      labels.push('Conseiller numérique')
    }
    if (structure.estHabiliteeAidantsConnect) {
      labels.push('Aidants Connect')
    }
    return labels.join(', ')
  }

  const rows = structures.map((structure) => [
    escapeCSV(structure.nom),
    escapeCSV(structure.typologie),
    escapeCSV(structure.codePostal),
    escapeCSV(structure.commune),
    escapeCSV(structure.adresse),
    escapeCSV(structure.siret),
    escapeCSV(labellisations(structure)),
  ])

  // Assemblage final avec BOM UTF-8 pour Excel
  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
