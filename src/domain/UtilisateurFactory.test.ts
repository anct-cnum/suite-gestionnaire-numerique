import { Administrateur } from './Administrateur'
import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireGroupement } from './GestionnaireGroupement'
import { GestionnaireRegion } from './GestionnaireRegion'
import { GestionnaireStructure } from './GestionnaireStructure'
import { UtilisateurFactory } from './UtilisateurFactory'

describe('utilisateur factory', () => {
  it.each([
    {
      desc: 'un gestionnaire département est lié à un département',
      expectedType: GestionnaireDepartement,
      params: {
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
      },
      role: 'Gestionnaire département' as const,
    },
    {
      desc: 'un gestionnaire groupement est lié à un groupement',
      expectedType: GestionnaireGroupement,
      params: {
        groupement: {
          nom: 'Hubikoop',
          uid: { value: 10 },
        },
      },
      role: 'Gestionnaire groupement' as const,
    },
    {
      desc: 'un gestionnaire région est lié à une région',
      expectedType: GestionnaireRegion,
      params: {
        region: {
          code: '11',
          nom: 'Île-de-France',
        },
      },
      role: 'Gestionnaire région' as const,
    },
    {
      desc: 'un gestionnaire structure est lié à une structure',
      expectedType: GestionnaireStructure,
      params: {
        structure: {
          nom: 'Solidarnum',
          uid: { value: 10 },
        },
      },
      role: 'Gestionnaire structure' as const,
    },
    {
      desc: 'un administrateur dispositif est créé en tant qu’administrateur',
      expectedType: Administrateur,
      params: {},
      role: 'Administrateur dispositif' as const,
    },
    {
      desc: 'un instructeur est créé en tant qu’administrateur',
      expectedType: Administrateur,
      params: {},
      role: 'Instructeur' as const,
    },
    {
      desc: 'un pilote politique publique est créé en tant qu’administrateur',
      expectedType: Administrateur,
      params: {},
      role: 'Pilote politique publique' as const,
    },
    {
      desc: 'un support animation est créé en tant qu’administrateur',
      expectedType: Administrateur,
      params: {},
      role: 'Support animation' as const,
    },
  ])('$desc', ({ role, params, expectedType }) => {
    // GIVEN
    const utilisateurParams = {
      derniereConnexion: new Date(0),
      email: 'martin.tartempion@example.net',
      inviteLe: new Date(0),
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      telephone: '0102030405',
      uid: 'fooId',
      ...params,
    }

    // WHEN
    const utilisateur = new UtilisateurFactory(utilisateurParams).create(role)

    // THEN
    expect(utilisateur).toBeInstanceOf(expectedType)
  })

  it.each([
    {
      desc: 'un utilisateur ne s’étant jamais connecté est est créé comme inactif',
      expectedIsActive: false,
    },
    {
      derniereConnexion: new Date(1),
      desc: 'un utilisateur s’étant déjà connecté est créé comme actif',
      expectedIsActive: true,
    },
  ])('$desc', ({ derniereConnexion, expectedIsActive }) => {

    // GIVEN
    const utilisateurParams = {
      derniereConnexion,
      email: 'martin.tartempion@example.net',
      inviteLe: new Date(0),
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      telephone: '0102030405',
      uid: 'fooId',
    }
    // WHEN
    const utilisateur = new UtilisateurFactory(utilisateurParams).create('Instructeur')

    // THEN
    expect(utilisateur.state().isActive).toBe(expectedIsActive)
  })

  it.each([
    {
      desc: 'un utilisateur ayant un numéro de téléphone est créé avec ce numéro',
      expectedTelephone: '0102030405',
      telephone: '0102030405',
    },
    {
      desc: 'un utilisateur n’ayant pas de numéro de téléphone est créé avec un téléphone vide',
      expectedTelephone: '',
    },
  ])('$desc', ({ telephone, expectedTelephone }) => {

    // GIVEN
    const utilisateurParams = {
      derniereConnexion: new Date(0),
      email: 'martin.tartempion@example.net',
      inviteLe: new Date(0),
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      telephone,
      uid: 'fooId',
    }
    // WHEN
    const utilisateur = new UtilisateurFactory(utilisateurParams).create('Instructeur')

    // THEN
    expect(utilisateur.state().telephone).toBe(expectedTelephone)
  })
})