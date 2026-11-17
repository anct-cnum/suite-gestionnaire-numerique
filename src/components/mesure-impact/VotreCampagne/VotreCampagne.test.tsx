import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import VotreCampagne from './VotreCampagne'
import { VotreCampagneViewModel } from '@/presenters/mesure-impact/votreCampagnePresenter'

describe('votre campagne de mesure d’impact', () => {
  it('affiche les détails de la campagne et les accès aux résultats et à la saisie', () => {
    // WHEN
    render(<VotreCampagne viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'La mesure d’impact de la médiation numérique sur votre territoire'
    )
    const termes = screen.getAllByRole('term').map((terme) => terme.textContent)
    const valeurs = screen.getAllByRole('definition').map((valeur) => valeur.textContent)
    expect(termes).toStrictEqual(['Territoire', 'Réponses reçues'])
    expect(valeurs).toStrictEqual(['Sicoval', '148 réponses'])
    expect(screen.getByRole('link', { name: 'Voir les résultats' })).toHaveAttribute(
      'href',
      '/mesure-impact/sicoval/resultats'
    )
    expect(screen.getByRole('link', { name: 'Saisir manuellement' })).toHaveAttribute(
      'href',
      '/mesure-impact/sicoval/saisie'
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('diffuse le questionnaire en ligne : QR code téléchargeable et adresse du site vitrine', () => {
    // WHEN
    render(<VotreCampagne viewModel={viewModel} />)

    // THEN
    const enLigne = screen.getByRole('region', { name: 'Questionnaire en ligne' })
    expect(within(enLigne).getByRole('img', { name: `QR code de l’adresse ${ADRESSE}` })).toHaveAttribute(
      'src',
      'data:image/png;base64,AAAA'
    )
    const telechargement = within(enLigne).getByRole('link', { name: /Télécharger le QR code/ })
    expect(telechargement).toHaveAttribute('href', 'data:image/png;base64,AAAA')
    expect(telechargement).toHaveAttribute('download', 'questionnaire-sicoval.png')
    expect(within(enLigne).getByText(ADRESSE)).toBeInTheDocument()
  })

  it('« Faire répondre quelqu’un » ouvre le questionnaire du site vitrine dans un nouvel onglet', () => {
    // WHEN
    render(<VotreCampagne viewModel={viewModel} />)

    // THEN
    const lien = screen.getByRole('link', { name: 'Faire répondre quelqu’un' })
    expect(lien).toHaveAttribute('title', 'Faire répondre quelqu’un - nouvel onglet')
    expect(lien).toHaveAttribute('href', ADRESSE)
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('copie l’adresse du questionnaire et l’annonce', async () => {
    // GIVEN
    const user = userEvent.setup()
    render(<VotreCampagne viewModel={viewModel} />)

    // WHEN
    await user.click(screen.getByRole('button', { name: 'Copier le lien' }))

    // THEN
    await expect(navigator.clipboard.readText()).resolves.toBe(ADRESSE)
    expect(screen.getByRole('status').textContent).toBe('Lien copié')
  })

  it('le questionnaire papier n’est pas encore téléchargeable', () => {
    // WHEN
    render(<VotreCampagne viewModel={viewModel} />)

    // THEN
    const papier = screen.getByRole('region', { name: 'Questionnaire papier' })
    expect(within(papier).queryByRole('link')).not.toBeInTheDocument()
    expect(within(papier).getByText('Le questionnaire à imprimer sera disponible prochainement.')).toBeInTheDocument()
  })

  it('prévient quand la campagne n’accepte pas de réponses', () => {
    // WHEN
    render(<VotreCampagne viewModel={{ ...viewModel, ouverte: false }} />)

    // THEN
    expect(screen.getByRole('alert').textContent).toBe('Cette campagne n’accepte pas de réponses en ce moment.')
  })
})

const ADRESSE = 'https://inclusion-numerique.anct.gouv.fr/questionnaire/sicoval'

const viewModel: VotreCampagneViewModel = {
  adresseDuQuestionnaire: ADRESSE,
  details: [
    { libelle: 'Territoire', valeur: 'Sicoval' },
    { libelle: 'Réponses reçues', valeur: '148 réponses' },
  ],
  lienResultats: '/mesure-impact/sicoval/resultats',
  lienSaisie: '/mesure-impact/sicoval/saisie',
  nom: 'Pilote Sicoval 2026',
  nomDuFichierQrCode: 'questionnaire-sicoval.png',
  ouverte: true,
  qrCode: 'data:image/png;base64,AAAA',
  titreFilAriane: 'Sicoval',
}
