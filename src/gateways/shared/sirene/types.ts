// Types pour l'API Sirene INSEE officielle
// Documentation : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee

// Format de réponse de l'API INSEE pour un siret unique
export type InseeApiResponse = Readonly<{
  etablissement: SireneEtablissement
}>

export type SireneEtablissement = Readonly<{
  adresseEtablissement: Readonly<{
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

export type SireneUniteLegale = Readonly<{
  activitePrincipaleUniteLegale: string
  categorieJuridiqueUniteLegale: string
  denominationUniteLegale: null | string
  etatAdministratifUniteLegale: string
  nomUniteLegale: null | string
}>

export type SireneErrorResponse = Readonly<{
  header: Readonly<{
    message: string
  }>
}>