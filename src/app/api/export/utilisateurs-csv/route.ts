import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const uid = await getSessionSub()
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateurCourant = await utilisateurLoader.findByUid(uid)

    if (!utilisateurCourant.role.doesItBelongToGroupeAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const codeDepartement = searchParams.get('codeDepartement') ?? '0'
    const codeRegion = searchParams.get('codeRegion') ?? '0'
    const roles = searchParams.get('roles')?.split(',').filter(Boolean) ?? []
    const utilisateursActives = searchParams.get('utilisateursActives') === 'true'
    const prenomOuNomOuEmail = searchParams.get('prenomOuNomOuEmail') ?? undefined
    const idStructureParam = searchParams.get('idStructure')
    const idStructure = idStructureParam !== null && idStructureParam !== ''
      ? Number(idStructureParam)
      : undefined

    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
    const result = await rechercherMesUtilisateurs.handle({
      codeDepartement,
      codeRegion,
      idStructure,
      pageCourante: 0,
      prenomOuNomOuEmail,
      roles,
      uid,
      utilisateursActives,
      utilisateursParPage: 100000,
    })

    const csvContent = generateCSV(result.utilisateursCourants)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `utilisateurs-${timestamp}.csv`

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

function generateCSV(utilisateurs: ReadonlyArray<UnUtilisateurReadModel>): string {
  const headers = [
    'Nom',
    'Prénom',
    'Adresse électronique',
    'Téléphone',
    'Rôle',
    'Structure',
    'Statut',
    'Dernière connexion',
  ]

  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const rows = utilisateurs.map((utilisateur) => [
    escapeCSV(utilisateur.nom),
    escapeCSV(utilisateur.prenom),
    escapeCSV(utilisateur.email),
    escapeCSV(utilisateur.telephone),
    escapeCSV(utilisateur.role.nom),
    escapeCSV(utilisateur.role.organisation),
    utilisateur.isActive ? 'Activé' : 'En attente',
    utilisateur.isActive ? formaterEnDateFrancaise(utilisateur.derniereConnexion) : '',
  ])

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
