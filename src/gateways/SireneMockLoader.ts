import { EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

const SIRET_VALIDE = '13002603200016'

const ENTREPRISE_MOCK: EntrepriseReadModel = {
  activitePrincipaleUniteLegale: '84.12Z - Administration publique (tutelle)',
  adresseComplete: '20 AVENUE DE SEGUR, 75007 PARIS',
  categorieJuridiqueUniteLegale: '7389',
  categorieJuridiqueUniteLegaleLibelle: 'Établissement public national à caractère administratif',
  codePostal: '75007',
  denominationUniteLegale: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
  libelleCommuneEtablissement: 'PARIS',
  siret: SIRET_VALIDE,
}

export class  SireneMockLoader implements SireneLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async rechercherParSiret(siret: string): Promise<EntrepriseReadModel> {
    // Simulation d'un délai d'API
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    if (siret !== SIRET_VALIDE) {
      throw new Error('Aucun établissement trouvé avec ce SIRET')
    }
    
    return ENTREPRISE_MOCK
  }
}