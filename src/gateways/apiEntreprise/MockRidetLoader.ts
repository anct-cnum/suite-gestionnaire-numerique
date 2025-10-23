import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

const RIDET_VALIDE = '0271528'

const ENTREPRISE_MOCK: EntrepriseReadModel = {
  activitePrincipale: '9499Z - Autres organisations fonctionnant par adhésion volontaire',
  adresse: 'NOUMÉA, PROVINCE SUD',
  categorieJuridiqueCode: '92',
  categorieJuridiqueLibelle: 'Association loi de 1901 et assimilé',
  codeInsee: '',
  codePostal: '',
  commune: 'Nouméa',
  denomination: 'ASS. D\'ENTRAIDE SOCIALE CULTURELLE DE LA JEUNESSE',
  identifiant: '0271528',
  nomVoie: '',
  numeroVoie: '',
}

export class MockRidetLoader implements SireneLoader {
  async rechercherParIdentifiant(numeroRidet: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    // Simulation d'un délai d'API
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    const ridetPadded = numeroRidet.padStart(7, '0')

    if (ridetPadded === RIDET_VALIDE) {
      return {
        ...ENTREPRISE_MOCK,
        identifiant: numeroRidet, // Retourne le RIDET original saisi
      }
    }

    return { estTrouvee: false }
  }
}
