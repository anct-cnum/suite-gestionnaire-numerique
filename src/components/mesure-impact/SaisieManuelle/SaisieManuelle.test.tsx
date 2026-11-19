import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import SaisieManuelle from './SaisieManuelle'
import * as action from '@/app/api/actions/mesure-impact/saisirUneReponseAction'

describe('saisie d’un questionnaire papier ou téléphonique', () => {
  it('quand j’ouvre la saisie, alors je choisis comment les réponses ont été recueillies', () => {
    // WHEN
    afficherLaSaisie()

    // THEN
    const choix = screen.getByRole('group', { name: 'Comment les réponses ont-elles été recueillies ?' })
    expect(within(choix).getByRole('radio', { name: /Questionnaire papier/ })).toBeChecked()
    expect(within(choix).getByRole('radio', { name: /Passation par téléphone/ })).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Retour à la campagne' })).toHaveAttribute('href', '/mesure-impact/sicoval')
  })

  it('sur papier, quand je laisse toutes les questions vides et que j’enregistre, alors la réponse est enregistrée avec le canal papier', async () => {
    // GIVEN
    vi.spyOn(action, 'saisirUneReponseAction').mockResolvedValueOnce(['OK'])
    afficherLaSaisie()
    await commencer('Questionnaire papier')
    expect(screen.getByText('Saisie d’un questionnaire papier')).toBeInTheDocument()

    // WHEN
    await allerJusquAuBout()
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer le questionnaire' }))

    // THEN
    expect(action.saisirUneReponseAction).toHaveBeenCalledWith({
      canal: 'papier',
      contenu: {},
      identifiantPublic: 'sicoval',
    })
    expect(screen.getByRole('heading', { level: 1, name: 'Questionnaire enregistré' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retour à la campagne' })).toHaveAttribute('href', '/mesure-impact/sicoval')
  })

  it('sur papier, toutes les questions sont proposées, même celles qu’une réponse écarterait en ligne', async () => {
    // GIVEN
    afficherLaSaisie()
    await commencer('Questionnaire papier')

    // WHEN
    await allerJusqua(/Avez-vous le sentiment d’avoir progressé/)
    await userEvent.click(screen.getByRole('radio', { name: 'Pas du tout' }))
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // THEN
    expect(questionAffichee().textContent).toContain('Dans quels domaines en particulier ?')
  })

  it('quand je clique sur une partie terminée, alors je reviens à sa première question', async () => {
    // GIVEN
    afficherLaSaisie()
    await commencer('Questionnaire papier')
    await allerJusqua(/Avez-vous le sentiment d’avoir progressé/)

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Le contexte (terminée)' }))

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Le contexte de vos accompagnements' })).toBeInTheDocument()
    expect(questionAffichee()).toHaveAccessibleName(/^Question 1 sur/)
  })

  it('par téléphone, quand je réponds « Pas du tout » à la question 12, alors la question conditionnelle suivante ne s’affiche pas', async () => {
    // GIVEN
    afficherLaSaisie()
    await commencer('Passation par téléphone')
    expect(screen.getByText('Passation par téléphone', { selector: 'strong' })).toBeInTheDocument()

    // WHEN
    await allerJusqua(/Avez-vous le sentiment d’avoir progressé/)
    await userEvent.click(screen.getByRole('radio', { name: 'Pas du tout' }))
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // THEN
    expect(questionAffichee().textContent).not.toContain('Dans quels domaines en particulier ?')
  })

  it('quand je quitte la saisie après avoir répondu, alors une confirmation est demandée et rien n’est enregistré', async () => {
    // GIVEN
    vi.spyOn(action, 'saisirUneReponseAction')
    afficherLaSaisie()
    await commencer('Questionnaire papier')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Travailler ou chercher un travail' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Quitter la saisie' }))

    // THEN
    const confirmation = screen.getByRole('dialog', { name: 'Quitter la saisie ?' })
    expect(within(confirmation).getByRole('link', { name: 'Quitter sans enregistrer' })).toHaveAttribute(
      'href',
      '/mesure-impact/sicoval'
    )
    expect(within(confirmation).getByRole('button', { name: 'Continuer la saisie' })).toBeInTheDocument()
    expect(action.saisirUneReponseAction).not.toHaveBeenCalled()
  })

  it('quand je quitte la saisie sans avoir répondu, alors je reviens directement à la campagne', async () => {
    // GIVEN
    afficherLaSaisie()

    // WHEN
    await commencer('Questionnaire papier')

    // THEN
    expect(screen.getByRole('link', { name: 'Quitter la saisie' })).toHaveAttribute('href', '/mesure-impact/sicoval')
  })

  it('quand l’enregistrement est refusé, alors le message s’affiche', async () => {
    // GIVEN
    vi.spyOn(action, 'saisirUneReponseAction').mockResolvedValueOnce(['Cette campagne n’accepte plus de réponses.'])
    afficherLaSaisie()
    await commencer('Questionnaire papier')
    await allerJusquAuBout()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer le questionnaire' }))

    // THEN
    expect(screen.getByRole('alert').textContent).toBe('Cette campagne n’accepte plus de réponses.')
  })
})

function afficherLaSaisie(): void {
  render(
    <SaisieManuelle
      viewModel={{
        identifiantPublic: 'sicoval',
        lienCampagne: '/mesure-impact/sicoval',
        questionnaireVersion: 'socle-v22',
      }}
    />
  )
}

async function commencer(canal: string): Promise<void> {
  await userEvent.click(screen.getByRole('radio', { name: new RegExp(canal) }))
  await userEvent.click(screen.getByRole('button', { name: 'Commencer la saisie' }))
}

function questionAffichee(): HTMLElement {
  return screen.getByRole('group', { name: /Question \d+ sur \d+/ })
}

async function allerJusqua(intitule: RegExp): Promise<void> {
  while (!intitule.test(questionAffichee().textContent)) {
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))
  }
}

async function allerJusquAuBout(): Promise<void> {
  while (screen.queryByRole('button', { name: 'Question suivante' }) !== null) {
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))
  }
}
