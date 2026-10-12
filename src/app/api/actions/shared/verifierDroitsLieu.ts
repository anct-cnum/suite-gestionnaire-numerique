import prisma from '../../../../../prisma/prismaClient'
import { GestionnaireStructure } from '@/domain/GestionnaireStructure'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { Utilisateur } from '@/domain/Utilisateur'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuxDeLaStructureLoader } from '@/gateways/PrismaLieuxDeLaStructureLoader'
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
    if (!contexte.peutGererLesLieux()) {
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

  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    {
      codeDepartement: lieu.codeDepartement,
      codeRegion: lieu.codeRegion,
      estDeLaStructureDuDemandeur: await estLieuDeLaStructureDuDemandeur(utilisateur, Number(lieuId)),
    },
    await departementsCoportesParLeDemandeur(utilisateur)
  )
  if (!peutModifier) {
    return refus(`Vous n'avez pas les droits pour ${options.action} ce lieu`)
  }

  return { lieu, statut: 'ok' }
}

// Départements des gouvernances dont la structure du DEMANDEUR est co-porteuse (membre confirmé) :
// c'est son périmètre qui est comparé au lieu, jamais celui de la structure du lieu (#1979). Un
// co-porteur a sur les lieux de son département les mêmes droits qu'un gestionnaire département ;
// un simple membre de gouvernance n'en a aucun (#2081).
export async function departementsCoportesParLeDemandeur(utilisateur: Utilisateur): Promise<ReadonlyArray<string>> {
  if (!(utilisateur instanceof GestionnaireStructure)) {
    return []
  }
  const appartenances = await new PrismaMembreLoader().getToutesAppartenancesParStructureId(
    utilisateur.state.structureUid.value
  )
  return appartenances
    .filter((appartenance) => appartenance.estCoporteur)
    .map((appartenance) => appartenance.codeDepartement)
}

// Un lieu est à la structure du demandeur selon la même définition que le listing des lieux : tous les
// employeurs du lieu, lieux quittés compris (#2092). Seul un gestionnaire de structure en tire des droits.
export async function estLieuDeLaStructureDuDemandeur(utilisateur: Utilisateur, lieuId: number): Promise<boolean> {
  if (!(utilisateur instanceof GestionnaireStructure)) {
    return false
  }
  return new PrismaLieuxDeLaStructureLoader().estLieuDeLaStructure(lieuId, utilisateur.state.structureUid.value)
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
