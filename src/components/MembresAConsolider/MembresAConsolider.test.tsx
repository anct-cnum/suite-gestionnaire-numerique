import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MembresAConsolider from './MembresAConsolider'
import { renderComponent, stubbedServerAction } from '@/components/testHelper'
import { MembresAConsoliderViewModel, reglesPresenter } from '@/presenters/membresAConsoliderPresenter'

describe('membres à consolider', () => {
  it('affiche le membre à consolider et son action de transfert', () => {
    // WHEN
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={unMembre()} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Membres à consolider' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Transférer' })).toBeInTheDocument()
  })

  it('transfère le membre vers la structure cible proposée, notifie et rafraîchit', async () => {
    // GIVEN
    const transfererMembreAction = stubbedServerAction(['OK'])
    const refresh = vi.fn<() => void>()
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={unMembre()} />, {
      pathname: '/membres-a-consolider',
      router: {
        back: vi.fn<() => void>(),
        forward: vi.fn<() => void>(),
        prefetch: vi.fn<() => void>(),
        push: vi.fn<() => void>(),
        refresh,
        replace: vi.fn<() => void>(),
      },
      transfererMembreAction,
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Transférer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Transférer le membre' }))

    // THEN
    const notification = await screen.findByRole('status')
    expect(notification.textContent).toBe('Membre transféré')
    expect(transfererMembreAction).toHaveBeenCalledWith({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })
    expect(refresh).toHaveBeenCalledWith()
  })

  it('permet de modifier l’identifiant de la structure cible avant de transférer', async () => {
    // GIVEN
    const transfererMembreAction = stubbedServerAction(['OK'])
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={unMembre()} />, {
      pathname: '/membres-a-consolider',
      transfererMembreAction,
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Transférer' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Identifiant de la structure cible' }), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Transférer le membre' }))

    // THEN
    await screen.findByRole('status')
    expect(transfererMembreAction).toHaveBeenCalledWith({
      idCible: 1234,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })
  })

  it('affiche une erreur si la cible saisie est invalide, sans appeler l’action', () => {
    // GIVEN
    const transfererMembreAction = stubbedServerAction(['OK'])
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={unMembre()} />, {
      transfererMembreAction,
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Transférer' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Identifiant de la structure cible' }), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Transférer le membre' }))

    // THEN
    expect(transfererMembreAction).not.toHaveBeenCalled()
  })

  it('affiche une notification d’erreur si le transfert échoue', async () => {
    // GIVEN
    const transfererMembreAction = stubbedServerAction(['La structure cible est déjà membre de cette gouvernance'])
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={unMembre()} />, {
      transfererMembreAction,
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Transférer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Transférer le membre' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : La structure cible est déjà membre de cette gouvernance')
  })

  it('importe une liste depuis un CSV collé et transfère une ligne', async () => {
    // GIVEN
    const transfererMembreAction = stubbedServerAction(['OK'])
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={listeVide()} />, {
      pathname: '/membres-a-consolider',
      transfererMembreAction,
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Importer un CSV' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Contenu du CSV' }), {
      target: { value: 'membre_id,cur_id,alt_id\nstructure-77944552700046-26,9869,9867' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Charger la liste' }))
    fireEvent.click(screen.getByRole('button', { name: 'Transférer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Transférer le membre' }))

    // THEN
    await screen.findByRole('status')
    expect(transfererMembreAction).toHaveBeenCalledWith({
      idCible: 9867,
      idMembre: 'structure-77944552700046-26',
      idSource: 9869,
      path: '/membres-a-consolider',
    })
  })

  it('signale les lignes invalides du CSV importé', () => {
    // GIVEN
    renderComponent(<MembresAConsolider regles={reglesPresenter('structure-fantome')} viewModel={listeVide()} />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Importer un CSV' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Contenu du CSV' }), {
      target: { value: 'membre_id,cur_id,alt_id\n,10,20' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Charger la liste' }))

    // THEN
    expect(screen.getByText('Aucune ligne exploitable.')).toBeInTheDocument()
    expect(screen.getByText('Ligne 2 ignorée : membre_id / cur_id / alt_id invalides.')).toBeInTheDocument()
  })
})

function listeVide(): MembresAConsoliderViewModel {
  return { membres: [], total: 0 }
}

function unMembre(): MembresAConsoliderViewModel {
  return {
    membres: [
      {
        departement: '26',
        estCoporteur: false,
        idCible: 9867,
        idSource: 9869,
        idsParam: '9869,9867',
        membreId: 'structure-77944552700046-26',
        nbSaDuSiren: 2,
        nomActuelAffiche: 'PRÊT MATERIEL INFORMATIQUE RECONDITIONNE',
        nomOrigine: 'Maison citoyenne Noël Guichard',
        saTerrainNom: 'Maison Citoyenne Noel Guichard',
        saTerrainOp: 5,
      },
    ],
    total: 1,
  }
}
