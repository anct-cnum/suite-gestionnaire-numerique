import prisma from '../../../../../prisma/prismaClient'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

// Un lieu porté par la Coop numérique : la Coop garde sa vérité, le filet
// quotidien du dataspace réaligne le référentiel sur elle par valeurs — toute
// écriture MIN serait écrasée le lendemain. Lecture seule dans MIN (#1951).
export const MESSAGE_LIEU_GERE_PAR_LA_COOP =
  'Ce lieu est géré dans la Coop numérique : il ne peut pas être modifié depuis Mon Inclusion Numérique.'

// Vérification partagée par toutes les actions sur un lieu d'inclusion :
// session → [flag bêta] → lieu chargé → lieu coop refusé → droits du rôle.
export async function verifierDroitsLieu(lieuId: string, options: Options): Promise<VerificationDroitsLieu> {
  const utilisateurId = await getSessionUtilisateurId()

  if (options.reserveAuxBetaTesteurs) {
    const contexte = await resoudreContexte(
      await new PrismaUtilisateurLoader().findById(utilisateurId),
      new PrismaMembreLoader()
    )
    if (!contexte.isBetaTesteur) {
      return refus('Action réservée aux bêta-testeurs')
    }
  }

  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(utilisateurId)

  const lieu = await new PrismaRecupererLieuDetailsLoader().recuperer(lieuId)
  if ('type' in lieu) {
    return refus('Lieu non trouvé')
  }

  if (lieu.estLieuCoop) {
    return refus(MESSAGE_LIEU_GERE_PAR_LA_COOP)
  }

  // Départements des gouvernances dont la structure du lieu est membre.
  const gouvernancesDepartements = await prisma.membreRecord.findMany({
    select: {
      gouvernanceDepartementCode: true,
    },
    where: {
      dateSuppression: null,
      structureId: lieu.structureId,
    },
  })
  const departementsGouvernances = gouvernancesDepartements.map((membre) => membre.gouvernanceDepartementCode)

  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieu.codeDepartement,
    lieu.structureId,
    lieu.personnesTravaillant.length,
    departementsGouvernances
  )
  if (!peutModifier) {
    return refus(`Vous n'avez pas les droits pour ${options.action} ce lieu`)
  }

  return { lieu, statut: 'ok' }
}

type VerificationDroitsLieu =
  Readonly<{ lieu: LieuDetailsReadModel; statut: 'ok' }> | Readonly<{ message: string; statut: 'refus' }>

type Options = Readonly<{
  action: 'modifier' | 'supprimer'
  reserveAuxBetaTesteurs: boolean
}>

function refus(message: string): VerificationDroitsLieu {
  return { message, statut: 'refus' }
}
