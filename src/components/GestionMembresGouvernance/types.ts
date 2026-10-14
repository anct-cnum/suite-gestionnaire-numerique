import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'

export type ContactPrincipal = Readonly<{
  email: string
  fonction: string
  nom: string
  prenom: string
}>

export type ChoixContact =
  Readonly<{ contactExistantId: number; type: 'existant' }> | Readonly<{ donnees: ContactPrincipal; type: 'nouveau' }>

// Contact de la structure en cours d'édition, enregistré seulement à la validation finale
export type ContactEdite = Readonly<{
  cle: string
  donnees: ContactPrincipal
  estModifie: boolean
  idExistant: null | number
}>

export type NouveauMembreData = Readonly<{
  contact: ChoixContact | null
  contacts?: ReadonlyArray<ContactEdite>
  contactSecondaire: ChoixContact | null
  contactsSupprimes?: ReadonlyArray<ContactEdite>
  departement?: null | Readonly<{
    code: string
    label: string
  }>
  entreprise: EntrepriseViewModel | null
}>

export type AjoutMembreEtape = 'confirmation' | 'selection'
