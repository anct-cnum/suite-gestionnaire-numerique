import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as preuveDeTravail from './preuveDeTravail'
import QuestionnairePublic, { QuestionnairePublicViewModel } from './QuestionnairePublic'
import * as action from '@/app/api/actions/mesure-impact/deposerUneReponseAction'

describe('questionnaire public de mesure d’impact', () => {
  beforeEach(() => {
    vi.spyOn(preuveDeTravail, 'preparerUnePreuve').mockResolvedValue('preuve-de-travail')
  })

  it('quand j’ouvre le questionnaire, alors je vois l’accueil aux couleurs du territoire', () => {
    // WHEN
    const { container } = afficherLeQuestionnaire()

    // THEN
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: LOGO_DU_TERRITOIRE })).toHaveAttribute(
      'src',
      '/mesure-impact/logo-sicoval.svg'
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Votre avis sur vos accompagnements au numérique' })
    ).toBeInTheDocument()
    expect(screen.getByText('Le questionnaire dure environ 15 minutes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Commencer le questionnaire' })).toBeInTheDocument()
    expect(container.ownerDocument.title).toBe('Votre avis sur vos accompagnements au numérique – Accueil')
  })

  it('quand la campagne n’est pas ouverte, alors je ne peux pas répondre', () => {
    // WHEN
    afficherLeQuestionnaire({ ouverte: false })

    // THEN
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ce questionnaire n’accepte pas de réponses' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Commencer le questionnaire' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: LOGO_DU_TERRITOIRE })).toBeInTheDocument()
  })

  it('quand je commence, alors la première question de la première partie s’affiche', async () => {
    // GIVEN
    afficherLeQuestionnaire()

    // WHEN
    await commencer()

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Le contexte de vos accompagnements' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Votre avis sur vos accompagnements au numérique' })
    ).not.toBeInTheDocument()
    const question = screen.getByRole('group', { name: /Question 1 sur 8/ })
    expect(question.textContent).toContain('quelles sont les principales raisons')
    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument()
    expect(etapes()).toStrictEqual(['Le contexte (en cours)', 'Le bilan (à venir)', 'À propos de vous (à venir)'])
    const entete = screen.getByRole('banner')
    expect(within(entete).getByRole('img', { name: LOGO_DU_TERRITOIRE })).toBeInTheDocument()
    expect(within(entete).getByText('Votre avis sur vos accompagnements')).toBeInTheDocument()
  })

  it('quand je change de question, alors le titre de la page la nomme', async () => {
    // GIVEN
    const { container } = afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await repondreJusquA('Question 2 sur 8')

    // THEN
    expect(container.ownerDocument.title).toBe(
      'Question 2 sur 8 – Le contexte – Votre avis sur vos accompagnements au numérique'
    )
  })

  it('quand je passe à la suite sans répondre, alors un message d’erreur me le demande', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // THEN
    expect(screen.getByText('Veuillez sélectionner au moins une réponse.')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Question 1 sur 8/ })).toBeInTheDocument()
  })

  it('quand je passe à la suite d’une question à réponse unique sans répondre, alors on me demande une réponse', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 3 sur 8')

    // WHEN
    await suivante()

    // THEN
    expect(screen.getByText('Sélectionnez une réponse.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Entre 1 et 4 séances' })).toBeInTheDocument()
  })

  it('quand je coche « Autre », alors je peux préciser, et la précision disparaît si je décoche', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await userEvent.click(screen.getByRole('checkbox', { name: 'Autre' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Précisez :' }), 'Jouer en ligne')

    // THEN
    const precision = screen.getByRole('textbox', { name: 'Précisez :' })
    expect(precision).toHaveValue('Jouer en ligne')
    expect(precision).toHaveAttribute('maxLength', '200')
    expect(precision).toHaveAccessibleDescription(
      'N’indiquez pas d’information permettant de vous identifier (nom, adresse, téléphone…).'
    )

    // WHEN
    await userEvent.click(screen.getByRole('checkbox', { name: 'Autre' }))

    // THEN
    expect(screen.queryByRole('textbox', { name: 'Précisez :' })).not.toBeInTheDocument()
  })

  it('quand je coche « Aucun », alors les autres équipements sont décochés, et inversement', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 5 sur 8')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tablette' }))

    // WHEN
    await userEvent.click(screen.getByRole('checkbox', { name: 'Aucun' }))

    // THEN
    expect(screen.getByRole('checkbox', { name: 'Tablette' })).not.toBeChecked()
    expect(screen.getByText('Les autres réponses ont été décochées.')).toBeInTheDocument()

    // WHEN
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tablette' }))

    // THEN
    expect(screen.getByRole('checkbox', { name: 'Aucun' })).not.toBeChecked()
    expect(screen.getByText('La réponse « Aucun » a été décochée.')).toBeInTheDocument()
  })

  it('quand je reviens en arrière, alors je retrouve ma réponse précédente', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Travailler ou chercher un travail' }))
    await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Question précédente' }))

    // THEN
    expect(screen.getByRole('checkbox', { name: 'Travailler ou chercher un travail' })).toBeChecked()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

    // THEN
    expect(screen.getByRole('button', { name: 'Commencer le questionnaire' })).toBeInTheDocument()
  })

  it('quand je réponds « Oui » à la Q7, alors je choisis parmi les équipements cochés à la Q5, ou je les écris', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 5 sur 8')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tablette' }))
    await suivante()
    await repondreJusquA('Question 7 sur 8')

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Oui' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Tablette' }))

    // THEN
    const lequel = screen.getByRole('group', { name: 'Lequel/lesquels ?' })
    expect(
      within(lequel)
        .getAllByRole('checkbox')
        .map((caseACocher) => caseACocher.getAttribute('value'))
    ).toStrictEqual(['tablette'])
    expect(within(lequel).getByRole('checkbox', { name: 'Tablette' })).toBeChecked()

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Question précédente' }))
    await userEvent.click(screen.getByRole('button', { name: 'Question précédente' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Aucun' }))
    await suivante()
    await suivante()
    await userEvent.type(screen.getByRole('textbox', { name: 'Lequel/lesquels ?' }), 'Une liseuse')

    // THEN
    expect(screen.getByRole('textbox', { name: 'Lequel/lesquels ?' })).toHaveValue('Une liseuse')
  })

  it('quand je réponds négativement à la Q12, alors on me demande pourquoi et la Q13 n’est plus comptée', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 4 sur 11')

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Pas du tout' }))

    // THEN
    expect(screen.getByRole('group', { name: /Question 4 sur 10/ })).toBeInTheDocument()
    await userEvent.type(screen.getByRole('textbox', { name: 'Pourquoi ? (facultatif)' }), 'Trop rapide')
    expect(screen.getByRole('textbox', { name: 'Pourquoi ? (facultatif)' })).toHaveValue('Trop rapide')
  })

  it('quand j’arrive sur une échelle, alors le sens des extrémités est affiché sous les niveaux 1 et 5', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await repondreJusquA('Question 2 sur 11')

    // THEN
    expect(screen.getByRole('group', { name: /Question 2 sur 11/ }).textContent).toContain(
      'comment vous sentiez-vous avec le numérique, sur une échelle de 1 à 5 ?'
    )
    expect(screen.getByText('Pas du tout à l’aise')).toBeInTheDocument()
    expect(screen.getByText('Très à l’aise')).toBeInTheDocument()
    const niveaux = screen.getAllByRole('radio')
    expect(niveaux.map((niveau) => niveau.getAttribute('value'))).toStrictEqual(['1', '2', '3', '4', '5'])
    expect(screen.getByRole('radio', { name: '1 : Pas du tout à l’aise' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '5 : Très à l’aise' })).toBeInTheDocument()
  })

  it('quand je saisis un code postal, alors seuls les chiffres sont gardés', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')

    // WHEN
    await userEvent.type(screen.getByRole('textbox', { name: /Quel est votre code postal/ }), '31a3205')

    // THEN
    expect(screen.getByRole('textbox', { name: /Quel est votre code postal/ })).toHaveValue('31320')
  })

  it('quand j’envoie sans code postal, alors on me demande de le renseigner', async () => {
    // GIVEN
    const deposer = vi.spyOn(action, 'deposerUneReponseAction')
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    expect(screen.getByText('Veuillez renseigner ce champ.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Quel est votre code postal/ })).toBeInvalid()
    expect(deposer).not.toHaveBeenCalled()
  })

  it('quand j’envoie un code postal incomplet, alors on me rappelle qu’il a 5 chiffres', async () => {
    // GIVEN
    const deposer = vi.spyOn(action, 'deposerUneReponseAction')
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')
    await userEvent.type(screen.getByRole('textbox', { name: /Quel est votre code postal/ }), '3167')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    expect(screen.getByText('Le code postal doit contenir 5 chiffres.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Quel est votre code postal/ })).toBeInvalid()
    expect(deposer).not.toHaveBeenCalled()
  })

  it('quand j’arrive à la dernière étape, alors l’indicateur dit l’état de chaque étape', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await repondreJusquA('Question 1 sur 7')

    // THEN
    expect(etapes()).toStrictEqual(['Le contexte (terminée)', 'Le bilan (terminée)', 'À propos de vous (en cours)'])
    expect(screen.queryByRole('button', { name: /À propos de vous/ })).not.toBeInTheDocument()
    const indicateur = screen.getByRole('list', { name: 'Étapes du questionnaire' })
    expect(within(indicateur).getByText('À propos de vous')).toHaveAttribute('aria-current', 'step')
  })

  it('quand je clique sur une partie terminée, alors je reviens à sa première question', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 1 sur 11')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Le contexte (terminée)' }))

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Le contexte de vos accompagnements' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Question 1 sur 8/ })).toBeInTheDocument()
    expect(etapes()).toStrictEqual(['Le contexte (en cours)', 'Le bilan (à venir)', 'À propos de vous (à venir)'])
  })

  it('quand j’arrive à la dernière étape, alors la preuve anti-abus se prépare, une seule fois', async () => {
    // GIVEN
    afficherLeQuestionnaire()
    await commencer()

    // WHEN
    await repondreJusquA('Question 3 sur 7')

    // THEN
    expect(preuveDeTravail.preparerUnePreuve).toHaveBeenCalledExactlyOnceWith('sicoval')
  })

  it('quand j’envoie mes réponses, alors elles sont déposées avec la preuve anti-abus et je suis remercié', async () => {
    // GIVEN
    const deposer = vi.spyOn(action, 'deposerUneReponseAction').mockResolvedValueOnce(['OK'])
    const { container } = afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')
    await userEvent.type(screen.getByRole('textbox', { name: /Quel est votre code postal/ }), '31320')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    const remerciement = await screen.findByRole('heading', {
      level: 1,
      name: 'Merci, vos réponses ont bien été enregistrées',
    })
    expect(remerciement).toHaveFocus()
    expect(container.ownerDocument.title).toBe(
      'Réponses enregistrées – Votre avis sur vos accompagnements au numérique'
    )
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: LOGO_DU_TERRITOIRE })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sentiment de compétence numérique/ })).not.toBeInTheDocument()
    const { contenu, identifiantPublic, preuve } = deposer.mock.calls[0][0]
    expect(identifiantPublic).toBe('sicoval')
    expect(preuve).toBe('preuve-de-travail')
    expect(Object.keys(contenu)).toHaveLength(26)
    expect(contenu.q26).toStrictEqual({ valeur: '31320' })
  })

  it('quand l’envoi est refusé, alors le message s’affiche et je reste sur la question', async () => {
    // GIVEN
    vi.spyOn(action, 'deposerUneReponseAction').mockResolvedValueOnce(['Ce questionnaire n’accepte plus de réponses.'])
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')
    await userEvent.type(screen.getByRole('textbox', { name: /Quel est votre code postal/ }), '31320')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    expect((await screen.findByRole('alert')).textContent).toBe('Ce questionnaire n’accepte plus de réponses.')
    expect(screen.getByRole('button', { name: 'Envoyer mes réponses' })).toBeEnabled()
  })

  it('quand l’envoi n’aboutit pas, alors je peux réessayer avec une nouvelle preuve, sans perdre mes réponses', async () => {
    // GIVEN
    vi.spyOn(action, 'deposerUneReponseAction').mockRejectedValueOnce(new Error('Réseau indisponible'))
    afficherLeQuestionnaire()
    await commencer()
    await repondreJusquA('Question 7 sur 7')
    await userEvent.type(screen.getByRole('textbox', { name: /Quel est votre code postal/ }), '31320')

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.'
    )
    expect(screen.getByRole('textbox', { name: /Quel est votre code postal/ })).toHaveValue('31320')

    // WHEN
    const deposer = vi.spyOn(action, 'deposerUneReponseAction').mockResolvedValueOnce(['OK'])
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer mes réponses' }))

    // THEN
    const remerciement = await screen.findByRole('heading', {
      level: 1,
      name: 'Merci, vos réponses ont bien été enregistrées',
    })
    expect(remerciement).toBeInTheDocument()
    expect(preuveDeTravail.preparerUnePreuve).toHaveBeenCalledTimes(2)
    expect(deposer).toHaveBeenCalledTimes(2)
  })
})

const LOGO_DU_TERRITOIRE = 'Sicoval – L’Agglo du Sud-Est Toulousain'

function afficherLeQuestionnaire(viewModel: Partial<QuestionnairePublicViewModel> = {}): ReturnType<typeof render> {
  return render(
    <QuestionnairePublic
      viewModel={{
        identifiantPublic: 'sicoval',
        libelleTerritoire: 'Sicoval',
        ouverte: true,
        questionnaireVersion: 'socle-v22',
        ...viewModel,
      }}
    />
  )
}

function etapes(): ReadonlyArray<string> {
  return within(screen.getByRole('list', { name: 'Étapes du questionnaire' }))
    .getAllByRole('listitem')
    .map((etape) => etape.textContent)
}

async function commencer(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Commencer le questionnaire' }))
}

async function suivante(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Question suivante' }))
}

// Répond à chaque question avec sa première option (une ligne de grille à la fois) jusqu'à la question voulue,
// dans la partie en cours ou une suivante
async function repondreJusquA(compteur: string): Promise<void> {
  for (let garde = 0; garde < 30; garde += 1) {
    const contenu = screen.getByRole('main')
    if (contenu.textContent.includes(compteur)) {
      return
    }

    await repondreALaQuestionAffichee(contenu)

    await suivante()
  }
  throw new Error(`Question introuvable : ${compteur}`)
}

async function repondreALaQuestionAffichee(contenu: HTMLElement): Promise<void> {
  const radios = within(contenu).queryAllByRole('radio')
  const groupes = [...new Set(radios.map((radio) => radio.getAttribute('name')))]
  for (const groupe of groupes) {
    await userEvent.click(radios.find((radio) => radio.getAttribute('name') === groupe) as HTMLElement)
  }
  const cases = within(contenu).queryAllByRole('checkbox')
  if (radios.length === 0 && cases.length > 0) {
    await userEvent.click(cases[0])
  }
}
