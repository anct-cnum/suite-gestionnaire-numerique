import { Role, TypologieRole } from '../../../core/domain/role'

export type SessionUtilisateurViewModel = Readonly<{
  prenom: string,
  nom: string,
  role: RoleViewModel
}>

export const sessionUtilisateurNonAuthentifie: SessionUtilisateurViewModel = {
  nom: '',
  prenom: '',
  role: {
    libelle: '',
    pictogramme: '',
  },
}

export function isUtilisateurAuthentifie(infos: SessionUtilisateurViewModel): boolean {
  return infos.nom !== ''
}

export function sessionUtilisateurPresenter(role: Role, nom: string, prenom: string): SessionUtilisateurViewModel {
  return {
    nom,
    prenom,
    role: libelleEtPictoByRole[role.typologie](role.perimetre),
  }
}

type RoleViewModel = Readonly<{
  libelle: string,
  pictogramme: string,
}>


type RoleViewModelByTypologie = Readonly<Record<TypologieRole, (perimetreDuRole: string) => RoleViewModel>>

const libelleEtPictoByRole: RoleViewModelByTypologie = {
  'Administrateur dispositif': ( perimetreDuRole ) => ({
    libelle: `Administrateur ${perimetreDuRole}`,
    pictogramme: 'anct',
  }),
  'Gestionnaire département': ( perimetreDuRole ) => ({ libelle: perimetreDuRole, pictogramme: 'marianne' }),
  'Gestionnaire groupement': ( perimetreDuRole ) => ({ libelle: perimetreDuRole, pictogramme: 'gestionnaire-groupement' }),
  'Gestionnaire région': ( perimetreDuRole ) => ({ libelle: perimetreDuRole, pictogramme: 'marianne' }),
  'Gestionnaire structure': ( perimetreDuRole ) => ({ libelle: perimetreDuRole, pictogramme: 'gestionnaire-structure' }),
  Instructeur: () => ({
    libelle: 'Banque des territoires',
    pictogramme: 'instructeur',
  }),
  'Pilote politique publique': () => ({
    libelle: 'France Numérique Ensemble',
    pictogramme: 'anct',
  }),
  'Support animation': () => ({ libelle: 'Mednum', pictogramme: 'support-animation' }),
}
