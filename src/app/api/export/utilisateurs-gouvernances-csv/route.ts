import { NextResponse } from 'next/server'

import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceStructureLoader } from '@/gateways/PrismaGouvernanceStructureLoader'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import {
  ENTETES_UTILISATEURS_GOUVERNANCES,
  genererLigneUtilisateurGouvernance,
} from '@/presenters/exportUtilisateursPresenter'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { GouvernanceStructureReadModel } from '@/use-cases/queries/shared/GouvernanceStructureReadModel'
import { TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export async function GET(): Promise<NextResponse> {
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

    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
    const result = await rechercherMesUtilisateurs.handle({ pageCourante: 0, uid, utilisateursParPage: 100000 })

    const structureIds = result.utilisateursCourants
      .map((utilisateur) => utilisateur.structureId)
      .filter((id): id is number => id !== null)

    const territoireLoader = new PrismaTerritoireLoader()
    const gouvernanceStructureLoader = new PrismaGouvernanceStructureLoader()
    const [territoires, gouvernanceParStructure] = await Promise.all([
      territoireLoader.recupererTerritoires(structureIds),
      gouvernanceStructureLoader.recupererGouvernanceDesStructures(structureIds),
    ])

    const csvContent = generateCSV(result.utilisateursCourants, territoires, gouvernanceParStructure)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `utilisateurs-gouvernances-${timestamp}.csv`

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

function generateCSV(
  utilisateurs: ReadonlyArray<UnUtilisateurReadModel>,
  territoires: TerritoiresReadModel,
  gouvernanceParStructure: GouvernanceStructureReadModel
): string {
  const rows = utilisateurs.map((utilisateur) =>
    genererLigneUtilisateurGouvernance(utilisateur, territoires, gouvernanceParStructure)
  )
  const csvLines = [ENTETES_UTILISATEURS_GOUVERNANCES.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
