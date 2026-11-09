import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'

import { PrismaGouvernanceStructureLoader } from '@/gateways/PrismaGouvernanceStructureLoader'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import {
  ENTETES_UTILISATEURS_GOUVERNANCES,
  genererLigneUtilisateurGouvernance,
} from '@/presenters/exportUtilisateursPresenter'

// Export des utilisateurs de MIN appelé chaque nuit par Airflow pour alimenter Brevo.
// Mêmes calculs que /api/export/utilisateurs-gouvernances-csv, sans session : l'accès est protégé par un secret.
// Téléphone, SIRET et Territoires ne servent pas à Brevo : ils ne quittent donc pas MIN.
const COLONNES_BREVO: ReadonlyArray<(typeof ENTETES_UTILISATEURS_GOUVERNANCES)[number]> = [
  'Nom',
  'Prénom',
  'Adresse électronique',
  'Rôle',
  'Structure',
  'Département',
  'Région',
  'Statut',
  'Dernière connexion',
  'Statut de la structure',
  'Rôle gouvernance',
]

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!estAutorise(request.headers.get('authorization'))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const utilisateurs = await new PrismaUtilisateurLoader().tousLesUtilisateurs()
    const structureIds = utilisateurs
      .map((utilisateur) => utilisateur.structureId)
      .filter((id): id is number => id !== null)
    const [territoires, gouvernanceParStructure] = await Promise.all([
      new PrismaTerritoireLoader().recupererTerritoires(structureIds),
      new PrismaGouvernanceStructureLoader().recupererGouvernanceDesStructures(structureIds),
    ])

    const indexColonnes = COLONNES_BREVO.map((colonne) => ENTETES_UTILISATEURS_GOUVERNANCES.indexOf(colonne))
    const lignes = utilisateurs.map((utilisateur) => {
      const ligne = genererLigneUtilisateurGouvernance(utilisateur, territoires, gouvernanceParStructure)
      return indexColonnes.map((index) => ligne[index]).join(',')
    })

    return new NextResponse(`\uFEFF${[COLONNES_BREVO.join(','), ...lignes].join('\n')}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'export Brevo des utilisateurs :", error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function estAutorise(authorization: null | string): boolean {
  const secret = process.env.EXPORT_BREVO_SECRET
  if (secret === undefined || secret === '' || authorization === null) {
    return false
  }

  // Comparaison des empreintes à temps constant : la durée de la réponse ne renseigne pas sur le secret
  return timingSafeEqual(empreinte(authorization), empreinte(`Bearer ${secret}`))
}

function empreinte(valeur: string): Buffer {
  return createHash('sha256').update(valeur).digest()
}
