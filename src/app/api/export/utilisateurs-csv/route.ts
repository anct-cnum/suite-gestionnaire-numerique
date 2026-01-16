import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'
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
    const utilisateursActives = searchParams.get('utilisateursActives') === 'on'
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

    // Récupérer les noms des départements et régions
    const structureIds = result.utilisateursCourants
      .map((utilisateur) => utilisateur.structureId)
      .filter((id): id is number => id !== null)
    const territoireLoader = new PrismaTerritoireLoader()
    const territoires = await territoireLoader.recupererTerritoires(structureIds)

    const csvContent = generateCSV(result.utilisateursCourants, territoires)

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

function getDepartementEtRegion(
  utilisateur: UnUtilisateurReadModel,
  territoires: TerritoiresReadModel
): { departement: string; region: string } {
  const { departements, structureDepartements } = territoires

  // Créer des maps pour un accès rapide
  const departementParCode = new Map(departements.map((dept) => [dept.code, dept]))
  const regionParCode = new Map(departements.map((dept) => [dept.regionCode, dept.regionNom]))

  // Pour un gestionnaire de région
  if (utilisateur.regionCode !== null) {
    return {
      departement: '',
      region: regionParCode.get(utilisateur.regionCode) ?? '',
    }
  }

  // Pour un gestionnaire de département
  if (utilisateur.departementCode !== null) {
    const deptInfo = departementParCode.get(utilisateur.departementCode)
    if (deptInfo !== undefined) {
      return {
        departement: deptInfo.nom,
        region: deptInfo.regionNom,
      }
    }
  }

  // Pour un gestionnaire de structure, utiliser le département de l'adresse
  if (utilisateur.structureId !== null) {
    const codeDept = structureDepartements.get(utilisateur.structureId)
    if (codeDept !== undefined) {
      const deptInfo = departementParCode.get(codeDept)
      if (deptInfo !== undefined) {
        return {
          departement: deptInfo.nom,
          region: deptInfo.regionNom,
        }
      }
    }
  }

  return { departement: '', region: '' }
}

function generateCSV(
  utilisateurs: ReadonlyArray<UnUtilisateurReadModel>,
  territoires: TerritoiresReadModel
): string {
  const headers = [
    'Nom',
    'Prénom',
    'Adresse électronique',
    'Téléphone',
    'Rôle',
    'Structure',
    'Département',
    'Région',
    'Statut',
    'Dernière connexion',
  ]

  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const rows = utilisateurs.map((utilisateur) => {
    const { departement, region } = getDepartementEtRegion(utilisateur, territoires)
    return [
      escapeCSV(utilisateur.nom),
      escapeCSV(utilisateur.prenom),
      escapeCSV(utilisateur.email),
      escapeCSV(utilisateur.telephone),
      escapeCSV(utilisateur.role.nom),
      escapeCSV(utilisateur.role.organisation),
      escapeCSV(departement),
      escapeCSV(region),
      utilisateur.isActive ? 'Activé' : 'En attente',
      utilisateur.isActive ? formaterEnDateFrancaise(utilisateur.derniereConnexion) : '',
    ]
  })

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
