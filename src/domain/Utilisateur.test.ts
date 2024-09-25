import { TypologieRole } from './Role'
import { Utilisateur } from './Utilisateur'

describe('utilisateur', () => {
  describe('rôles associés à des organisations', () => {
    describe.each([
      {
        invariant: 'roleAdministrateurDispositifDoitAvoirDispositif',
        organisation: 'dispositif',
        role: {
          categorie: 'anct',
          groupe: 'admin',
          nom: 'Administrateur dispositif',
          territoireOuStructure: 'Dispositif Lambda',
        },
      },
      {
        invariant: 'roleGestionnaireDepartementDoitAvoirDepartement',
        organisation: 'département',
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire département',
          territoireOuStructure: 'Rhône',
        },
      },
      {
        invariant: 'roleGestionnaireRegionDoitAvoirRegion',
        organisation: 'région',
        role: {
          categorie: 'maille',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire région',
          territoireOuStructure: 'Auvergne-Rhône-Alpes',
        },
      },
      {
        invariant: 'roleGestionnaireGroupementDoitAvoirGroupement',
        organisation: 'groupement',
        role: {
          categorie: 'groupement',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire groupement',
          territoireOuStructure: 'Hubikoop',
        },
      },
      {
        invariant: 'roleGestionnaireStructureDoitAvoirStructure',
        organisation: 'structure',
        role: {
          categorie: 'structure',
          groupe: 'gestionnaire',
          nom: 'Gestionnaire structure',
          territoireOuStructure: 'La Poste',
        },
      },
    ])('étant donné que l’utilisateur à créer est un $role.nom', ({ organisation, role, invariant }) => {

      // GIVEN
      const nomDuRole = role.nom as TypologieRole

      it(`quand il est créé avec ${organisation} alors la création réussit`, () => {

        // WHEN
        const utilisateurValide = Utilisateur.create({
          ...utilisateurProps,
          organisation: role.territoireOuStructure,
          role: nomDuRole,
        })

        // THEN
        expect(utilisateurValide.state()).toStrictEqual({
          ...utilisateurProps,
          role,
        })
      })

      it(`quand il est créé sans ${organisation} alors la création échoue`, () => {
        // WHEN
        const utilisateurInvalide = () => Utilisateur.create({ ...utilisateurProps, role: nomDuRole })

        // THEN
        expect(utilisateurInvalide).toThrow(invariant)
      })
    })
  })

  describe('rôles non associés à des organisations', () => {
    describe.each([
      {
        invariant: 'roleInstructeurNePeutAvoirOrganisation',
        role: {
          categorie: 'bdt',
          groupe: 'admin',
          nom: 'Instructeur',
          territoireOuStructure: '',
        },
      },
      {
        invariant: 'rolePilotePolitiquePubliqueNePeutAvoirOrganisation',
        role: {
          categorie: 'anct',
          groupe: 'admin',
          nom: 'Pilote politique publique',
          territoireOuStructure: '',
        },
      },
      {
        invariant: 'roleSupportAnimationNePeutAvoirOrganisation',
        role: {
          categorie: 'mednum',
          groupe: 'admin',
          nom: 'Support animation',
          territoireOuStructure: '',
        },
      },
    ])('étant donné que l’utilisateur à créer est un $role.nom: aucune organisation ne peut être renseignée', ({ role, invariant }) => {

      // GIVEN
      const nomDuRole = role.nom as TypologieRole

      it('quand il est créé sans organisation alors la création réussit', () => {

        // WHEN
        const utilisateurValide = Utilisateur.create({ ...utilisateurProps, role: nomDuRole })

        // THEN
        expect(utilisateurValide.state()).toStrictEqual({
          ...utilisateurProps,
          role,
        })
      })

      it('quand il est créé avec organisation alors la création échoue', () => {
        // WHEN
        const utilisateurInvalide = () => Utilisateur.create({ ...utilisateurProps, organisation: 'organisationBidon', role: nomDuRole })

        // THEN
        expect(utilisateurInvalide).toThrow(invariant)
      })

    })
  })
})

const utilisateurProps = {
  email: 'martin.tartempion@example.net',
  isSuperAdmin: false,
  nom: 'tartempion',
  prenom: 'martin',
  uid: 'fooId',
}
