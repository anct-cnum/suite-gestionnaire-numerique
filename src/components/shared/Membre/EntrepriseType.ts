export type ContactExistant = Readonly<{
  email: string
  fonction: string
  id: number
  nom: string
  prenom: string
}>

export type EntrepriseViewModel = Readonly<{
  activitePrincipale: string
  activitePrincipaleLibelle: string
  adresse: string
  categorieJuridiqueCode: string
  categorieJuridiqueLibelle: string
  codeInsee: string
  codePostal: string
  commune: string
  contactsExistants?: ReadonlyArray<ContactExistant>
  denomination: string
  identifiant: string
  nomVoie: string
  numeroVoie: string
}>
