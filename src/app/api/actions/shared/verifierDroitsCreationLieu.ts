import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

// Création d'un lieu (#1495) : session → porte bêta → règle de domaine. La porte est la même
// que celle des autres actions sur un lieu (verifierDroitsLieu), pour qu'il n'y ait qu'un
// endroit à ouvrir quand #1716 sera tranché. La règle de domaine, elle, ne contrôle aucun
// périmètre : voir LieuInclusion.peutEtreCreePar (#2226).
export async function verifierDroitsCreationLieu(): Promise<VerificationDroitsCreationLieu> {
  const utilisateurId = await getSessionUtilisateurId()

  const contexte = await resoudreContexte(
    await new PrismaUtilisateurLoader().findById(utilisateurId),
    new PrismaMembreLoader()
  )
  if (!contexte.peutGererLesLieux()) {
    return { message: 'Action réservée aux bêta-testeurs', statut: 'refus' }
  }

  if (!LieuInclusion.peutEtreCreePar()) {
    return { message: "Vous n'avez pas les droits pour créer un lieu", statut: 'refus' }
  }

  return { statut: 'ok' }
}

type VerificationDroitsCreationLieu = Readonly<{ message: string; statut: 'refus' }> | Readonly<{ statut: 'ok' }>
