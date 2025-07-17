import { Roles } from './Role'
import { utilisateurFactory } from './testHelper'
import { epochTime } from '@/shared/testHelper'

describe('utilisateur', () => {
  describe("gestion d'un utilisateur", () => {
    describe(
      'l’utilisateur appartient au groupe "admin" : il peut gérer n’importe quel autre utilisateur',
      () => {
        describe.each([
          'Administrateur dispositif',
          'Gestionnaire département',
          'Gestionnaire groupement',
          'Gestionnaire région',
          'Gestionnaire structure',
        ] as const)('%s peut gérer', (roleGerant) => {
          it.each(Roles)('%s', (roleAGerer) => {
            // GIVEN
            const utilisateurGerant = utilisateurFactory({ ...utilisateurProps, role: roleGerant })
            const utilisateurAGerer = utilisateurFactory({ ...utilisateurProps, role: roleAGerer })

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
          codeOrganisation: 'Rhône',
          codeOrganisationAutre: 'Aude',
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’un autre département que le sien',
          peutGererDesc: 'peut gérer un gestionnaire du même départment que le sien',
          role: 'Gestionnaire département' as const,
        },
        {
          codeOrganisation: '21',
          codeOrganisationAutre: '14',
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’un autre groupement que le sien',
          peutGererDesc: 'peut gérer un gestionnaire du même groupement que le sien',
          role: 'Gestionnaire groupement' as const,
        },
        {
          codeOrganisation: 'Auvergne-Rhône-Alpes',
          codeOrganisationAutre: 'Normandie',
          nePeutGererDesc: 'ne peut gérer de gestionnaire d’une autre région que la sienne',
          peutGererDesc: 'peut gérer un gestionnaire de la même région que la sienne',
          role: 'Gestionnaire région' as const,
        },
        {
          codeOrganisation: '781',
          codeOrganisationAutre: '782',
          nePeutGererDesc: 'ne peut gérer de gestionnaire de la même structure que la sienne',
          peutGererDesc: 'peut gérer un gestionnaire de la même structure que la sienne',
          role: 'Gestionnaire structure' as const,
        },
      ])('$role', ({ codeOrganisation, codeOrganisationAutre, nePeutGererDesc, peutGererDesc, role }) => {
        it.each(Roles.filter((roleAGerer) => role !== roleAGerer))('ne peut gérer %s', (roleAGerer) => {
          // GIVEN
          const utilisateurGerant = utilisateurFactory({ ...utilisateurProps, role })
          const utilisateurAGerer = utilisateurFactory({ ...utilisateurProps, role: roleAGerer })

          // WHEN
          const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

          // THEN
          expect(peutGerer).toBe(false)
        })

        it(nePeutGererDesc, () => {
          // GIVEN
          const utilisateurGerant = utilisateurFactory({ ...utilisateurProps, codeOrganisation, role })
          const utilisateurAGerer = utilisateurFactory({
            ...utilisateurProps,
            codeOrganisation: codeOrganisationAutre,
            role,
          })

          // WHEN
          const peutGerer = utilisateurGerant.peutGerer(utilisateurAGerer)

          // THEN
          expect(peutGerer).toBe(false)
        })

        it(peutGererDesc, () => {
          // GIVEN
          const utilisateurGerant = utilisateurFactory({ ...utilisateurProps, codeOrganisation, role })
          const utilisateurAGerer = utilisateurFactory({ ...utilisateurProps, codeOrganisation, role })

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
  emailDeContact: 'martin.tartempion@example.net',
  inviteLe: epochTime,
  isSuperAdmin: false,
  nom: 'tartempion',
  prenom: 'martin',
  role: 'Gestionnaire structure',
  uid: { email: 'martin.tartempion@example.net', value: 'fooId' },
}
