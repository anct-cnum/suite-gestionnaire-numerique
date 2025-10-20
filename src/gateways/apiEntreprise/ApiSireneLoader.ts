import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

// Types pour l'API Sirene INSEE officielle
// Documentation : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee

export class ApiSireneLoader implements SireneLoader {
  async rechercherParIdentifiant(siret: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    try {
      const urlApiSirene = `https://api.insee.fr/api-sirene/3.11/siret/${siret}`
      const reponse = await this.recupererAvecTentatives(urlApiSirene)
      const donnees = await this.gererReponse(reponse)

      return this.traiterReponseApi(donnees)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'

      // Si l'entreprise n'est pas trouvée, retourner EntrepriseNonTrouvee
      if (errorMessage.includes('Aucun établissement trouvé') ||
          errorMessage.includes('n\'est plus en activité')) {
        return { estTrouvee: false }
      }

      // Pour les autres erreurs, on les relance
      throw error
    }
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
      return this.transformerEtablissementSirene(etablissement)
    }

    // Fallback pour les erreurs
    const reponseErreur = donnees
    throw new Error(reponseErreur.header.message || 'Erreur lors de la recherche')
  }

  private transformerEtablissementSirene(etablissement: SireneEtablissement): EntrepriseReadModel {
    const uniteLegale = etablissement.uniteLegale

    // Construction de l'adresse complète (format INSEE)
    const adresseEtab = etablissement.adresseEtablissement
    const adresseElements = [
      adresseEtab.complementAdresseEtablissement,
      adresseEtab.numeroVoieEtablissement,
      adresseEtab.typeVoieEtablissement,
      adresseEtab.libelleVoieEtablissement,
    ].filter(Boolean)

    const adresseComplete = [
      adresseElements.join(' '),
      adresseEtab.codePostalEtablissement,
      adresseEtab.libelleCommuneEtablissement,
    ].filter(Boolean).join(', ')

    // Récupération de la dénomination (priorité : dénomination > nom > enseigne)
    const periodeActuelle = etablissement.periodesEtablissement[0]
    const denominationUniteLegale =
      uniteLegale.denominationUniteLegale ??
      uniteLegale.nomUniteLegale ??
      periodeActuelle.enseigne1Etablissement ??
      'Dénomination non renseignée'

    // Construction du nom de voie propre (type + libellé)
    const nomVoieElements = [
      adresseEtab.typeVoieEtablissement,
      adresseEtab.libelleVoieEtablissement,
    ].filter(Boolean)
    const nomVoie = nomVoieElements.join(' ')

    return {
      activitePrincipale: uniteLegale.activitePrincipaleUniteLegale,
      adresse: adresseComplete,
      categorieJuridiqueCode: uniteLegale.categorieJuridiqueUniteLegale,
      codeInsee: adresseEtab.codeCommuneEtablissement ?? '',
      codePostal: adresseEtab.codePostalEtablissement ?? '',
      commune: adresseEtab.libelleCommuneEtablissement ?? '',
      denomination: denominationUniteLegale,
      identifiant: etablissement.siret,
      nomVoie,
      numeroVoie: adresseEtab.numeroVoieEtablissement ?? '',
    }
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

// Format de réponse de l'API INSEE pour un siret unique
type InseeApiResponse = Readonly<{
  etablissement: SireneEtablissement
}>

type SireneErrorResponse = Readonly<{
  header: Readonly<{
    message: string
  }>
}>

type SireneEtablissement = Readonly<{
  adresseEtablissement: Readonly<{
    codeCommuneEtablissement: null | string
    codePostalEtablissement: null | string
    complementAdresseEtablissement: null | string
    libelleCommuneEtablissement: null | string
    libelleVoieEtablissement: null | string
    numeroVoieEtablissement: null | string
    typeVoieEtablissement: null | string
  }>
  etatAdministratifEtablissement?: string
  periodesEtablissement: ReadonlyArray<Readonly<{
    enseigne1Etablissement: null | string
    etatAdministratifEtablissement: string
  }>>
  siret: string
  uniteLegale: SireneUniteLegale
}>

type SireneUniteLegale = Readonly<{
  activitePrincipaleUniteLegale: string
  categorieJuridiqueUniteLegale: string
  denominationUniteLegale: null | string
  etatAdministratifUniteLegale: string
  nomUniteLegale: null | string
}>
