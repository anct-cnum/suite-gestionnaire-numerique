import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { matchWithoutMarkup } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
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
      const totaltirets = within(drawer).queryByText('-')
      expect(totaltirets).not.toBeInTheDocument()
      const titreDrawer = within(drawer).getByRole('heading', {
        level: 1,
        name: 'Préfecture du Rhône',
      })
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
      const feuilleDeRouteIntituler = within(drawer).getByText('Feuilles de route')
      expect(feuilleDeRouteIntituler).toBeInTheDocument()
      const FeuilleDeRouteInclusion = within(feuillesDeRouteItems[0]).getByRole('link', { name: 'Feuille de route inclusion' })
      expect(FeuilleDeRouteInclusion).toHaveAttribute('href', '/')
      const FeuilleDeRouteNumerique = within(feuillesDeRouteItems[1]).getByRole('link', { name: 'Feuille de route numérique du Rhône' })
      expect(FeuilleDeRouteNumerique).toHaveAttribute('href', '/')
      const boutonFermeture = within(drawer).getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' })
      expect(boutonFermeture).toBeInTheDocument()
      const contactPolitiqueIntituler = within(drawer).getByText('Contact politique de la collectivité')
      expect(contactPolitiqueIntituler).toBeInTheDocument()
      const contactPolitiqueMembre = within(drawer).getByText('Laetitia Henrich, chargé de mission julien.deschamps@rhones.gouv.fr')
      expect(contactPolitiqueMembre).toBeInTheDocument()
      const contactTechniqueIntituler = within(drawer).getByText('Contact technique')
      expect(contactTechniqueIntituler).toBeInTheDocument()
      const contactTechniqueMembre = within(drawer).getByText('Simon.lagrange@rhones.gouv.fr')
      expect(contactTechniqueMembre).toBeInTheDocument()
      const telephoneIntituler = within(drawer).getByText('Téléphone')
      expect(telephoneIntituler).toBeInTheDocument()
      const telephoneMembre = within(drawer).getByText('+33 4 45 00 45 00')
      expect(telephoneMembre).toBeInTheDocument()
    })

    it('=> alors je vois les informations non-obligatoires remplacer par un tiret ou que l’intituler n’est pas affiché', () => {
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
      const totaltirets = within(drawer).getAllByText('-')
      expect(totaltirets).toHaveLength(1)
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
      '=> alors un drawer s’ouvre avec $feuilleDeRouteTotal $result alors il s’affiche aux $version ',
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
    ])('=> alors le drawer contient l’intituler: %s', (intituler) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const div = within(drawer).queryByText(intituler)
      expect(div).toBeInTheDocument()
    })

    it.each([
      'Total subventions accordées',
      'Total subventions formations accordées',
      'Contact référent',
    ])('=> alors le drawer ne contient pas l’intituler: %s', (intituler) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const div = within(drawer).queryByText(intituler)
      expect(div).not.toBeInTheDocument()
    })

    it('=> alors le drawer ne contient pas le bouton "Plus de détails" ', () => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Préfecture du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })

      const plusDeDetails = within(drawer).queryByText(matchWithoutMarkup('Plus de détails'))
      expect(plusDeDetails).not.toBeInTheDocument()
    })

    it.each(['', undefined])('=> alors un drawer s’ouvre et etant donner que le links.plusDetailsHref est %s alors il ne s’affiche pas', (value) => {
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
            feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
            links: { plusDetails: value },
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
      const totaltirets = within(drawer).queryByText('-')
      expect(totaltirets).not.toBeInTheDocument()
      const titreDrawer = within(drawer).getByRole('heading', {
        level: 1,
        name: 'Département du Rhône',
      })
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

    it('=> alors je vois les informations non-obligatoires remplacer par un tiret ou que l’intituler n’est pas affiché', () => {
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
      const totaltirets = within(drawer).getAllByText('-')
      expect(totaltirets).toHaveLength(1)
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
      '=> alors un drawer s’ouvre avec $feuilleDeRouteTotal $result alors il s’affiche aux $version ',
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
    ])('=> alors le drawer contient l’intituler: %s ', (intituler) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const div = within(drawer).queryByText(intituler)
      expect(div).toBeInTheDocument()
    })

    it.each([
      'Contact politique de la collectivité',
      'Contact technique',
    ])('=> alors le drawer ne contient pas l’intituler: %s ', (intituler) => {
      // GIVEN
      afficherGouvernance()

      // WHEN
      jOuvreLesDetailsDuMembre('Département du Rhône')

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
      const div = within(drawer).queryByText(intituler)
      expect(div).not.toBeInTheDocument()
    })

    it('=> alors le drawer contient le bouton "Plus de détails" ', () => {
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

    it.each(['', undefined])('=> alors un drawer s’ouvre et etant donner que le contact technique est %s alors il ne s’affiche pas', (value) => {
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
            contactTechnique: value,
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
      const contactTechniqueIntituler = within(drawer).queryByText('Contact technique')
      expect(contactTechniqueIntituler).not.toBeInTheDocument()
    })
  })
})

function afficherGouvernance(gouvernance?: object): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(gouvernance), new Date())
  render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
}

function jOuvreLesDetailsDuMembre(nomDuMembre: string): void {
  fireEvent.click(screen.getByRole('button', { name: nomDuMembre }))
}

function jeFermeLesDetailsDuMembre(nomDuMembre: string): void {
  fireEvent.click(screen.getByRole('button', { name: nomDuMembre }))
}
