'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { createApiEntrepriseLoader } from '@/gateways/factories/apiEntrepriseLoaderFactory'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  Failure,
  ModifierLieuInclusionInformationsGenerales,
} from '@/use-cases/commands/ModifierLieuInclusionInformationsGenerales'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
}

export async function modifierLieuInclusionInformationsGeneralesAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    try {
      const droits = await verifierDroits(validationResult.data.structureId)
      if (droits !== 'OK') {
        return [droits]
      }

      const modification = await construireModification(validationResult.data)
      if (typeof modification === 'string') {
        return [modification]
      }

      const result = await new ModifierLieuInclusionInformationsGenerales(
        new ApiBanGeocodingGateway(),
        new PrismaLieuInclusionRepository(),
        new Date()
      ).handle({
        modification,
        structureId: validationResult.data.structureId,
      })

      if (result !== 'OK') {
        return [MESSAGES_ECHEC[result]]
      }

      revalidatePath(validationResult.data.path)

      return ['OK']
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la modification'
      return [errorMessage]
    }
  })
}

// Règle de gestion #1498 : avec SIRET, les données proviennent de l'API Entreprise —
// elles sont re-résolues ici côté serveur, jamais reprises du client — à l'exception
// des typologies, saisies par l'utilisateur depuis le référentiel de la médiation numérique.
async function construireModification(params: ParamsValides): Promise<Modification | string> {
  if (params.siret !== undefined && params.siret !== '') {
    if (params.typologies === undefined || params.typologies.length === 0) {
      return 'Au moins une typologie doit être renseignée'
    }

    const entreprise = await new RechercherUneEntreprise(createApiEntrepriseLoader(params.siret)).handle({
      siret: params.siret,
    })

    if ('estTrouvee' in entreprise) {
      return 'Aucune entreprise trouvée avec cet identifiant'
    }

    return {
      avecSiret: {
        entreprise: {
          adresse: entreprise.adresse,
          codeInsee: entreprise.codeInsee,
          codePostal: entreprise.codePostal,
          commune: entreprise.commune,
          denomination: entreprise.denomination,
          nomVoie: entreprise.nomVoie,
          numeroVoie: entreprise.numeroVoie,
        },
        siret: params.siret,
        typologies: params.typologies,
      },
    }
  }

  if (
    params.adresse === undefined ||
    params.nom === undefined ||
    params.typologies === undefined ||
    params.typologies.length === 0
  ) {
    return 'Sans SIRET, le nom, l’adresse et au moins une typologie doivent être renseignés'
  }

  return {
    sansSiret: {
      adresse: params.adresse,
      complementAdresse: params.complementAdresse ?? '',
      itinerant: params.itinerant ?? false,
      nom: params.nom,
      typologies: params.typologies,
    },
  }
}

async function verifierDroits(structureId: string): Promise<string> {
  const sub = await getSessionSub()

  // Garde : édition réservée aux bêta-testeurs.
  const contexte = await resoudreContexte(await new PrismaUtilisateurLoader().findByUid(sub), new PrismaMembreLoader())
  if (!contexte.isBetaTesteur) {
    return 'Action réservée aux bêta-testeurs'
  }

  const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurRepository.get(sub)

  const loader = new PrismaRecupererLieuDetailsLoader()
  const lieuDetailsReadModel = await loader.recuperer(structureId)

  if ('type' in lieuDetailsReadModel) {
    return 'Lieu non trouvé'
  }

  // Récupérer les départements des gouvernances dont la structure est membre
  const gouvernancesDepartements = await prisma.membreRecord.findMany({
    select: {
      gouvernanceDepartementCode: true,
    },
    where: {
      dateSuppression: null,
      structureId: lieuDetailsReadModel.structureId,
    },
  })

  const departementsGouvernances = gouvernancesDepartements.map((membre) => membre.gouvernanceDepartementCode)

  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieuDetailsReadModel.codeDepartement,
    lieuDetailsReadModel.structureId,
    lieuDetailsReadModel.personnesTravaillant.length,
    departementsGouvernances
  )

  if (!peutModifier) {
    return "Vous n'avez pas les droits pour modifier ce lieu"
  }

  return 'OK'
}

type Modification = Parameters<ModifierLieuInclusionInformationsGenerales['handle']>[0]['modification']

type ActionParams = Readonly<{
  adresse?: string
  complementAdresse?: string
  itinerant?: boolean
  nom?: string
  path: string
  siret?: string
  structureId: string
  typologies?: ReadonlyArray<string>
}>

const validator = z.object({
  adresse: z.string().optional(),
  complementAdresse: z.string().optional(),
  itinerant: z.boolean().optional(),
  nom: z.string().optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  siret: z
    .string()
    .regex(/^\d{6,7}$|^\d{14}$/, { message: 'Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)' })
    .optional(),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  typologies: z.array(z.string()).optional(),
})

type ParamsValides = z.infer<typeof validator>
