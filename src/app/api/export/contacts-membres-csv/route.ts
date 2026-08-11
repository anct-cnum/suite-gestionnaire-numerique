import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../prisma/prismaClient'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { membreInclude, toMembres } from '@/gateways/shared/MembresGouvernance'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const codeDepartement = request.nextUrl.searchParams.get('codeDepartement')
    if (codeDepartement === null || codeDepartement === '') {
      return NextResponse.json({ error: 'Paramètre codeDepartement manquant' }, { status: 400 })
    }

    const statut = request.nextUrl.searchParams.get('statut')
    const role = request.nextUrl.searchParams.get('role')
    const typologie = request.nextUrl.searchParams.get('typologie')

    const gouvernanceRecord = await prisma.gouvernanceRecord.findUniqueOrThrow({
      include: {
        membres: {
          include: membreInclude,
          orderBy: {
            id: 'asc',
          },
          where: {
            AND: [statut === null || statut === '' ? {} : { statut }, filtreParTypologie(typologie)],
          },
        },
      },
      where: {
        departementCode: codeDepartement,
      },
    })

    const membres = toMembres(gouvernanceRecord.membres).filter(
      (membre) => role === null || role === '' || membre.roles.some((membreRole) => membreRole === role)
    )
    const csvContent = generateCSV(membres)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const filename = `contacts-membres-${timestamp}.csv`

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

function filtreParTypologie(typologie: null | string): Prisma.MembreRecordWhereInput {
  if (typologie === null) {
    return {}
  }
  if (typologie === '') {
    // « Autre » : membres dont la typologie n’est pas renseignée
    return { OR: [{ type: null }, { type: '' }] }
  }
  return { type: typologie }
}

type MembreAvecContacts = Readonly<{
  contacts: ReadonlyArray<
    Readonly<{
      email: string
      estReferentFNE: boolean
      fonction: string
      nom: string
      prenom: string
      telephone: string
    }>
  >
  nom: string
  type: string
}>

function generateCSV(membres: ReadonlyArray<MembreAvecContacts>): string {
  const headers = ['Structure', 'Typologie', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Fonction', 'Referent FNE']

  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const rows = membres.flatMap((membre) => {
    if (membre.contacts.length === 0) {
      return [[escapeCSV(membre.nom), escapeCSV(membre.type), '', '', '', '', '', '']]
    }

    return membre.contacts.map((contact) => [
      escapeCSV(membre.nom),
      escapeCSV(membre.type),
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
