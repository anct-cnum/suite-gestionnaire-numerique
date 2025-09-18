import { NextRequest, NextResponse } from 'next/server'

import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { FiltreFormations, FiltreGeographique, FiltreHabilitations, FiltreRoles, FiltresListeAidants } from '@/use-cases/queries/RecupererListeAidantsMediateurs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

    let territoire: string
    if (utilisateur.role.type === 'administrateur_dispositif') {
      territoire = 'France'
    } else {
      const departementCode = utilisateur.departementCode
      if (utilisateur.role.type !== 'gestionnaire_departement' ||
          departementCode === null || departementCode === '') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
      territoire = departementCode
    }

    // Récupération des paramètres de filtre
    const searchParams = request.nextUrl.searchParams
    const codeDepartement = searchParams.get('codeDepartement')
    const codeRegion = searchParams.get('codeRegion')
    const roles = searchParams.get('roles')
    const habilitations = searchParams.get('habilitations')
    const formations = searchParams.get('formations')

    // Construction du filtre géographique
    let filtreGeographique: FiltreGeographique | undefined
    if (codeDepartement !== null && codeDepartement !== '') {
      filtreGeographique = {
        code: codeDepartement,
        type: 'departement',
      }
    } else if (codeRegion !== null && codeRegion !== '') {
      filtreGeographique = {
        code: codeRegion,
        type: 'region',
      }
    }

    // Construction de l'objet filtres (sans pagination pour récupérer tous les résultats)
    const filtres: FiltresListeAidants = {
      formations: formations ? formations.split(',') as FiltreFormations : undefined,
      geographique: filtreGeographique,
      habilitations: habilitations ? habilitations.split(',') as FiltreHabilitations : undefined,
      pagination: {
        limite: 999999, // Limite très élevée pour récupérer tous les résultats
        page: 1,
      },
      roles: roles ? roles.split(',') as FiltreRoles : undefined,
      territoire,
    }

    // Récupération des données
    const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
    const listeAidantsMediateursReadModel = await listeAidantsMediateursLoader.get(filtres)

    if ('type' in listeAidantsMediateursReadModel) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    // Génération du CSV
    const csvContent = generateCSV(listeAidantsMediateursReadModel.aidants)

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
    console.error('Erreur lors de l\'export CSV:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(aidants: Array<{
  formations: Array<string>
  id: string
  labelisations: Array<'aidants connect' | 'conseiller numérique'>
  nbAccompagnements: number
  nom: string
  prenom: string
  role: Array<string>
}>): string {
  // En-têtes CSV
  const headers = [
    'ID',
    'Nom',
    'Prénom',
    'Rôles',
    'Labelisations',
    'Formations',
    'Nb Accompagnements'
  ]

  // Fonction pour échapper les valeurs CSV
  const escapeCSV = (value: string): string => {
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
    aidant.nbAccompagnements.toString()
  ])

  // Assemblage final avec BOM UTF-8 pour Excel
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))]
  return '\uFEFF' + csvLines.join('\n')
}