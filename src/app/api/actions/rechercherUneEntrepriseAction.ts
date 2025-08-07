'use server'

import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { createApiEntrepriseLoader } from '@/gateways/factories/apiEntrepriseLoaderFactory'
import { entreprisePresenter } from '@/presenters/entreprisePresenter'
import { EntrepriseNonTrouvee, EntrepriseReadModel, RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'

export async function rechercherUneEntrepriseAction(
  actionParam: ActionParams
): Promise<EntrepriseViewModel | ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  try {
    const siretOuRidet = validationResult.data.siret
    const entreprise = await exectuterRechercheEntreprise(siretOuRidet)

    if('estTrouvee' in entreprise) {
      return ['Aucune entreprise trouvée avec cet identifiant']
    }

    let entrepriseEnrichie = await enrichirEntrepriseAvecCategorieJuridique(entreprise)
    entrepriseEnrichie = await enrichirEntrepriseAvecActivitePrincipale(entrepriseEnrichie)
    return entreprisePresenter(entrepriseEnrichie)
  } catch (error: unknown) {
    return gererErreurRecherche(error)
  }
}

async function exectuterRechercheEntreprise(siretOuRidet: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
  const rechercheEntrepriseLoader = createApiEntrepriseLoader(siretOuRidet)
  const rechercherUneEntreprise = new RechercherUneEntreprise(rechercheEntrepriseLoader)
  return rechercherUneEntreprise.handle({ siret: siretOuRidet })
}

async function enrichirEntrepriseAvecCategorieJuridique(entreprise: EntrepriseReadModel): Promise<EntrepriseReadModel> {
  if (entreprise.categorieJuridiqueLibelle !== undefined && entreprise.categorieJuridiqueLibelle !== '') {
    return entreprise
  }

  try {
    const categorieJuridique = await prisma.categories_juridiques.findUnique({
      where: { code: entreprise.categorieJuridiqueCode },
    })
    
    if (categorieJuridique) {
      return {
        ...entreprise,
        categorieJuridiqueLibelle: categorieJuridique.nom,
      }
    }
  } catch {
    // En cas d'erreur, on continue sans le libellé
  }

  return entreprise
}

async function enrichirEntrepriseAvecActivitePrincipale(entreprise: EntrepriseReadModel): Promise<EntrepriseReadModel> {
  if (entreprise.activitePrincipaleLibelle !== undefined && entreprise.activitePrincipaleLibelle !== '') {
    return entreprise
  }

  try {
    const naf = await prisma.naf.findUnique({
      where: { code: entreprise.activitePrincipale },
    })
    
    if (naf) {
      return {
        ...entreprise,
        activitePrincipaleLibelle: naf.intitule_court,
      }
    }
  } catch {
    // En cas d'erreur, on continue sans le libellé
  }

  return entreprise
}

function gererErreurRecherche(error: unknown): ReadonlyArray<string> {
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
  
  if (errorMessage.includes('Aucun établissement trouvé') || 
      errorMessage.includes('n\'est plus en activité')) {
    return [errorMessage]
  }
  
  if (errorMessage.includes('Trop de requêtes')) {
    return [errorMessage]
  }
  
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('Échec de connexion')) {
    return ['Service temporairement indisponible. Veuillez réessayer.']
  }
  
  return ['Erreur lors de la recherche. Veuillez réessayer.']
}

type ActionParams = Readonly<{
  siret: string
}>

const validator = z.object({
  siret: z.string()
    .min(6, { message: 'L\'identifiant doit contenir au moins 6 caractères' })
    .max(14, { message: 'L\'identifiant doit contenir au maximum 14 caractères' })
    .regex(/^\d+$/, { message: 'L\'identifiant ne doit contenir que des chiffres' })
    .refine((siret) => {
      const isRidet = siret.length <= 7
      return isRidet ? /^\d{6,7}$/.test(siret) : /^\d{14}$/.test(siret)
    }, { message: 'Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)' }),
})