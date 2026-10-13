import prisma from '../../../prisma/prismaClient'
import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

const SIRET_VALIDE = '13002603200016'

// Permet de tester le cas « Aucune entreprise trouvée » en développement
const SIRET_INCONNU = '00000000000000'

const ENTREPRISE_MOCK: EntrepriseReadModel = {
  activitePrincipale: '84.12Z - Administration publique (tutelle)',
  adresse: '20 AVENUE DE SEGUR, 75007 PARIS',
  categorieJuridiqueCode: '7389',
  categorieJuridiqueLibelle: 'Établissement public national à caractère administratif',
  codeInsee: '75107',
  codePostal: '75007',
  commune: 'PARIS',
  denomination: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
  identifiant: SIRET_VALIDE,
  nomVoie: 'AVENUE DE SEGUR',
  numeroVoie: '20',
}

export class MockSireneLoader implements SireneLoader {
  readonly #structureDataResource = prisma.main_structure_administrative

  async rechercherParIdentifiant(siret: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })

    if (siret === SIRET_INCONNU) {
      return { estTrouvee: false }
    }

    if (siret === SIRET_VALIDE) {
      return ENTREPRISE_MOCK
    }

    // Structure connue en base : on reprend son nom, ses contacts seront chargés par la recherche
    const structure = await this.#structureDataResource.findFirst({ where: { siret } })
    if (structure) {
      return {
        ...ENTREPRISE_MOCK,
        denomination: structure.denomination_antenne ?? structure.denomination_sirene ?? ENTREPRISE_MOCK.denomination,
        identifiant: siret,
      }
    }

    // Structure inconnue en base : entreprise fictive, sans contact
    return {
      ...ENTREPRISE_MOCK,
      denomination: `STRUCTURE FICTIVE ${siret}`,
      identifiant: siret,
    }
  }
}
