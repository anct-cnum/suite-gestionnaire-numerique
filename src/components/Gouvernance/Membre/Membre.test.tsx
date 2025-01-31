// eslint-disable-next-line testing-library/no-manual-cleanup
import { fireEvent, within, screen, render, cleanup } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { matchWithoutMarkup } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  describe('quand je clique sur le membre de la préfecture,', () => {
    it('=> puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')
      const drawer = screen.queryByRole('dialog', { name: 'Préfecture du Rhône' })
      jeFermeLesDetailsDuMembre('Fermer les détails du membre : Préfecture du Rhône')

      // THEN
      expect(drawer).not.toBeVisible()
    })

    it('=> alors un drawer s’ouvre avec les détails du membre rempli totalement', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      expect(drawer).toHaveAttribute('aria-labelledby', 'labelMembreId')
      const absenceDeDonnee = within(drawer).queryByText('-')
      expect(absenceDeDonnee).not.toBeInTheDocument()
      const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Préfecture du Rhône' })
      expect(titreDrawer).toBeInTheDocument()
      const rolesList = within(drawer).getAllByRole('list')[0]
      const rolesItems = within(rolesList).getAllByRole('listitem')
      expect(rolesItems).toHaveLength(2)
      const roleOne = within(rolesItems[0]).getByText('Co-porteur', { selector: 'p' })
      expect(roleOne).toBeInTheDocument()
      const typologieMembre = within(drawer).getByText('Préfecture départementale')
      expect(typologieMembre).toBeInTheDocument()
      const feuillesDeRouteList = within(drawer).getAllByRole('list')[1]
      const feuillesDeRouteItems = within(feuillesDeRouteList).getAllByRole('listitem')
      expect(feuillesDeRouteItems).toHaveLength(2)
      const feuilleDeRouteIntitule = within(drawer).getByText('Feuilles de route')
      expect(feuilleDeRouteIntitule).toBeInTheDocument()
      const FeuilleDeRouteInclusion = within(feuillesDeRouteItems[0]).getByRole('link', { name: 'Feuille de route inclusion' })
      expect(FeuilleDeRouteInclusion).toHaveAttribute('href', '/')
      const FeuilleDeRouteNumerique = within(feuillesDeRouteItems[1]).getByRole('link', { name: 'Feuille de route numérique du Rhône' })
      expect(FeuilleDeRouteNumerique).toHaveAttribute('href', '/')
      const boutonFermeture = within(drawer).getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' })
      expect(boutonFermeture).toBeInTheDocument()
      const contactPolitiqueIntitule = within(drawer).getByText('Contact politique de la collectivité')
      expect(contactPolitiqueIntitule).toBeInTheDocument()
      const contactPolitiqueMembre = within(drawer).getByText('Laetitia Henrich, chargé de mission julien.deschamps@rhones.gouv.fr')
      expect(contactPolitiqueMembre).toBeInTheDocument()
      const contactTechniqueIntitule = within(drawer).getByText('Contact technique')
      expect(contactTechniqueIntitule).toBeInTheDocument()
      const contactTechniqueMembre = within(drawer).getByText('Simon.lagrange@rhones.gouv.fr')
      expect(contactTechniqueMembre).toBeInTheDocument()
      const telephoneIntitule = within(drawer).getByText('Téléphone')
      expect(telephoneIntitule).toBeInTheDocument()
      const telephoneMembre = within(drawer).getByText('+33 4 45 00 45 00')
      expect(telephoneMembre).toBeInTheDocument()
    })

    it('=> alors un drawer s’ouvre avec les informations non-obligatoires remplacées par un tiret', () => {
      // GIVEN
      afficherGouvernance({
        membres: [
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [],
            links: {},
            nom: 'Préfecture du Rhône',
            roles: ['Co-porteur'],
            telephone: '',
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
            type: 'Administration',
            typologieMembre: 'Préfecture départementale',
          },
        ],
      })

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const absenceDeDonnee = within(drawer).getAllByText('-')
      expect(absenceDeDonnee).toHaveLength(1)
    })

    it('=> alors un drawer s’ouvre sans afficher les informations non-obligatoires', () => {
      // GIVEN
      afficherGouvernance({
        membres: [
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [],
            links: {},
            nom: 'Préfecture du Rhône',
            roles: ['Co-porteur'],
            telephone: '',
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
            type: 'Administration',
            typologieMembre: 'Préfecture départementale',
          },
        ],
      })

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const sectionFeuilleDeRoute = within(drawer).queryByText('Feuille de route')
      expect(sectionFeuilleDeRoute).not.toBeInTheDocument()
    })

    it.each([
      {
        feuilleDeRouteTotal: 1,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }],
        result: 'Feuille de route',
        version: 'singulier',
      },
      {
        feuilleDeRouteTotal: 2,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône' }],
        result: 'Feuilles de route',
        version: 'pluriel',
      },
      {
        feuilleDeRouteTotal: 3,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône 2' }],
        result: 'Feuilles de route',
        version: 'pluriel',
      },
    ])(
      '=> alors un drawer s’ouvre avec $feuilleDeRouteTotal $result conjuguées au $version',
      ({ feuillesDeRoute, result }) => {
        // GIVEN
        afficherGouvernance({
          membres: [
            {
              contactReferent: {
                denomination: 'Contact politique de la collectivité',
                mailContact: 'julien.deschamps@rhones.gouv.fr',
                nom: 'Henrich',
                poste: 'chargé de mission',
                prenom: 'Laetitia',
              },
              contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
              feuillesDeRoute,
              links: {},
              nom: 'Préfecture du Rhône',
              roles: ['Co-porteur'],
              telephone: '',
              type: 'Administration',
              typologieMembre: 'Préfecture départementale',
            },
          ],
        })

        // WHEN
        jOuvreLesDetailsDuMembre('Préfecture du Rhône')

        // THEN
        const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
        const feuilleDeRouteSingulierOuPluriel = within(drawer).getByText(result)
        expect(feuilleDeRouteSingulierOuPluriel).toBeInTheDocument()
      }
    )

    it.each([
      'Feuilles de route',
      'Contact politique de la collectivité',
      'Contact technique',
      'Téléphone',
    ])('=> alors le drawer contient l’intitulé: %s', (intituleAttendu) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const intitule = within(drawer).queryByText(intituleAttendu)
      expect(intitule).toBeInTheDocument()
    })

    it.each([
      'Total subventions accordées',
      'Total subventions formations accordées',
      'Contact référent',
    ])('=> alors le drawer ne contient pas l’intitulé: %s', (intituleAttendu) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const intitule = within(drawer).queryByText(intituleAttendu)
      expect(intitule).not.toBeInTheDocument()
    })

    it('=> alors un drawer s’ouvre sans le bouton plus de détails', () => {
      ['', undefined].forEach((plusDetails) => {
        cleanup()
        afficherGouvernance({
          membres: [
            {
              contactReferent: {
                denomination: 'Contact politique de la collectivité',
                mailContact: 'julien.deschamps@rhones.gouv.fr',
                nom: 'Henrich',
                poste: 'chargé de mission',
                prenom: 'Laetitia',
              },
              feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
              links: { plusDetails },
              nom: 'Préfecture du Rhône',
              roles: ['Co-porteur'],
              telephone: '+33 4 45 00 45 00',
              type: 'Administration',
              typologieMembre: 'Préfecture départementale',
            },
          ],
        })

        // WHEN
        jOuvreLesDetailsDuMembre('Préfecture du Rhône')

        // THEN
        const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
        const plusDeDetails = within(drawer).queryByText(matchWithoutMarkup('Plus de détails'))
        expect(plusDeDetails).not.toBeInTheDocument()
      })
    })
  })

  describe('quand je clique sur le membre autre que la préfecture,', () => {
    it('=> puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')
      const drawer = screen.queryByRole('dialog', { name: 'Département du Rhône' })
      jeFermeLesDetailsDuMembre('Fermer les détails du membre : Département du Rhône')

      // THEN
      expect(drawer).not.toBeVisible()
    })

    it('=> alors un drawer s’ouvre avec les détails du membre rempli totalement', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      expect(drawer).toHaveAttribute('aria-labelledby', 'labelMembreId')
      const absenceDeDonnee = within(drawer).queryByText('-')
      expect(absenceDeDonnee).not.toBeInTheDocument()
      const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Département du Rhône' })
      expect(titreDrawer).toBeInTheDocument()
      const rolesList = within(drawer).getAllByRole('list')[0]
      const rolesItems = within(rolesList).getAllByRole('listitem')
      expect(rolesItems).toHaveLength(3)
      const roleCoPorteur = within(rolesItems[0]).getByText('Co-porteur', { selector: 'p' })
      expect(roleCoPorteur).toBeInTheDocument()
      const roleFinanceur = within(rolesItems[1]).getByText('Financeur', { selector: 'p' })
      expect(roleFinanceur).toBeInTheDocument()
      const typologieMembre = screen.getByText('Collectivité, EPCI')
      expect(typologieMembre).toBeInTheDocument()
      const feuillesDeRouteList = within(drawer).getAllByRole('list')[1]
      const feuillesDeRouteItems = within(feuillesDeRouteList).getAllByRole('listitem')
      expect(feuillesDeRouteItems).toHaveLength(1)
      const feuilleDeRouteSingulier = within(drawer).getByText('Feuille de route')
      expect(feuilleDeRouteSingulier).toBeInTheDocument()
      const FeuilleDeRouteOne = within(feuillesDeRouteItems[0]).getByRole('link', {
        name: 'Feuille de route inclusion',
      })
      expect(FeuilleDeRouteOne).toHaveAttribute('href', '/')
      const boutonFermeture = within(drawer).getByRole('button', {
        name: 'Fermer les détails du membre : Département du Rhône',
      })
      expect(boutonFermeture).toBeInTheDocument()
      const contactReferentMembre = within(drawer).getByText(
        'Durant Didier, chargé de mission didier.durand@exemple.com'
      )
      expect(contactReferentMembre).toBeInTheDocument()
      const telephoneMembre = within(drawer).getByText('+33 4 45 00 45 01')
      expect(telephoneMembre).toBeInTheDocument()
    })

    it('=> alors un drawer s’ouvre avec les informations non-obligatoires remplacées par un tiret', () => {
      // GIVEN
      afficherGouvernance({
        membres: [
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'didier.durand@exemple.com',
              nom: 'Didier',
              poste: 'chargé de mission',
              prenom: 'Durant',
            },
            feuillesDeRoute: [],
            links: { plusDetails: '/' },
            nom: 'Département du Rhône',
            roles: ['Co-porteur', 'Financeur'],
            telephone: '',
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
            type: 'Collectivité',
            typologieMembre: 'Collectivité, EPCI',
          },
        ],
      })

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const absenceDeDonnee = within(drawer).getAllByText('-')
      expect(absenceDeDonnee).toHaveLength(1)
    })

    it('=> alors un drawer s’ouvre sans afficher les informations non-obligatoires', () => {
      // GIVEN
      afficherGouvernance({
        membres: [
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'didier.durand@exemple.com',
              nom: 'Didier',
              poste: 'chargé de mission',
              prenom: 'Durant',
            },
            feuillesDeRoute: [],
            links: { plusDetails: '/' },
            nom: 'Département du Rhône',
            roles: ['Co-porteur', 'Financeur'],
            telephone: '',
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
            type: 'Collectivité',
            typologieMembre: 'Collectivité, EPCI',
          },
        ],
      })

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const sectionFeuilleDeRoute = within(drawer).queryByText('Feuille de route')
      expect(sectionFeuilleDeRoute).not.toBeInTheDocument()
    })

    it.each([
      {
        feuilleDeRouteTotal: 1,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }],
        result: 'Feuille de route',
        version: 'singulier',
      },
      {
        feuilleDeRouteTotal: 2,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône' }],
        result: 'Feuilles de route',
        version: 'pluriel',
      },
      {
        feuilleDeRouteTotal: 3,
        feuillesDeRoute: [{ montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône' }, { montantSubventionAccorde: 0, montantSubventionFormationAccorde: 0, nom: 'Feuille de route numérique du Rhône 2' }],
        result: 'Feuilles de route',
        version: 'pluriel',
      },
    ])(
      '=> alors un drawer s’ouvre avec $feuilleDeRouteTotal $result conjuguées au $version',
      ({ feuillesDeRoute, result }) => {
        // GIVEN
        afficherGouvernance({
          membres: [
            {
              contactReferent: {
                denomination: 'Contact référent',
                mailContact: 'didier.durand@exemple.com',
                nom: 'Didier',
                poste: 'chargé de mission',
                prenom: 'Durant',
              },
              feuillesDeRoute,
              links: { plusDetails: '/' },
              nom: 'Département du Rhône',
              roles: ['Co-porteur', 'Financeur'],
              telephone: '+33 4 45 00 45 01',
              totalMontantSubventionAccorde: 0,
              totalMontantSubventionFormationAccorde: 0,
              type: 'Collectivité',
              typologieMembre: 'Collectivité, EPCI',
            },
          ],
        })

        // WHEN
        jOuvreLesDetailsDuMembre('Département du Rhône')

        // THEN
        const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
        const feuilleDeRouteSingulierOuPluriel = within(drawer).getByText(result)
        expect(feuilleDeRouteSingulierOuPluriel).toBeInTheDocument()
      }
    )

    it.each([
      'Feuille de route',
      'Total subventions accordées',
      'Total subventions formations accordées',
      'Contact référent',
      'Téléphone',
    ])('=> alors le drawer contient l’intitulé: %s', (intituleAttendu) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const intitule = within(drawer).queryByText(intituleAttendu)
      expect(intitule).toBeInTheDocument()
    })

    it.each([
      'Contact politique de la collectivité',
      'Contact technique',
    ])('=> alors le drawer ne contient pas l’intitulé: %s', (intituleAttendu) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const intitule = within(drawer).queryByText(intituleAttendu)
      expect(intitule).not.toBeInTheDocument()
    })

    it('=> alors le drawer contient le bouton "Plus de détails"', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const plusDeDetails = within(drawer).getByRole('link', { name: matchWithoutMarkup('Plus de détails') })
      expect(plusDeDetails).toHaveAttribute('href', '/')
      expect(plusDeDetails).toBeInTheDocument()
    })

    it('=> alors un drawer s’ouvre sans le contact technique', () => {
      ['', undefined].forEach((contactTechnique) => {
        // GIVEN
        cleanup()
        afficherGouvernance({
          membres: [
            {
              contactReferent: {
                denomination: 'Contact référent',
                mailContact: 'didier.durand@exemple.com',
                nom: 'Didier',
                poste: 'chargé de mission',
                prenom: 'Durant',
              },
              contactTechnique,
              feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }],
              links: { plusDetails: '/' },
              nom: 'Département du Rhône',
              roles: ['Co-porteur', 'Financeur'],
              telephone: '+33 4 45 00 45 01',
              totalMontantSubventionAccorde: 0,
              totalMontantSubventionFormationAccorde: 0,
              type: 'Collectivité',
              typologieMembre: 'Collectivité, EPCI',
            },
          ],
        })

        // WHEN
        jOuvreLesDetailsDuMembre('Département du Rhône')

        // THEN
        const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
        const contactTechniqueIntitule = within(drawer).queryByText('Contact technique')
        expect(contactTechniqueIntitule).not.toBeInTheDocument()
      })
    })
  })
})

function afficherGouvernance(gouvernance?: object): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(gouvernance), epochTime)
  render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
}

function jOuvreLesDetailsDuMembre(nomDuMembre: string): void {
  fireEvent.click(screen.getByRole('button', { name: nomDuMembre }))
}

function jeFermeLesDetailsDuMembre(nomDuMembre: string): void {
  fireEvent.click(screen.getByRole('button', { name: nomDuMembre }))
}
