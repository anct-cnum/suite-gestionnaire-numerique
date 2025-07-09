/* eslint-disable @typescript-eslint/class-methods-use-this */
import { InseeApiResponse, SireneErrorResponse, SireneEtablissement } from './shared/sirene/types'
import { transformerEtablissementSirene } from './shared/sireneTransformer'
import { EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

export class SireneApiLoader implements SireneLoader {
  async rechercherParSiret(siret: string): Promise<EntrepriseReadModel> {
    const urlApiSirene = `https://api.insee.fr/api-sirene/3.11/siret/${siret}`
    const reponse = await this.recupererAvecTentatives(urlApiSirene)
    const donnees = await this.gererReponse(reponse)
    
    return this.traiterReponseApi(donnees)
  }

  private configurationEntetes(): Record<string, string> {
    const entetes: Record<string, string> = {
      Accept: 'application/json',
    }
    
    if (process.env.INSEE_API_KEY === undefined || process.env.INSEE_API_KEY === '') {
      throw new Error('Erreur de configuration')
    }
    entetes['X-INSEE-Api-Key-Integration'] = process.env.INSEE_API_KEY

    return entetes
  }

  private async gererReponse(reponse: Response): Promise<InseeApiResponse | SireneErrorResponse> {
    if (!reponse.ok) {
      const texteErreur = await reponse.text()
      
      if (reponse.status === 404) {
        throw new Error('Aucun établissement trouvé avec ce SIRET')
      }
      
      if (reponse.status === 429) {
        throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.')
      }

      throw new Error(`Erreur API Sirene: ${reponse.status} - ${texteErreur}`)
    }

    return await reponse.json() as InseeApiResponse | SireneErrorResponse
  }

  private async recupererAvecTentatives(url: string): Promise<Response> {
    let reponse: Response | undefined
    let derniereErreur: Error | null = null
    
    // Retry jusqu'à 3 fois en cas d'erreur réseau
    for (let tentative = 1; tentative <= 3; tentative += 1) {
      try {
        const entetes = this.configurationEntetes()
        
        // eslint-disable-next-line no-await-in-loop
        reponse = await fetch(url, {
          headers: entetes,
          // Timeout de 10 secondes
          signal: AbortSignal.timeout(10000),
        })
        
        break 
      } catch (erreur) {
        derniereErreur = erreur as Error

        // Si c'est la dernière tentative, on lance l'erreur
        if (tentative === 3) {
          throw new Error(`Échec de connexion à l'API Sirene après 3 tentatives: ${derniereErreur.message}`)
        }
        
        // Attente avant retry (500ms, puis 1s)
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
          setTimeout(resolve, tentative * 500)
        })
      }
    }
    
    if (!reponse) {
      throw new Error(`Échec de connexion à l'API Sirene après 3 tentatives: ${derniereErreur?.message}`)
    }
    
    return reponse
  }

  private traiterReponseApi(donnees: InseeApiResponse | SireneErrorResponse): EntrepriseReadModel {
    // Pour l'API INSEE, la réponse contient directement l'établissement
    if ('etablissement' in donnees) {
      const etablissement = donnees.etablissement
      
      this.validerEtablissement(etablissement)
      
      // Transformation des données pour l'interface
      return transformerEtablissementSirene(etablissement)
    }

    // Fallback pour les erreurs
    const reponseErreur = donnees
    throw new Error(reponseErreur.header.message || 'Erreur lors de la recherche')
  }

  private validerEtablissement(etablissement: SireneEtablissement): void {
    // Vérification que l'établissement est actif (état dans la période courante)
    const periodeActuelle = etablissement.periodesEtablissement[0]
    if (periodeActuelle.etatAdministratifEtablissement !== 'A') {
      throw new Error('Cet établissement n\'est plus en activité')
    }

    // Vérification que l'unité légale est active
    if (etablissement.uniteLegale.etatAdministratifUniteLegale !== 'A') {
      throw new Error('Cette entreprise n\'est plus en activité')
    }
  }
}