import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'

export type ContactPrincipal = Readonly<{
  email: string
  fonction: string
  nom: string
  prenom: string
}>

export type NouveauMembreData = Readonly<{
  contact: ContactPrincipal | null
  contactSecondaire: ContactPrincipal | null
  departement?: null | Readonly<{
    code: string
    label: string
  }>
  entreprise: EntrepriseViewModel | null
}>

export type AjoutMembreEtape = 'confirmation' | 'selection'
