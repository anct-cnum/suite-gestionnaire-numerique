'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { createApiEntrepriseLoader } from '@/gateways/factories/apiEntrepriseLoaderFactory'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import {
  Failure,
  MettreAJourStructureDepuisEntreprise,
} from '@/use-cases/commands/MettreAJourStructureDepuisEntreprise'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
  structureIntrouvable: 'Structure introuvable',
}

export async function mettreAJourStructureLabelAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }
    const { path, siret, structureId } = validationResult.data

    // Gardes : parcours réservé au gestionnaire bêta-testeur de sa propre structure éligible.
    const utilisateurId = await getSessionUtilisateurId()
    const utilisateur = await new PrismaUtilisateurLoader().findById(utilisateurId)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('gestionnaire_structure') || !contexte.isBetaTesteur) {
      return ['Action réservée aux gestionnaires autorisés']
    }
    if (contexte.idStructure() !== structureId) {
      return ['Vous ne pouvez modifier que votre structure']
    }
    const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(structureId)
    if (!estEligible) {
      return ['Votre structure n’est pas éligible au label conseiller numérique']
    }

    // Les données officielles font foi (RG3/RG4) : on re-consulte l'API Entreprise côté
    // serveur plutôt que de faire confiance aux données transmises par le client.
    let entreprise: Awaited<ReturnType<RechercherUneEntreprise['handle']>>
    try {
      entreprise = await new RechercherUneEntreprise(createApiEntrepriseLoader(siret)).handle({ siret })
    } catch {
      return ['Service temporairement indisponible. Veuillez réessayer.']
    }
    if ('estTrouvee' in entreprise) {
      return ['Le SIRET renseigné n’a pas pu être retrouvé. Vérifiez le numéro saisi.']
    }

    const result = await new MettreAJourStructureDepuisEntreprise(
      new ApiBanGeocodingGateway(),
      new PrismaStructureRepository()
    ).handle({
      adresse: entreprise.adresse,
      categorieJuridique: entreprise.categorieJuridiqueCode,
      // Certains loaders (RIDET, mock) formatent l'activité en « code - libellé » : on n'enregistre que le code NAF.
      codeActivitePrincipale: entreprise.activitePrincipale.split(' - ')[0],
      denominationSirene: entreprise.denomination,
      siret: entreprise.identifiant,
      structureId,
    })

    if (result !== 'OK') {
      return [MESSAGES_ECHEC[result]]
    }

    revalidatePath(path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  path: string
  siret: string
  structureId: number
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  siret: z
    .string()
    .regex(/^\d+$/, { message: "L'identifiant ne doit contenir que des chiffres" })
    .refine(
      (siret) => {
        const isRidet = siret.length <= 7
        return isRidet ? /^\d{6,7}$/.test(siret) : /^\d{14}$/.test(siret)
      },
      { message: 'Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)' }
    ),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
