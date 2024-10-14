import { createSessionUtilisateurPresenter } from './sessionUtilisateurPresenter'
import { UnUtilisateurReadModel } from '@/use-cases/queries/RechercherUnUtilisateur'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l’utilisateur connecté', () => {
    const { nom, groupe, territoireOuStructure, categorie } = {
      categorie: 'mednum',
      groupe: 'admin',
      nom: 'Support animation',
      territoireOuStructure: 'Mednum',
    }

    expect(
      createSessionUtilisateurPresenter(
        makeUtilisateur(
          nom,
          territoireOuStructure,
          groupe,
          categorie
        )
      )
    ).toStrictEqual({
      ...utilisateur,
      role: {
        groupe: 'admin',
        libelle: 'Mednum',
        nom: 'Support animation',
        pictogramme: 'mednum',
      },
    })
  })
})

const utilisateur = {
  email: 'martin.tartempion@example.net',
  isSuperAdmin: false,
  nom: 'Tartempion',
  prenom: 'Martin',
  uid: 'fooId',
}

function makeUtilisateur(
  role: string,
  territoireOuStructure: string,
  groupe: string,
  categorie: string
): UnUtilisateurReadModel {
  return {
    departementCode: null,
    derniereConnexion: new Date(0),
    email: utilisateur.email,
    groupementId: null,
    inviteLe: new Date(0),
    isActive: true,
    isSuperAdmin: false,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    regionCode: null,
    role: {
      categorie,
      groupe,
      nom: role,
      territoireOuStructure,
    },
    structureId: null,
    uid: 'fooId',
  }
}
