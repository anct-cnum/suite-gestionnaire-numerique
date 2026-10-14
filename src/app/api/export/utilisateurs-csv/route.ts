import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { ENTETES_UTILISATEURS, genererLigneUtilisateur } from '@/presenters/exportUtilisateursPresenter'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const uid = await getSessionUtilisateurId()
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateurCourant = await utilisateurLoader.findById(uid)

    if (!utilisateurCourant.role.doesItBelongToGroupeAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const codeDepartement = searchParams.get('codeDepartement') ?? '0'
    const codeEpci = searchParams.get('codeEpci') ?? '0'
    const codeRegion = searchParams.get('codeRegion') ?? '0'
    const roles = searchParams.get('roles')?.split(',').filter(Boolean) ?? []
    const utilisateursActives = searchParams.get('utilisateursActives') === 'on'
    const prenomOuNomOuEmail = searchParams.get('prenomOuNomOuEmail') ?? undefined
    const idStructureParam = searchParams.get('idStructure')
    const idStructure = idStructureParam !== null && idStructureParam !== '' ? Number(idStructureParam) : undefined

    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
    const result = await rechercherMesUtilisateurs.handle({
      codeDepartement,
      codeEpci,
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
    console.error("Erreur lors de l'export CSV:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(utilisateurs: ReadonlyArray<UnUtilisateurReadModel>, territoires: TerritoiresReadModel): string {
  const rows = utilisateurs.map((utilisateur) => genererLigneUtilisateur(utilisateur, territoires))
  const csvLines = [ENTETES_UTILISATEURS.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
