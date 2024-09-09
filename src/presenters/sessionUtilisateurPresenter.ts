import { TypologieRole } from '@/domain/Role'
import { UtilisateurState } from '@/domain/Utilisateur'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UtilisateurState
): SessionUtilisateurViewModel {
  return {
    ...utilisateurReadModel,
    role: libelleByRole[utilisateurReadModel.role.nom],
  }
}

// export function updateSessionUtilisateurPresenter(
//   session: SessionUtilisateurViewModel,
//   nom: TypologieRole
// ): SessionUtilisateurViewModel {
//   return {
//     ...session,
//     role: libelleByRole[nom],
//   }
// }

export type SessionUtilisateurViewModel = Readonly<{
  uid: string
  email: string
  nom: string
  prenom: string
  role: SessionRoleViewModel
}>

type SessionRoleViewModel = Readonly<{
  libelle: string
  nom: TypologieRole
  pictogramme: string
}>

const libelleByRole: LibelleByTypologie = {
  'Administrateur dispositif': {
    libelle: 'Administrateur Dispositif lambda',
    nom: 'Administrateur dispositif',
    pictogramme: 'anct',
  },
  'Gestionnaire département': {
    libelle: 'Rhône',
    nom: 'Gestionnaire département',
    pictogramme: 'maille',
  },
  'Gestionnaire groupement': {
    libelle: 'Hubikoop',
    nom: 'Gestionnaire groupement',
    pictogramme: 'groupement',
  },
  'Gestionnaire région': {
    libelle: 'Auvergne-Rhône-Alpes',
    nom: 'Gestionnaire région',
    pictogramme: 'maille',
  },
  'Gestionnaire structure': {
    libelle: 'Solidarnum',
    nom: 'Gestionnaire structure',
    pictogramme: 'structure',
  },
  Instructeur: {
    libelle: 'Banque des territoires',
    nom: 'Instructeur',
    pictogramme: 'bdt',
  },
  'Pilote politique publique': {
    libelle: 'France Numérique Ensemble',
    nom: 'Pilote politique publique',
    pictogramme: 'anct',
  },
  'Support animation': {
    libelle: 'Mednum',
    nom: 'Support animation',
    pictogramme: 'mednum',
  },
}

type LibelleByTypologie = Readonly<Record<TypologieRole, SessionRoleViewModel>>
