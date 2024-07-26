import { Categorisation, RoleState, TypologieRole } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

export type SessionUtilisateurViewModel = Readonly<{
  prenom: string,
  nom: string,
  email: string,
  role: RoleViewModel
}>

export const sessionUtilisateurNonAuthentifie: SessionUtilisateurViewModel = {
  email: '',
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

export function sessionUtilisateurPresenter(utilisateur: Utilisateur): SessionUtilisateurViewModel {
  const utilisateurState = utilisateur.state()
  return {
    ...utilisateurState,
    role: {
      libelle: libelleByRole[utilisateurState.role.typologie](utilisateurState.role),
      pictogramme: pictogrammeByCategorie[utilisateur.categorie()],
    },
  }
}

type RoleViewModel = Readonly<{
  libelle: string,
  pictogramme: string,
}>


type LibelleByTypologie = Readonly<Record<TypologieRole, (role: RoleState) => string>>

type PictogrammeByCategorie = Readonly<Record<Categorisation, string>>

const libelleByRole: LibelleByTypologie = {
  'Administrateur dispositif': ({ territoireOuStructure }) => `Administrateur ${territoireOuStructure}`,
  'Gestionnaire département': ({ territoireOuStructure } ) => territoireOuStructure,
  'Gestionnaire groupement': ({ territoireOuStructure }) => territoireOuStructure,
  'Gestionnaire région': ({ territoireOuStructure }) => territoireOuStructure,
  'Gestionnaire structure': ({ territoireOuStructure }) => territoireOuStructure,
  Instructeur: () => 'Banque des territoires',
  'Pilote politique publique': () => 'France Numérique Ensemble',
  'Support animation': () => 'Mednum',
}

const pictogrammeByCategorie: PictogrammeByCategorie = {
  anct: 'anct',
  bdt: 'instructeur',
  groupement: 'gestionnaire-groupement',
  maille: 'marianne',
  mednum: 'support-animation',
  structure: 'gestionnaire-structure',
}
