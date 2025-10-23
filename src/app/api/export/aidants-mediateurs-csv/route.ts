import { NextRequest, NextResponse } from 'next/server'

import { TypologieRole } from '@/domain/Role'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
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

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

    const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
    const territoireResult = await territoireUseCase.handle(utilisateur)

    // Récupération des paramètres de filtre
    const searchParams = request.nextUrl.searchParams
    const codeDepartementDemande = searchParams.get('codeDepartement') ?? undefined
    const codeRegionDemande = searchParams.get('codeRegion') ?? undefined

    let territoire: string
    let codeDepartementFinal: string | undefined
    let codeRegionFinal: string | undefined

    if (territoireResult.type === 'france') {
      // Administrateur : peut filtrer par département ou région demandé
      territoire = 'France'
      codeDepartementFinal = codeDepartementDemande
      codeRegionFinal = codeRegionDemande
    } else if (territoireResult.codes.length > 0) {
      // Gestionnaire département ou structure : limité à son département
      territoire = territoireResult.codes[0]

      // Vérifier que le filtre demandé correspond bien au scope de l'utilisateur
      if (codeDepartementDemande !== undefined && codeDepartementDemande !== territoire) {
        return NextResponse.json({ error: 'Accès refusé : vous ne pouvez exporter que les données de votre département' }, { status: 403 })
      }
      if (codeRegionDemande !== undefined) {
        return NextResponse.json({ error: 'Accès refusé : vous ne pouvez pas filtrer par région' }, { status: 403 })
      }

      // Force le département de l'utilisateur
      codeDepartementFinal = undefined // Le territoire sera utilisé par buildFiltresForExport
      codeRegionFinal = undefined
    } else {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const params: FiltresURLParams = {
      codeDepartement: codeDepartementFinal,
      codeRegion: codeRegionFinal,
      formations: searchParams.get('formations') ?? undefined,
      habilitations: searchParams.get('habilitations') ?? undefined,
      roles: searchParams.get('roles') ?? undefined,
    }

    // Utiliser la fonction utilitaire pour construire les filtres
    const filtres = buildFiltresForExport(
      params,
      territoire,
      utilisateur.role.nom as TypologieRole
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