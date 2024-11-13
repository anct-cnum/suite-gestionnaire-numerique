import { Roles } from './Role'
import { Utilisateur } from './Utilisateur'

describe('utilisateur', () => {
  describe("gestion d'un utilisateur", () => {
    describe(
      'l’utilisateur appartient au groupe "admin" : il peut gérer n’importe quel autre utilisateur',
      () => {
        describe.each([
          'Administrateur dispositif',
          'Instructeur',
          'Pilote politique publique',
          'Support animation',
        ] as const)('%s peut gérer', (roleGerant) => {
          it.each(Roles)('%s', (roleAGerer) => {
            // GIVEN
            const utilisateurGerant = Utilisateur.create({ ...utilisateurProps, role: roleGerant })
            const utilisateurAGerer = Utilisateur.create({ ...utilisateurProps, role: roleAGerer })

            // WHEN
            const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

            // THEN
            expect(peutGerer).toBe(true)
          })
        })
      }
    )

    describe('l’utilisateur appartient au groupe "gestionnaire"', () => {
      describe.each([
        {
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’un autre département que le sien',
          organisation: 'Rhône',
          organisationAutre: 'Aude',
          peutGererDesc: 'peut gérer un gestionnaire du même départment que le sien',
          role: 'Gestionnaire département' as const,
        },
        {
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’un autre groupement que le sien',
          organisation: 'Hubikoop',
          organisationAutre: 'Hubi',
          peutGererDesc: 'peut gérer un gestionnaire du même groupement que le sien',
          role: 'Gestionnaire groupement' as const,
        },
        {
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’une autre région que la sienne',
          organisation: 'Auvergne-Rhône-Alpes',
          organisationAutre: 'Normandie',
          peutGererDesc: 'peut gérer un gestionnaire de la même région que la sienne',
          role: 'Gestionnaire région' as const,
        },
        {
          nePeutGererDesc: 'ne peut gérer de gestionnaire de la même structure que la sienne',
          organisation: 'La Poste',
          organisationAutre: 'SNCF',
          peutGererDesc: 'peut gérer un gestionnaire de la même structure que la sienne',
          role: 'Gestionnaire structure' as const,
        },
      ])('$role', ({ role, nePeutGererDesc, peutGererDesc, organisation, organisationAutre }) => {
        it.each(Roles.filter((r) => role !== r))('ne peut gérer %s', (roleAGerer) => {
          // GIVEN
          const utilisateurGerant = Utilisateur.create({ ...utilisateurProps, role })
          const utilisateurAGerer = Utilisateur.create({ ...utilisateurProps, role: roleAGerer })

          // WHEN
          const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

          // THEN
          expect(peutGerer).toBe(false)
        })

        it(nePeutGererDesc, () => {
          // GIVEN
          const utilisateurGerant = Utilisateur.create({ ...utilisateurProps, organisation, role })
          const utilisateurAGerer = Utilisateur.create({
            ...utilisateurProps,
            organisation: organisationAutre,
            role,
          })

          // WHEN
          const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

          // THEN
          expect(peutGerer).toBe(false)
        })

        it(peutGererDesc, () => {
          // GIVEN
          const utilisateurGerant = Utilisateur.create({ ...utilisateurProps, organisation, role })
          const utilisateurAGerer = Utilisateur.create({ ...utilisateurProps, organisation, role })

          // WHEN
          const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

          // THEN
          expect(peutGerer).toBe(true)
        })
      })
    })
  })
})

const utilisateurProps = {
  derniereConnexion: null,
  email: 'martin.tartempion@example.net',
  inviteLe: new Date(0),
  isSuperAdmin: false,
  nom: 'tartempion',
  prenom: 'martin',
  role: 'Instructeur',
  uid: 'fooId',
}
