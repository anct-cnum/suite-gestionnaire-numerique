import prisma from '../../../../../prisma/prismaClient'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'

// Création d'un lieu (#1495) : session → rôle. Pas de flag bêta ni de lieu à charger,
// la règle de périmètre vit dans le domaine (LieuInclusion.peutEtreCreePar).
export async function verifierDroitsCreationLieu(): Promise<VerificationDroitsCreationLieu> {
  const utilisateurId = await getSessionUtilisateurId()
  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(utilisateurId)

  if (!LieuInclusion.peutEtreCreePar(utilisateur)) {
    return { message: "Vous n'avez pas les droits pour créer un lieu", statut: 'refus' }
  }

  return { statut: 'ok' }
}

type VerificationDroitsCreationLieu = Readonly<{ message: string; statut: 'refus' }> | Readonly<{ statut: 'ok' }>
