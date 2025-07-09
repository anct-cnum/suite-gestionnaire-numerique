export type EntrepriseSirene = Readonly<{
  activitePrincipaleUniteLegale: string
  adresseComplete: string
  categorieJuridiqueUniteLegale: string
  codePostal: string
  denominationUniteLegale: string
  libelleCommuneEtablissement: string
  siret: string
}>

export type ContactPrincipal = Readonly<{
  email: string
  fonction: string
  nom: string
  prenom: string
}>

export type NouveauMembreData = Readonly<{
  contact: ContactPrincipal | null
  contactSecondaire: ContactPrincipal | null
  entreprise: EntrepriseSirene | null
}>

export type AjoutMembreEtape = 'confirmation' | 'selection'