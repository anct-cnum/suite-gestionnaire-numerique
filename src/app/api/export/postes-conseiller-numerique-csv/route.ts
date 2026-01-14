import { NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaPostesConseillerNumeriqueLoader } from '@/gateways/PrismaPostesConseillerNumeriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { PosteConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

    const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
    const territoireResult = await territoireUseCase.handle(utilisateur)

    let territoire: string
    if (territoireResult.type === 'france') {
      territoire = 'France'
    } else if (territoireResult.codes.length > 0) {
      territoire = territoireResult.codes[0]
    } else {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
    const postesReadModel = await postesLoader.get({
      pagination: {
        limite: 100000,
        page: 1,
      },
      territoire,
    })

    if ('type' in postesReadModel) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
    }

    const csvContent = generateCSV(postesReadModel.postes)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `postes-conseiller-numerique-${timestamp}.csv`

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

function generateCSV(postes: ReadonlyArray<PosteConseillerNumeriqueReadModel>): string {
  const headers = [
    'ID Poste',
    'Structure',
    'Département',
    'Statut',
    'Coordinateur',
    'Sources financement',
    'Fin de convention',
    'Fin de contrat',
    'Bonification',
    'Total conventionné',
    'Total versé',
  ]

  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  function getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      occupe: 'Occupé',
      rendu: 'Rendu',
      vacant: 'Vacant',
    }
    return labels[statut] ?? statut
  }

  const rows = postes.map((poste) => [
    poste.posteConumId.toString(),
    escapeCSV(poste.nomStructure),
    poste.codeDepartement,
    getStatutLabel(poste.statut),
    poste.estCoordinateur ? 'Oui' : 'Non',
    escapeCSV(poste.sourcesFinancement ?? ''),
    poste.dateFinConvention === null ? '' : formaterEnDateFrancaise(poste.dateFinConvention),
    poste.dateFinContrat === null ? '' : formaterEnDateFrancaise(poste.dateFinContrat),
    poste.bonification ? 'Oui' : 'Non',
    poste.totalConventionne.toString(),
    poste.totalVerse.toString(),
  ])

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
