import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import LieuInclusionFormulaire, { EtatLieuInclusionFormulaire } from './LieuInclusionFormulaire'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import * as notification from '@/components/shared/Notification/Notification'
import { renderComponent } from '@/components/testHelper'

describe('formulaire partagé d’un lieu d’inclusion', () => {
  it('présente un formulaire unique : le SIRET est optionnel et tous les champs sont saisissables', () => {
    // WHEN
    renderComponent(
      <LieuInclusionFormulaire
        idPrefixe="test"
        onChangement={vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()}
        valeursInitiales={valeursVides}
      />
    )

    // THEN
    expect(screen.getByRole('textbox', { name: /N° SIRET du lieu \(optionnel\)/ })).toBeEnabled()
    expect(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ })).toBeEnabled()
    expect(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' })).toBeEnabled()
    expect(screen.getByRole('combobox', { name: /Adresse du lieu \*/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Lieu d’activité itinérant (exemple : bus)' })).not.toBeChecked()
    expect(screen.getByRole('textbox', { name: /Complément d’adresse/ })).toBeEnabled()
    // L'ancienne bascule entre deux parcours a disparu.
    expect(screen.queryByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' })).toBeNull()
  })

  it('quand je recherche un SIRET trouvé, alors le nom et l’adresse sont pré-remplis et restent modifiables', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    const rechercherUneEntrepriseAction = vi.fn<() => Promise<EntrepriseViewModel>>().mockResolvedValueOnce(entreprise)
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />,
      { rechercherUneEntrepriseAction }
    )

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: /N° SIRET du lieu \(optionnel\)/ }), '12345678901234')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    expect(rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '12345678901234' })
    const nom = await screen.findByDisplayValue('Ma Structure')
    expect(nom).toBeEnabled()
    expect(onChangement).toHaveBeenLastCalledWith({
      adresse: '1 rue de la Paix 75001 Paris',
      nom: 'Ma Structure',
      siretSaisi: '12345678901234',
    })
  })

  it('quand le SIRET est introuvable, alors une notification d’erreur est affichée', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const rechercherUneEntrepriseAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['Aucune entreprise trouvée avec cet identifiant'])
    renderComponent(
      <LieuInclusionFormulaire
        idPrefixe="test"
        onChangement={vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()}
        valeursInitiales={valeursVides}
      />,
      { rechercherUneEntrepriseAction }
    )

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: /N° SIRET du lieu \(optionnel\)/ }), '12345678901234')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description: 'Aucune entreprise trouvée avec cet identifiant',
        title: 'Erreur : ',
      })
    })
  })

  it('l’adresse est proposée par la BAN dès 3 caractères et la sélection est remontée', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />,
      { rechercherAdressesAction }
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: /Adresse du lieu \*/ }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))

    // THEN
    expect(rechercherAdressesAction).toHaveBeenCalledWith('paix')
    expect(onChangement).toHaveBeenLastCalledWith(expect.objectContaining({ adresse: '1 Rue de la Paix, 75001 Paris' }))
  })

  it('le nom saisi à la main est remonté au parent', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />
    )

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ }), 'Mon lieu')

    // THEN
    expect(onChangement).toHaveBeenLastCalledWith(expect.objectContaining({ nom: 'Mon lieu' }))
  })

  it('en modification, les valeurs du lieu pré-remplissent le formulaire, itinérance comprise', () => {
    // WHEN
    renderComponent(
      <LieuInclusionFormulaire
        idPrefixe="test"
        onChangement={vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()}
        valeursInitiales={{
          adresse: '1 Rue de la Paix, 75001 Paris',
          complementAdresse: 'Bât. B',
          itinerant: true,
          nomStructure: 'Mon lieu',
          siret: '12345678901234',
        }}
      />
    )

    // THEN
    expect(screen.getByRole('textbox', { name: /N° SIRET du lieu \(optionnel\)/ })).toHaveValue('12345678901234')
    expect(screen.getByRole('textbox', { name: /Nom du lieu d’activité \*/ })).toHaveValue('Mon lieu')
    expect(screen.getByRole('textbox', { name: /Complément d’adresse/ })).toHaveValue('Bât. B')
    expect(screen.getByRole('checkbox', { name: 'Lieu d’activité itinérant (exemple : bus)' })).toBeChecked()
  })
})

const valeursVides = { adresse: '', nomStructure: '' }

const entreprise: EntrepriseViewModel = {
  activitePrincipale: '94.99Z',
  activitePrincipaleLibelle: 'Autres organisations',
  adresse: '1 rue de la Paix 75001 Paris',
  categorieJuridiqueCode: '9220',
  categorieJuridiqueLibelle: 'Association',
  codeInsee: '75101',
  codePostal: '75001',
  commune: 'Paris',
  denomination: 'Ma Structure',
  identifiant: '12345678901234',
  nomVoie: 'rue de la Paix',
  numeroVoie: '1',
}
