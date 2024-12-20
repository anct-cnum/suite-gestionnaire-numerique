import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('quand je clique sur un membre puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherGouvernance()

    // WHEN
    jOuvreLesDetailsDUnMembre()
    jeFermeLesDetailsDUnMembre()

    // THEN
    const drawer = screen.queryByRole('dialog', { name: 'Préfecture du Rhône' })
    expect(drawer).not.toBeInTheDocument()
  })

  it('quand je clique sur le membre de la préfecture, alors un drawer s’ouvre avec les détails du membre rempli à 100%', () => {
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
    const typologieMembre = screen.getByText('Préfecture départementale')
    expect(typologieMembre).toBeInTheDocument()
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

  it('quand je clique sur un membre puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherGouvernance()

    // WHEN
    jOuvreLesDetailsDUnMembre()
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
    jeFermeLesDetailsDUnMembre()

    // THEN
    expect(drawer).not.toBeVisible()
  })

  it('quand je clique sur le membre de la préfecture, alors je vois les informations non-obligatoires remplacer par un tiret ou que l’intituler n’est pas affiché', () => {
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
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
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
    expect(totaltirets).toHaveLength(1)
    const sectionFeuilleDeRoute = within(drawer).queryByText('Feuille de route')
    expect(sectionFeuilleDeRoute).not.toBeInTheDocument()
  })

  it.each([
    {
      feuilleDeRouteTotal: 1,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
      ],
      result: 'Feuille de route',
      totalTirets: 1,
      version: 'singulier',
    },
    {
      feuilleDeRouteTotal: 2,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône',
        },
      ],
      result: 'Feuilles de route',
      totalTirets: 1,
      version: 'pluriel',
    },
    {
      feuilleDeRouteTotal: 3,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône 2',
        },
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
              totalMontantSubventionAccorde: 0,
              totalMontantSubventionFormationAccorde: 0,
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

  it('quand je clique sur le membre autre que la préfecture alors un drawer s’ouvre avec les détails du membre rempli à 100%', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Département du Rhône' })
    fireEvent.click(membre)

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

  it('quand je clique sur le membre autre que la préfecture alors je vois les informations optionnelles remplacer par un tiret', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(
      gouvernanceReadModelFactory({
        membres: [
          {
            contactReferent: {
              mailContact: 'didier.durand@exemple.com',
              nom: 'Didier',
              poste: 'chargé de mission',
              prenom: 'Durant',
            },
            contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [],
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
    )

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Département du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
    const totaltirets = within(drawer).getAllByText('-')
    expect(totaltirets).toHaveLength(1)
    const sectionFeuilleDeRoute = within(drawer).queryByText('Feuille de route')
    expect(sectionFeuilleDeRoute).not.toBeInTheDocument()
  })

  it.each([
    'Contact politique de la collectivité',
    'Contact technique',
    'Feuilles de route',
    'Téléphone',
  ])('quand je clique sur le membre de la préfecture alors le drawer contient %s', (section) => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
    const contactReferentMembre = within(drawer).getByText(section)
    expect(contactReferentMembre).toBeInTheDocument()
  })

  it('quand je clique sur le membre de la préfecture alors le drawer ne contient pas le bouton "Plus de détails" ', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })

    const plusDeDetails = within(drawer).queryByText('Plus de détails')
    expect(plusDeDetails).not.toBeInTheDocument()
  })

  it.each([
    'Contact référent',
    'Feuille de route',
    'Total subventions accordées',
    'Total subventions formations accordées',
    'Téléphone',
  ])('quand je clique sur le membre est autre que la préfecture alors le drawer contient %s ', (section) => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Département du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
    const contactReferentMembre = within(drawer).getByText(section)
    expect(contactReferentMembre).toBeInTheDocument()
  })

  it('quand je clique sur le membre est autre que la préfecture alors le drawer contient le bouton "Plus de détails" ', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Département du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Département du Rhône' })
    const plusDeDetails = within(drawer).getByRole('link', { name: 'Plus de détails' })
    expect(plusDeDetails).toBeInTheDocument()
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
            totalMontantSubventionAccorde: 0,
            totalMontantSubventionFormationAccorde: 0,
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
    const tirets = within(drawer).getAllByText('-')
    expect(tirets).toHaveLength(1)
  })

  it.each([
    {
      feuilleDeRouteTotal: 1,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
      ],
      result: 'Feuille de route',
      totalTirets: 1,
      version: 'singulier',
    },
    {
      feuilleDeRouteTotal: 2,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône',
        },
      ],
      result: 'Feuilles de route',
      totalTirets: 1,
      version: 'pluriel',
    },
    {
      feuilleDeRouteTotal: 3,
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône',
        },
        {
          montantSubventionAccorde: 0,
          montantSubventionFormationAccorde: 0,
          nom: 'Feuille de route numérique du Rhône 2',
        },
      ],
      result: 'Feuilles de route',
      totalTirets: 1,
      version: 'pluriel',
    },
  ])(
    'quand je visualise le detail d’un membre et que j’ai $feuilleDeRouteTotal $result alors il s’affiche aux $version',
    ({ feuillesDeRoute, result }) => {
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
              totalMontantSubventionAccorde: 0,
              totalMontantSubventionFormationAccorde: 0,
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
    }
  )
})

function afficherGouvernance(): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
  render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
}

function jOuvreLesDetailsDUnMembre(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Préfecture du Rhône' }))
}

function jeFermeLesDetailsDUnMembre(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' }))
}
