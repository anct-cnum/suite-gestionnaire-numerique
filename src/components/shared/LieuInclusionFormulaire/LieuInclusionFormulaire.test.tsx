import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import LieuInclusionFormulaire, { EtatLieuInclusionFormulaire } from './LieuInclusionFormulaire'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import * as notification from '@/components/shared/Notification/Notification'
import { renderComponent } from '@/components/testHelper'

describe('formulaire partagé d’un lieu d’inclusion (SIRET / sans SIRET)', () => {
  it('quand je coche « pas de SIRET », alors le champ SIRET est désactivé et la saisie manuelle apparaît', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />
    )

    // WHEN
    await userEvent.click(screen.getByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' }))

    // THEN
    expect(screen.getByRole('textbox', { name: 'SIRET du lieu d’activité (ou RNA)' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Adresse *' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Lieu d’activité itinérant (exemple : bus)' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nom du lieu d’activité *' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Complément d’adresse' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' })).toBeInTheDocument()
    expect(onChangement).toHaveBeenLastCalledWith(expect.objectContaining({ entreprise: null, sansSiret: true }))
  })

  it('quand je recherche un SIRET trouvé, alors le nom et l’adresse s’affichent en lecture seule et les typologies restent saisissables', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    const rechercherUneEntrepriseAction = vi.fn<() => Promise<EntrepriseViewModel>>().mockResolvedValueOnce(entreprise)
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />,
      { rechercherUneEntrepriseAction }
    )

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: 'SIRET du lieu d’activité (ou RNA)' }), '12345678901234')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    expect(rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '12345678901234' })
    const nom = await screen.findByRole('textbox', { name: 'Nom du lieu d’activité' })
    expect(nom).toBeDisabled()
    expect(nom).toHaveValue('Ma Structure')
    expect(screen.getByRole('textbox', { name: 'Adresse' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Typologie(s) du lieu d’activité *' })).toBeEnabled()
    expect(onChangement).toHaveBeenLastCalledWith(
      expect.objectContaining({ entreprise, sansSiret: false, siretSaisi: '12345678901234' })
    )
  })

  it('quand le SIRET est introuvable, alors une notification d’erreur est affichée', async () => {
    // GIVEN
    vi.spyOn(notification, 'Notification').mockImplementationOnce(() => undefined)
    const rechercherUneEntrepriseAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['Aucune entreprise trouvée avec cet identifiant'])
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={vi.fn()} valeursInitiales={valeursVides} />,
      { rechercherUneEntrepriseAction }
    )

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: 'SIRET du lieu d’activité (ou RNA)' }), '12345678901234')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    await waitFor(() => {
      expect(notification.Notification).toHaveBeenCalledWith('error', {
        description: 'Aucune entreprise trouvée avec cet identifiant',
        title: 'Erreur : ',
      })
    })
  })

  it('sans SIRET, l’adresse est proposée par la BAN dès 3 caractères et la sélection est remontée', async () => {
    // GIVEN
    const onChangement = vi.fn<(etat: EtatLieuInclusionFormulaire) => void>()
    const rechercherAdressesAction = vi
      .fn<() => Promise<ReadonlyArray<{ label: string }>>>()
      .mockResolvedValue([{ label: '1 Rue de la Paix, 75001 Paris' }])
    renderComponent(
      <LieuInclusionFormulaire idPrefixe="test" onChangement={onChangement} valeursInitiales={valeursVides} />,
      { rechercherAdressesAction }
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Il n’y a pas de SIRET de structure pour ce lieu' }))

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Adresse *' }), 'paix')
    await userEvent.click(await screen.findByRole('option', { name: '1 Rue de la Paix, 75001 Paris' }))

    // THEN
    expect(rechercherAdressesAction).toHaveBeenCalledWith('paix')
    expect(onChangement).toHaveBeenLastCalledWith(
      expect.objectContaining({ adresse: '1 Rue de la Paix, 75001 Paris', sansSiret: true })
    )
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
