'use client'

import Link from 'next/link'
import { ReactElement, SyntheticEvent, useEffect, useId, useRef, useState } from 'react'

import IndicateurDEtapes from '../IndicateurDEtapes'
import QuestionAffichee from '../QuestionnairePublic/QuestionAffichee'
import { saisirUneReponseAction } from '@/app/api/actions/mesure-impact/saisirUneReponseAction'
import Modal from '@/components/shared/Modal/Modal'
import { Contenu, Questionnaire } from '@/domain/mesure-impact/Questionnaire'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'

// Saisie d'un questionnaire recueilli sur papier ou par téléphone (maquettes « Saisie »). Les questions
// s'affichent comme en ligne, une par écran ; aucune réponse n'est obligatoire. Sur papier, toutes les
// questions et options sont proposées ; par téléphone, les règles du questionnaire restent actives.
export default function SaisieManuelle({ viewModel }: Props): ReactElement {
  const { identifiantPublic, lienCampagne, questionnaireVersion } = viewModel
  const questionnaire = questionnaireDeVersion(questionnaireVersion)
  const [canal, setCanal] = useState<CanalDeSaisie | null>(null)
  const [enregistree, setEnregistree] = useState(false)
  const choixId = useId()

  if (questionnaire === undefined) {
    return <p>Ce questionnaire ne peut pas être saisi.</p>
  }

  if (enregistree) {
    return (
      <>
        <title>Questionnaire enregistré – Saisie manuelle</title>
        <div className="fr-alert fr-alert--success fr-mb-4w">
          <h1 className="fr-alert__title">Questionnaire enregistré</h1>
          <p>Les réponses sont comptées dans les résultats de la campagne.</p>
        </div>
        <ul className="fr-btns-group fr-btns-group--inline-md">
          <li>
            <button
              className="fr-btn"
              onClick={() => {
                setEnregistree(false)
                setCanal(null)
              }}
              type="button"
            >
              Saisir un autre questionnaire
            </button>
          </li>
          <li>
            <Link className="fr-btn fr-btn--secondary" href={lienCampagne}>
              Retour à la campagne
            </Link>
          </li>
        </ul>
      </>
    )
  }

  if (canal === null) {
    return (
      <>
        <title>Saisie manuelle – Mesure d’impact</title>
        <h1 className="fr-h2">Saisir un questionnaire</h1>
        <form
          onSubmit={(event: SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault()
            const choisi = new FormData(event.currentTarget).get('canal')
            if (choisi === 'papier' || choisi === 'telephone') {
              setCanal(choisi)
            }
          }}
        >
          <fieldset aria-labelledby={choixId} className="fr-fieldset">
            <legend className="fr-fieldset__legend" id={choixId}>
              Comment les réponses ont-elles été recueillies ?
            </legend>
            {CANAUX.map(({ aide, code, libelle }) => (
              <div className="fr-fieldset__element" key={code}>
                <div className="fr-radio-group">
                  <input
                    defaultChecked={code === 'papier'}
                    id={`canal-${code}`}
                    name="canal"
                    type="radio"
                    value={code}
                  />
                  <label className="fr-label" htmlFor={`canal-${code}`}>
                    {libelle}
                    <span className="fr-hint-text">{aide}</span>
                  </label>
                </div>
              </div>
            ))}
          </fieldset>
          <ul className="fr-btns-group fr-btns-group--inline-md">
            <li>
              <Link className="fr-btn fr-btn--secondary" href={lienCampagne}>
                Retour à la campagne
              </Link>
            </li>
            <li>
              <button className="fr-btn" type="submit">
                Commencer la saisie
              </button>
            </li>
          </ul>
        </form>
      </>
    )
  }

  return (
    <Saisie
      canal={canal}
      identifiantPublic={identifiantPublic}
      lienCampagne={lienCampagne}
      onEnregistree={() => {
        setEnregistree(true)
      }}
      onRetour={() => {
        setCanal(null)
      }}
      questionnaire={questionnaire}
    />
  )
}

function Saisie({
  canal,
  identifiantPublic,
  lienCampagne,
  onEnregistree,
  onRetour,
  questionnaire,
}: SaisieProps): ReactElement {
  const [contenu, setContenu] = useState<Contenu>({})
  const [codeCourant, setCodeCourant] = useState(questionnaire.questions[0].code)
  const [envoi, setEnvoi] = useState<Readonly<{ enCours: boolean; message?: string }>>({ enCours: false })
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)
  const legende = useRef<HTMLElement>(null)
  const modaleId = useId()
  const titreModaleId = useId()

  const posees = questionnaire.questionsPosees(contenu, canal)
  // Garde-fou : si la question courante n'est plus posée, on repart de la première
  const position = Math.max(
    0,
    posees.findIndex((posee) => posee.code === codeCourant)
  )
  const question = posees[position]
  const dansLaPartie = posees.filter((posee) => posee.partie === question.partie)
  const numero = dansLaPartie.indexOf(question) + 1
  const partieCourante = questionnaire.parties.findIndex((partie) => partie.code === question.partie)
  const partie = questionnaire.parties[partieCourante]
  const derniere = position === posees.length - 1
  const bandeau = BANDEAUX[canal]

  // Changement de question : le focus va sur l'intitulé, pour les lecteurs d'écran et le clavier
  useEffect(() => {
    legende.current?.focus()
  }, [codeCourant])

  function allerA(code: string): void {
    setEnvoi({ enCours: false })
    setCodeCourant(code)
  }

  function allerALaPartie(code: string): void {
    const premiere = posees.find((posee) => posee.partie === code)
    if (premiere !== undefined) {
      allerA(premiere.code)
    }
  }

  async function suivant(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!derniere) {
      allerA(posees[position + 1].code)
      return
    }
    setEnvoi({ enCours: true })
    try {
      const [message] = await saisirUneReponseAction({ canal, contenu, identifiantPublic })
      if (message === 'OK') {
        onEnregistree()
      } else {
        setEnvoi({ enCours: false, message })
      }
    } catch {
      setEnvoi({ enCours: false, message: ENREGISTREMENT_ECHOUE })
    }
  }

  return (
    <>
      <title>{`Question ${numero} sur ${dansLaPartie.length} – ${partie.libelle} – ${bandeau.titre}`}</title>
      <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline">
        <li>
          {Object.keys(contenu).length === 0 ? (
            <Link className="fr-btn fr-btn--secondary" href={lienCampagne}>
              Quitter la saisie
            </Link>
          ) : (
            <button
              aria-controls={modaleId}
              className="fr-btn fr-btn--secondary"
              onClick={() => {
                setConfirmationOuverte(true)
              }}
              type="button"
            >
              Quitter la saisie
            </button>
          )}
        </li>
      </ul>
      <div className="fr-alert fr-alert--info fr-alert--sm fr-mb-4w">
        <p>
          <strong>{bandeau.titre}</strong> {bandeau.texte}
        </p>
      </div>
      <IndicateurDEtapes
        onAllerALaPartie={allerALaPartie}
        partieCourante={partieCourante}
        parties={questionnaire.parties}
      />
      <h1 className="fr-h3 fr-mb-2w">{partie.titre}</h1>
      <p>{partie.intro}</p>
      <form className="fr-mt-4w" noValidate onSubmit={suivant}>
        <QuestionAffichee
          canal={canal}
          contenu={contenu}
          enErreur={false}
          key={question.code}
          legendeRef={(element) => {
            legende.current = element
          }}
          numero={numero}
          onChange={(modifie) => {
            setContenu(questionnaire.nettoyer(modifie, canal))
          }}
          question={question}
          questionnaire={questionnaire}
          total={dansLaPartie.length}
        />
        {envoi.message === undefined ? null : (
          <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-3w" role="alert">
            <p>{envoi.message}</p>
          </div>
        )}
        <ul className="fr-btns-group fr-btns-group--inline-md">
          <li>
            <button
              className="fr-btn fr-btn--tertiary"
              onClick={() => {
                if (position === 0) {
                  onRetour()
                  return
                }
                allerA(posees[position - 1].code)
              }}
              type="button"
            >
              {position === 0 ? 'Retour' : 'Question précédente'}
            </button>
          </li>
          <li>
            <button aria-busy={envoi.enCours} className="fr-btn" disabled={envoi.enCours} type="submit">
              {libelleBoutonSuivant(derniere, envoi.enCours)}
            </button>
          </li>
        </ul>
      </form>
      <Modal
        close={() => {
          setConfirmationOuverte(false)
        }}
        id={modaleId}
        isOpen={confirmationOuverte}
        labelId={titreModaleId}
      >
        <div className="fr-modal__content">
          <h1 className="fr-modal__title" id={titreModaleId}>
            Quitter la saisie ?
          </h1>
          <p>Les réponses déjà saisies pour ce questionnaire ne seront pas enregistrées.</p>
        </div>
        <div className="fr-modal__footer">
          <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-md">
            <li>
              <Link className="fr-btn fr-btn--secondary" href={lienCampagne}>
                Quitter sans enregistrer
              </Link>
            </li>
            <li>
              <button
                aria-controls={modaleId}
                className="fr-btn"
                onClick={() => {
                  setConfirmationOuverte(false)
                }}
                type="button"
              >
                Continuer la saisie
              </button>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  )
}

const ENREGISTREMENT_ECHOUE = 'Les réponses n’ont pas pu être enregistrées. Veuillez réessayer.'

const CANAUX: ReadonlyArray<Readonly<{ aide: string; code: CanalDeSaisie; libelle: string }>> = [
  {
    aide: 'Toutes les questions s’affichent, comme sur le papier.',
    code: 'papier',
    libelle: 'Questionnaire papier',
  },
  {
    aide: 'Les questions suivantes s’adaptent aux réponses de la personne.',
    code: 'telephone',
    libelle: 'Passation par téléphone',
  },
]

const BANDEAUX: Readonly<Record<CanalDeSaisie, Readonly<{ texte: string; titre: string }>>> = {
  papier: {
    texte:
      'Reportez les réponses telles qu’elles figurent sur le papier. Toutes les questions s’affichent, comme sur le papier, et une question sans réponse peut rester vide.',
    titre: 'Saisie d’un questionnaire papier',
  },
  telephone: {
    texte:
      'Lisez chaque question à la personne et saisissez ses réponses. Les questions suivantes s’adaptent à ses réponses. Une question sans réponse peut rester vide.',
    titre: 'Passation par téléphone',
  },
}

type SaisieManuelleViewModel = Readonly<{
  identifiantPublic: string
  lienCampagne: string
  questionnaireVersion: string
}>

function libelleBoutonSuivant(derniere: boolean, enCours: boolean): string {
  if (!derniere) {
    return 'Question suivante'
  }
  return enCours ? 'Enregistrement en cours…' : 'Enregistrer le questionnaire'
}

type CanalDeSaisie = 'papier' | 'telephone'

type Props = Readonly<{
  viewModel: SaisieManuelleViewModel
}>

type SaisieProps = Readonly<{
  canal: CanalDeSaisie
  identifiantPublic: string
  lienCampagne: string
  onEnregistree(): void
  onRetour(): void
  questionnaire: Questionnaire
}>
