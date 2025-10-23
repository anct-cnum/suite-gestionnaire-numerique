import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

const SIRET_VALIDE = '13002603200016'

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
  async rechercherParIdentifiant(siret: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    // Simulation d'un délai d'API
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    if (siret !== SIRET_VALIDE) {
      return { estTrouvee: false }
    }

    return ENTREPRISE_MOCK
  }
}
