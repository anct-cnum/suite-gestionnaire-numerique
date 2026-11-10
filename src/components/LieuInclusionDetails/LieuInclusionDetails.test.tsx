import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import LieuxInclusionDetails from './LieuInclusionDetails'
import LieuInclusionDetailsInformationsGenerales from './LieuInclusionDetailsInformationsGenerales'
import { renderComponent } from '../testHelper'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import * as notification from '@/components/shared/Notification/Notification'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'
import {
  createDefaultInformationsGeneralesData,
  createDefaultLieuInclusionDetailsData,
} from '@/stories/Components/LieuInclusionDetails/LieuInclusionDetailsTestData'

// Les sections lisent l'identifiant du lieu dans l'URL et le bouton de suppression redirige.
vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/lieu/42',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: vi.fn<(href: string) => void>() }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
}))

describe('fiche d’un lieu d’inclusion', () => {
  it('quand le lieu est géré dans la Coop, alors un message dit que ses médiateurs verront les modifications, qui restent possibles (#2105)', () => {
    // GIVEN
    const data = {
      ...createDefaultLieuInclusionDetailsData(),
      estLieuCoop: true,
      peutModifier: true,
      peutModifierInformationsGenerales: true,
    }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={true} />)

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: 'Lieu géré dans la Coop numérique' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ce lieu est aussi renseigné par ses médiateurs dans la Coop numérique. Vos modifications leur seront présentées, et ils pourront les reprendre.'
      )
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Modifier' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Supprimer ce lieu' })).toBeInTheDocument()
  })

  it('quand le lieu n’est pas géré dans la Coop, alors aucun message n’est affiché et les actions restent disponibles', () => {
    // GIVEN
    const data = {
      ...createDefaultLieuInclusionDetailsData(),
      estLieuCoop: false,
      peutModifier: true,
      peutModifierInformationsGenerales: true,
    }

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={true} />)

    // THEN
    expect(screen.queryByRole('heading', { name: 'Lieu géré dans la Coop numérique' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Modifier' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Supprimer ce lieu' })).toBeInTheDocument()
  })

  it('quand on arrive depuis « C’est mon lieu », accueille avec un bandeau qui dit que le lieu existe déjà (V6-3)', () => {
    // GIVEN
    const data = createDefaultLieuInclusionDetailsData()

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={true} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(screen.getByText('Ce lieu est déjà enregistré')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Vous n’avez pas besoin de le créer. Vérifiez ses informations et modifiez-les si elles ne sont plus à jour.'
      )
    ).toBeInTheDocument()
  })

  it('n’affiche pas ce bandeau quand on arrive sur la fiche par le chemin habituel', () => {
    // GIVEN
    const data = createDefaultLieuInclusionDetailsData()

    // WHEN
    renderComponent(<LieuxInclusionDetails data={data} dejaEnregistre={false} lieuId="42" peutSupprimer={false} />)

    // THEN
    expect(screen.queryByText('Ce lieu est déjà enregistré')).not.toBeInTheDocument()
  })
})

describe('modification des informations générales d’un lieu', () => {
  it('dès qu’une adresse est choisie, présente les lieux déjà déclarés à cette adresse, sans bloquer l’enregistrement', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([
        {
          adresse: '4 Place de la Légion d’Honneur, 93200 Saint-Denis',
          href: '/lieu/7',
          libellePersonnesRattachees: '3 personnes rattachées',
          libelleSiret: 'Sans SIRET',
          nom: 'Médiathèque du centre-ville',
          typologies: 'Bibliothèque, Médiathèque',
        },
      ])
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '4 Place de la Légion d’Honneur, 93200 Saint-Denis' }])
    renderComponent(
      <LieuInclusionDetailsInformationsGenerales data={createDefaultInformationsGeneralesData()} peutModifier={true} />,
      { rechercherAdressesAction, rechercherLieuxInclusionSimilairesAction }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'légion')
    await userEvent.click(
      await screen.findByRole('option', { name: '4 Place de la Légion d’Honneur, 93200 Saint-Denis' })
    )

    // THEN
    await waitFor(() => {
      expect(rechercherLieuxInclusionSimilairesAction).toHaveBeenCalledWith({
        adresse: '4 Place de la Légion d’Honneur, 93200 Saint-Denis',
        idLieuEnModification: '42',
      })
    })
    const titre = await screen.findByText('1 lieu est déjà déclaré à cette adresse')
    expect(titre).toBeInTheDocument()
    expect(
      screen.getByText('Vérifiez qu’il ne s’agit pas du même lieu avant d’enregistrer la nouvelle adresse.')
    ).toBeInTheDocument()
    expect(screen.getByText('Médiathèque du centre-ville')).toBeInTheDocument()
    const lien = screen.getByRole('link', {
      name: 'C’est mon lieu : voir la fiche de Médiathèque du centre-ville - nouvelle fenêtre',
    })
    expect(lien).toHaveAttribute('href', '/lieu/7')
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled()
  })

  it('quand la recherche des lieux déjà déclarés échoue, notifie l’erreur sans afficher d’encadré ni bloquer l’enregistrement', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockRejectedValueOnce(new Error('Service indisponible'))
    await afficherLeFormulaire(rechercherLieuxInclusionSimilairesAction)

    // WHEN
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description:
          'la recherche des lieux déjà déclarés à cette adresse a échoué. Vous pouvez poursuivre la modification.',
        title: 'Erreur : ',
      })
    })
    expect(screen.queryByText(/déjà déclarés? à cette adresse/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled()
  })

  it('quand l’adresse change, efface aussitôt les lieux de l’ancienne adresse', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValueOnce([lieuSimilaire('Médiathèque du centre-ville')])
      .mockReturnValueOnce(new Promise(() => undefined))
    await afficherLeFormulaire(rechercherLieuxInclusionSimilairesAction)
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')
    const lieuAncienneAdresse = await screen.findByText('Médiathèque du centre-ville')
    expect(lieuAncienneAdresse).toBeInTheDocument()

    // WHEN
    await choisirAdresse('19 Rue Proudhon, 93210 Saint-Denis')

    // THEN
    expect(screen.queryByText('Médiathèque du centre-ville')).not.toBeInTheDocument()
  })

  it('quand une nouvelle adresse correspond à d’autres lieux, remplace le contenu de l’encadré', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValueOnce([
        lieuSimilaire('Bibliothèque Musée de l’Opéra'),
        lieuSimilaire('Bibliothèque Musée National'),
      ])
      .mockResolvedValueOnce([lieuSimilaire('Médiathèque du centre-ville')])
    await afficherLeFormulaire(rechercherLieuxInclusionSimilairesAction)
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')
    const titrePluriel = await screen.findByText('2 lieux sont déjà déclarés à cette adresse')
    expect(titrePluriel).toBeInTheDocument()

    // WHEN
    await choisirAdresse('19 Rue Proudhon, 93210 Saint-Denis')

    // THEN
    const titreSingulier = await screen.findByText('1 lieu est déjà déclaré à cette adresse')
    expect(titreSingulier).toBeInTheDocument()
    expect(screen.getByText('Médiathèque du centre-ville')).toBeInTheDocument()
    expect(screen.queryByText('Bibliothèque Musée National')).not.toBeInTheDocument()
  })

  it('re-choisir la même adresse relance la recherche des lieux déjà déclarés', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValue([lieuSimilaire('Médiathèque du centre-ville')])
    await afficherLeFormulaire(rechercherLieuxInclusionSimilairesAction)
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')
    await screen.findByText('Médiathèque du centre-ville')

    // WHEN
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')

    // THEN
    await waitFor(() => {
      expect(rechercherLieuxInclusionSimilairesAction).toHaveBeenCalledTimes(2)
    })
  })

  it('annonce l’apparition des lieux déjà déclarés aux technologies d’assistance', async () => {
    // GIVEN
    const rechercherLieuxInclusionSimilairesAction = vi
      .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
      .mockResolvedValueOnce([lieuSimilaire('Médiathèque du centre-ville')])
    await afficherLeFormulaire(rechercherLieuxInclusionSimilairesAction)
    const zoneAnnonce = screen.getByRole('status')

    // WHEN
    await choisirAdresse('4 Place de la Légion d’Honneur, 93200 Saint-Denis')

    // THEN
    const titre = await within(zoneAnnonce).findByText('1 lieu est déjà déclaré à cette adresse')
    expect(titre).toBeInTheDocument()
  })

  // Même piège qu'à la création (#2278), en pire : les champs sont pré-remplis par le lieu
  // existant, donc rien ne retient la soumission. Entrée dans le champ SIRET enregistre la
  // modification au lieu de lancer la recherche.
  it('la touche Entrée dans le champ SIRET lance la recherche sans enregistrer la modification (#2278)', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementation(() => undefined)
    // Bouchon réaliste : si la soumission part malgré tout, elle aboutit — l'échec du test
    // doit venir de l'assertion, pas d'une exception sur un retour indéfini.
    const modifierLieuInclusionInformationsGeneralesAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValue(['OK'])
    const rechercherUneEntrepriseAction = vi.fn<() => Promise<EntrepriseViewModel>>().mockResolvedValueOnce(entreprise)
    renderComponent(
      <LieuInclusionDetailsInformationsGenerales
        data={{ ...createDefaultInformationsGeneralesData(), typologies: ['ASSO'] }}
        peutModifier={true}
      />,
      {
        modifierLieuInclusionInformationsGeneralesAction,
        rechercherLieuxInclusionSimilairesAction: vi
          .fn<() => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>>()
          .mockResolvedValue([]),
        rechercherUneEntrepriseAction,
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: /N° SIRET du lieu/ }), '21690271800016{Enter}')

    // THEN
    expect(modifierLieuInclusionInformationsGeneralesAction).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '21690271800016' })
    })
  })
})

// Formulaire des informations générales ouvert, avec une autocomplétion qui propose deux adresses.
async function afficherLeFormulaire(
  rechercherLieuxInclusionSimilairesAction: () => Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>>
): Promise<void> {
  const rechercherAdressesAction = vi
    .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
    .mockResolvedValue([
      { label: '4 Place de la Légion d’Honneur, 93200 Saint-Denis' },
      { label: '19 Rue Proudhon, 93210 Saint-Denis' },
    ])
  renderComponent(
    <LieuInclusionDetailsInformationsGenerales data={createDefaultInformationsGeneralesData()} peutModifier={true} />,
    { rechercherAdressesAction, rechercherLieuxInclusionSimilairesAction }
  )
  await userEvent.click(screen.getByRole('button', { name: 'Modifier' }))
}

async function choisirAdresse(label: string): Promise<void> {
  const champ = screen.getByRole('combobox', { name: /Adresse du lieu \*/ })
  await userEvent.clear(champ)
  await userEvent.type(champ, 'saint')
  await userEvent.click(await screen.findByRole('option', { name: label }))
}

function lieuSimilaire(nom: string): LieuInclusionSimilaireViewModel {
  return {
    adresse: '4 Place de la Légion d’Honneur, 93200 Saint-Denis',
    href: '/lieu/7',
    libellePersonnesRattachees: '3 personnes rattachées',
    libelleSiret: 'Sans SIRET',
    nom,
    typologies: 'Bibliothèque, Médiathèque',
  }
}

const entreprise: EntrepriseViewModel = {
  activitePrincipale: '84.11Z',
  activitePrincipaleLibelle: 'Administration publique générale',
  adresse: '60 Rue de la République 69680 Chassieu',
  categorieJuridiqueCode: '7210',
  categorieJuridiqueLibelle: 'Commune',
  codeInsee: '69271',
  codePostal: '69680',
  commune: 'Chassieu',
  denomination: 'COMMUNE DE CHASSIEU',
  identifiant: '21690271800016',
  nomVoie: 'Rue de la République',
  numeroVoie: '60',
}
