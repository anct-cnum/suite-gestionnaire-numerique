import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('quand je clique sur un membre, alors un drawer s’ouvre avec les détails du membre rempli à 100%', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
    expect(drawer).toHaveAttribute('aria-labelledby', 'labelMembreId')
    const totaltirets = within(drawer).queryByText('-')
    expect(totaltirets).not.toBeInTheDocument()
    const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Préfecture du Rhône' })
    expect(titreDrawer).toBeInTheDocument()
    const rolesList = within(drawer).getAllByRole('list')[0]
    const rolesItems = within(rolesList).getAllByRole('listitem')
    expect(rolesItems).toHaveLength(2)
    const roleOne = within(rolesItems[0]).getByText('Co-porteur', { selector: 'p' })
    expect(roleOne).toBeInTheDocument()
    const intitulerDuRole = screen.getByText('Préfecture départementale')
    expect(intitulerDuRole).toBeInTheDocument()
    const feuillesDeRouteList = within(drawer).getAllByRole('list')[1]
    const feuillesDeRouteItems = within(feuillesDeRouteList).getAllByRole('listitem')
    expect(feuillesDeRouteItems).toHaveLength(2)
    const feuilleDeRoutePluriel = within(drawer).getByText('Feuilles de route')
    expect(feuilleDeRoutePluriel).toBeInTheDocument()
    const FeuilleDeRouteOne = within(feuillesDeRouteItems[0]).getByRole('link', {
      name: 'Feuille de route inclusion',
    })
    expect(FeuilleDeRouteOne).toHaveAttribute('href', '/')
    const FeuilleDeRouteTwo = within(feuillesDeRouteItems[1]).getByRole('link', {
      name: 'Feuille de route numérique du Rhône',
    })
    expect(FeuilleDeRouteTwo).toHaveAttribute('href', '/')
    const boutonFermeture = within(drawer).getByRole('button', {
      name: 'Fermer les détails du membre : Préfecture du Rhône',
    })
    expect(boutonFermeture).toBeInTheDocument()
    const contactReferentMembre = within(drawer).getByText(
      'Laetitia Henrich, chargé de mission julien.deschamps@rhones.gouv.fr'
    )
    expect(contactReferentMembre).toBeInTheDocument()
    const contactTechniqueMembre = within(drawer).getByText('Simon.lagrange@rhones.gouv.fr')
    expect(contactTechniqueMembre).toBeInTheDocument()
    const telephoneMembre = within(drawer).getByText('+33 4 45 00 45 00')
    expect(telephoneMembre).toBeInTheDocument()
  })

  it('quand je visualise le detail d’un membre, alors je vois les informations optionnelles remplacer par un tiret', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(
      gouvernanceReadModelFactory({
        membres: [
          {
            contactReferent: {
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [],
            nom: 'Préfecture du Rhône',
            roles: ['Co-porteur'],
            telephone: '',
            type: 'Administration',
            typologieMembre: 'Préfecture départementale',
          },
        ],
      })
    )
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
    const totaltirets = within(drawer).getAllByText('-')
    expect(totaltirets).toHaveLength(2)
    const totalList = within(drawer).getAllByRole('list')
    expect(totalList).toHaveLength(1)
  })

  it.each([
    {
      feuilleDeRouteTotal: 0,
      feuillesDeRoute: [],
      result: 'Feuille de route',
      totalTirets: 2,
      version: 'singulier',
    },
    {
      feuilleDeRouteTotal: 1,
      feuillesDeRoute: [{ nom: 'Feuille de route inclusion' }],
      result: 'Feuille de route',
      totalTirets: 1,
      version: 'singulier',
    },
    {
      feuilleDeRouteTotal: 2,
      feuillesDeRoute: [
        { nom: 'Feuille de route inclusion' },
        { nom: 'Feuille de route numérique du Rhône' },
      ],
      result: 'Feuilles de route',
      totalTirets: 1,
      version: 'pluriel',
    },
    {
      feuilleDeRouteTotal: 3,
      feuillesDeRoute: [
        { nom: 'Feuille de route inclusion' },
        { nom: 'Feuille de route numérique du Rhône' },
        { nom: 'Feuille de route numérique du Rhône 2' },
      ],
      result: 'Feuilles de route',
      totalTirets: 1,
      version: 'pluriel',
    },
  ])(
    'quand je visualise le detail d’un membre et que j’ai $feuilleDeRouteTotal $result alors il s’affiche aux $version ',
    ({ feuillesDeRoute, totalTirets, result }) => {
      // GIVEN
      const gouvernanceViewModel = gouvernancePresenter(
        gouvernanceReadModelFactory({
          membres: [
            {
              contactReferent: {
                mailContact: 'julien.deschamps@rhones.gouv.fr',
                nom: 'Henrich',
                poste: 'chargé de mission',
                prenom: 'Laetitia',
              },
              contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
              feuillesDeRoute,
              nom: 'Préfecture du Rhône',
              roles: ['Co-porteur'],
              telephone: '',
              type: 'Administration',
              typologieMembre: 'Préfecture départementale',
            },
          ],
        })
      )
      render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

      // WHEN
      const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
      fireEvent.click(membre)

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
      const feuilleDeRouteSingulierOuPluriel = within(drawer).getByText(result)
      expect(feuilleDeRouteSingulierOuPluriel).toBeInTheDocument()
      const tirets = within(drawer).getAllByText('-')
      expect(tirets).toHaveLength(totalTirets)
    }
  )
})
