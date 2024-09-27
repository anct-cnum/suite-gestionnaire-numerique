import { Roles } from './Role'
import { Utilisateur } from './Utilisateur'

describe('utilisateur', () => {
  describe("suppression d'un utilisateur", () => {
    describe(
      'l’utilisateur appartient au groupe "admin" : il peut supprimer n’importe quel autre utilisateur',
      () => {
        describe.each([
          'Administrateur dispositif',
          'Instructeur',
          'Pilote politique publique',
          'Support animation',
        ] as const)('%s peut supprimer', (roleSupprimant) => {
          it.each(Roles)('%s', (roleASupprimer) => {
            // GIVEN
            const utilisateurSupprimant = Utilisateur.create({ ...utilisateurProps, role: roleSupprimant })
            const utilisateurASupprimer = Utilisateur.create({ ...utilisateurProps, role: roleASupprimer })

            // WHEN
            const peutSupprimer = utilisateurSupprimant.peutSupprimer(utilisateurASupprimer)

            // THEN
            expect(peutSupprimer).toBe(true)
          })
        })
      }
    )

    describe('l’utilisateur appartient au groupe "gestionnaire"', () => {
      describe.each([
        {
          nePeutSupprimerDesc: 'ne peut supprimer de gestionnaire d’un autre département que le sien',
          organisation: 'Rhône',
          organisationAutre: 'Aude',
          peutSupprimerDesc: 'peut supprimer un gestionnaire du même départment que le sien',
          role: 'Gestionnaire département' as const,
        },
        {
          nePeutSupprimerDesc: 'ne peut supprimer de gestionnaire d’un autre groupement que le sien',
          organisation: 'Hubikoop',
          organisationAutre: 'Hubi',
          peutSupprimerDesc: 'peut supprimer un gestionnaire du même groupement que le sien',
          role: 'Gestionnaire groupement' as const,
        },
        {
          nePeutSupprimerDesc: 'ne peut supprimer de gestionnaire d’une autre région que la sienne',
          organisation: 'Auvergne-Rhône-Alpes',
          organisationAutre: 'Normandie',
          peutSupprimerDesc: 'peut supprimer un gestionnaire de la même région que la sienne',
          role: 'Gestionnaire région' as const,
        },
        {
          nePeutSupprimerDesc: 'ne peut supprimer de gestionnaire de la même structure que la sienne',
          organisation: 'La Poste',
          organisationAutre: 'SNCF',
          peutSupprimerDesc: 'peut supprimer un gestionnaire de la même structure que la sienne',
          role: 'Gestionnaire structure' as const,
        },
      ])('$role', ({ role, nePeutSupprimerDesc, peutSupprimerDesc, organisation, organisationAutre }) => {
        it.each(Roles.filter((r) => role !== r))('ne peut supprimer %s', (roleASupprimer) => {
          // GIVEN
          const utilisateurSupprimant = Utilisateur.create({ ...utilisateurProps, role })
          const utilisateurASupprimer = Utilisateur.create({ ...utilisateurProps, role: roleASupprimer })

          // WHEN
          const peutSupprimer = utilisateurSupprimant.peutSupprimer(utilisateurASupprimer)

          // THEN
          expect(peutSupprimer).toBe(false)
        })

        it(nePeutSupprimerDesc, () => {
          // GIVEN
          const utilisateurSupprimant = Utilisateur.create({ ...utilisateurProps, organisation, role })
          const utilisateurASupprimer = Utilisateur.create({
            ...utilisateurProps,
            organisation: organisationAutre,
            role,
          })

          // WHEN
          const peutSupprimer = utilisateurSupprimant.peutSupprimer(utilisateurASupprimer)

          // THEN
          expect(peutSupprimer).toBe(false)
        })

        it(peutSupprimerDesc, () => {
          // GIVEN
          const utilisateurSupprimant = Utilisateur.create({ ...utilisateurProps, organisation, role })
          const utilisateurASupprimer = Utilisateur.create({ ...utilisateurProps, organisation, role })

          // WHEN
          const peutSupprimer = utilisateurSupprimant.peutSupprimer(utilisateurASupprimer)

          // THEN
          expect(peutSupprimer).toBe(true)
        })
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
