import { NextRequest, NextResponse } from 'next/server'

import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaPostesConseillerNumeriqueLoader } from '@/gateways/PrismaPostesConseillerNumeriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { buildFiltresPostesConseillerNumerique } from '@/shared/filtresPostesConseillerNumeriqueUtils'
import { PosteConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const { searchParams } = request.nextUrl
    const filtres = buildFiltresPostesConseillerNumerique(
      {
        bonification: searchParams.get('bonification') ?? undefined,
        codeDepartement: searchParams.get('codeDepartement') ?? undefined,
        codeRegion: searchParams.get('codeRegion') ?? undefined,
        conventions: searchParams.get('conventions') ?? undefined,
        statut: searchParams.get('statut') ?? undefined,
        typesEmployeur: searchParams.get('typesEmployeur') ?? undefined,
        typesPoste: searchParams.get('typesPoste') ?? undefined,
      },
      territoire === 'France' ? undefined : territoire,
      100000
    )

    let territoireEffectif = territoire
    let codeRegionEffectif: string | undefined
    if (filtres.codeDepartement !== undefined) {
      territoireEffectif = filtres.codeDepartement
    } else if (filtres.codeRegion !== undefined) {
      territoireEffectif = 'France'
      codeRegionEffectif = filtres.codeRegion
    }

    const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
    const postesReadModel = await postesLoader.get({
      bonification: filtres.bonification,
      codeRegion: codeRegionEffectif,
      conventions: filtres.conventions,
      pagination: {
        limite: filtres.limite,
        page: 1,
      },
      statut: filtres.statut,
      territoire: territoireEffectif,
      typesEmployeur: filtres.typesEmployeur,
      typesPoste: filtres.typesPoste,
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
    console.error("Erreur lors de l'export CSV:", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function generateCSV(postes: ReadonlyArray<PosteConseillerNumeriqueReadModel>): string {
  const headers = [
    'ID Poste',
    'ID Structure TP',
    'Structure',
    'Département',
    'Statut',
    'Coordinateur',
    'Convention',
    'Fin de convention',
    'Fin de contrat',
    'Bonification',
    'Total conventionné',
    'Total versé',
  ]

  function escapeCSV(value: null | string | undefined): string {
    if (value === null || value === undefined) {
      return ''
    }
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  function formaterConvention(enveloppes: null | string): string {
    if (enveloppes === null) {
      return ''
    }
    if (enveloppes.includes(',')) {
      return 'Renouvellement'
    }
    const mapping: Record<string, string> = {
      V1: 'Initiale',
      V2: 'Renouvellement',
    }
    return mapping[enveloppes] ?? enveloppes
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
    poste.structureTpId === null ? '' : poste.structureTpId.toString(),
    escapeCSV(poste.nomStructure),
    poste.codeDepartement,
    getStatutLabel(poste.statut),
    poste.estCoordinateur ? 'Oui' : 'Non',
    formaterConvention(poste.sourcesFinancement),
    poste.dateFinConvention === null ? '' : formaterEnDateFrancaise(poste.dateFinConvention),
    poste.dateFinContrat === null ? '' : formaterEnDateFrancaise(poste.dateFinContrat),
    poste.bonification ? 'Oui' : 'Non',
    poste.totalConventionne.toString(),
    poste.totalVerse.toString(),
  ])

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
