import { NextResponse } from 'next/server'

import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateursAExporterLoader } from '@/gateways/PrismaUtilisateursAExporterLoader'
import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import {
  RecupererUtilisateursAExporter,
  UtilisateursAExporterReadModel,
} from '@/use-cases/queries/RecupererUtilisateursAExporter'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const uid = await getSessionUtilisateurId()
    const utilisateurCourant = await new PrismaUtilisateurLoader().findById(uid)

    if (!utilisateurCourant.role.doesItBelongToGroupeAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const recupererUtilisateursAExporter = new RecupererUtilisateursAExporter(new PrismaUtilisateursAExporterLoader())
    const utilisateurs = await recupererUtilisateursAExporter.handle()

    const csvContent = generateCSV(utilisateurs)

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

function generateCSV(utilisateurs: UtilisateursAExporterReadModel): string {
  const headers = [
    'Nom',
    'Prénom',
    'Adresse électronique',
    'Téléphone',
    'Rôle',
    'Structure',
    'SIRET',
    'Départements',
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
    escapeCSV(utilisateur.role),
    escapeCSV(utilisateur.structure),
    escapeCSV(utilisateur.siret),
    escapeCSV(utilisateur.departements.join(' / ')),
    utilisateur.isActive ? 'Activé' : 'En attente',
    utilisateur.derniereConnexion === null ? '' : formaterEnDateFrancaise(utilisateur.derniereConnexion),
  ])

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]
  return `\uFEFF${csvLines.join('\n')}`
}
