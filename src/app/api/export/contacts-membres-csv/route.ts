import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { Membre, membreInclude, toMembre } from '@/gateways/shared/MembresGouvernance'
import { toRoleViewModel } from '@/presenters/shared/role'
import { escapeCSV } from '@/shared/csv'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

// Sans codeDepartement : export de toutes les gouvernances, réservé aux administrateurs.
// Avec codeDepartement : réservé aux personnes qui peuvent voir cette gouvernance (cf. Contexte.peutVoirGouvernance).
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const codeDepartement = request.nextUrl.searchParams.get('codeDepartement')
    const exportNational = codeDepartement === null || codeDepartement === ''
    const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (exportNational ? !contexte.estNational() : !contexte.peutVoirGouvernance(codeDepartement)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const statut = request.nextUrl.searchParams.get('statut')
    const role = request.nextUrl.searchParams.get('role')
    const typologie = request.nextUrl.searchParams.get('typologie')

    const gouvernancesRecord = await prisma.gouvernanceRecord.findMany({
      include: {
        membres: {
          include: membreInclude,
          orderBy: {
            id: 'asc',
          },
          // Sans statut demandé : candidats et confirmés, jamais les membres supprimés
          where: statut === null || statut === '' ? { statut: { in: ['candidat', 'confirme'] } } : { statut },
        },
        relationDepartement: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: {
        departementCode: 'asc',
      },
      where: exportNational ? {} : { departementCode: codeDepartement },
    })

    // Typologie = libellé de la catégorie juridique de la structure ; '' (« Autre ») si inconnue
    const membres = gouvernancesRecord.flatMap((gouvernance) =>
      gouvernance.membres
        .map((membreRecord) => ({
          ...toMembre(membreRecord),
          codeDepartement: gouvernance.departementCode,
          departement: gouvernance.relationDepartement.nom,
          siret: membreRecord.relationStructureAdministrative.siret ?? '',
        }))
        .filter((membre) => typologie === null || membre.typologie === typologie)
        .filter((membre) => role === null || role === '' || membre.roles.some((membreRole) => membreRole === role))
    )
    const csvContent = generateCSV(membres)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `${exportNational ? 'contacts-membres-gouvernances' : 'contacts-membres'}-${timestamp}.csv`

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

type MembreAExporter = Membre &
  Readonly<{
    codeDepartement: string
    departement: string
    siret: string
  }>

const libelleStatut: Readonly<Record<string, string>> = {
  candidat: 'Candidat',
  confirme: 'Confirmé',
}

function generateCSV(membres: ReadonlyArray<MembreAExporter>): string {
  const headers = [
    'Code département',
    'Département',
    'Structure',
    'SIRET',
    'Typologie',
    'Statut',
    'Rôles',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Fonction',
    'Referent FNE',
  ]

  const rows = membres.flatMap((membre) => {
    const colonnesMembre = [
      escapeCSV(membre.codeDepartement),
      escapeCSV(membre.departement),
      escapeCSV(membre.nom),
      escapeCSV(membre.siret),
      escapeCSV(membre.typologie),
      escapeCSV(libelleStatut[membre.statut] ?? membre.statut),
      escapeCSV(membre.roles.map((membreRole) => toRoleViewModel(membreRole).nom).join(' / ')),
    ]

    if (membre.contacts.length === 0) {
      return [[...colonnesMembre, '', '', '', '', '', '']]
    }

    return membre.contacts.map((contact) => [
      ...colonnesMembre,
      escapeCSV(contact.nom),
      escapeCSV(contact.prenom),
      escapeCSV(contact.email),
      escapeCSV(contact.telephone),
      escapeCSV(contact.fonction),
      contact.estReferentFNE ? 'Oui' : 'Non',
    ])
  })

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
