'use client'

import { ReactElement, ReactNode, SyntheticEvent, useEffect, useRef, useState } from 'react'

import { preparerUnePreuve } from './preuveDeTravail'
import QuestionAffichee from './QuestionAffichee'
import { deposerUneReponseAction } from '@/app/api/actions/mesure-impact/deposerUneReponseAction'
import { Contenu, Questionnaire } from '@/domain/mesure-impact/Questionnaire'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'

// Questionnaire de mesure d'impact rempli en ligne par une personne accompagnée : accueil, une question par
// écran, envoi, remerciement. Les règles (questions posées, options proposées, nettoyage) sont celles du domaine.
export default function QuestionnairePublic({ viewModel }: Props): ReactElement {
  const { identifiantPublic, ouverte, questionnaireVersion } = viewModel
  const questionnaire = questionnaireDeVersion(questionnaireVersion)

  if (!ouverte || questionnaire === undefined) {
    return (
      <Page titre={`Questionnaire fermé – ${TITRE}`}>
        <LogoDuTerritoire className="fr-mb-4w" />
        <h1 className="fr-h2">Ce questionnaire n’accepte pas de réponses</h1>
        <p className="fr-text--lead">
          La période de réponse n’est pas ouverte. Rapprochez-vous de votre médiateur ou médiatrice numérique.
        </p>
      </Page>
    )
  }

  return <Parcours identifiantPublic={identifiantPublic} questionnaire={questionnaire} />
}

function Parcours({ identifiantPublic, questionnaire }: ParcoursProps): ReactElement {
  const [ecran, setEcran] = useState<'accueil' | 'fin' | 'questions'>('accueil')
  const [contenu, setContenu] = useState<Contenu>({})
  const [codeCourant, setCodeCourant] = useState(questionnaire.questions[0].code)
  const [enErreur, setEnErreur] = useState(false)
  const [envoi, setEnvoi] = useState<Readonly<{ enCours: boolean; message?: string }>>({ enCours: false })
  const titreFin = useRef<HTMLHeadingElement>(null)
  const legende = useRef<HTMLElement>(null)
  // Preuve anti-abus en cours de calcul, à usage unique
  const preuve = useRef<null | Promise<string>>(null)

  const posees = questionnaire.questionsPosees(contenu, CANAL)
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

  // Changement d'écran ou de question : le focus va sur l'intitulé, pour les lecteurs d'écran et le clavier
  useEffect(() => {
    if (ecran === 'fin') {
      titreFin.current?.focus()
    } else if (ecran === 'questions') {
      legende.current?.focus()
    }
  }, [ecran, codeCourant])

  // Le calcul anti-abus commence dès la dernière étape, pour être prêt à l'envoi
  useEffect(() => {
    if (ecran === 'questions' && partieCourante === questionnaire.parties.length - 1 && preuve.current === null) {
      const enPreparation = preparerUnePreuve(identifiantPublic)
      // Un échec est traité à l'envoi
      void enPreparation.catch(() => undefined)
      preuve.current = enPreparation
    }
  }, [ecran, partieCourante, identifiantPublic, questionnaire.parties.length])

  function allerA(code: string): void {
    setEnErreur(false)
    setEnvoi({ enCours: false })
    setCodeCourant(code)
  }

  async function suivant(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!questionnaire.estRepondue(question, contenu, CANAL)) {
      setEnErreur(true)
      legende.current?.focus()
      return
    }
    if (!derniere) {
      allerA(posees[position + 1].code)
      return
    }
    await envoyer()
  }

  async function envoyer(): Promise<void> {
    setEnvoi({ enCours: true })
    const enPreparation = preuve.current ?? preparerUnePreuve(identifiantPublic)
    preuve.current = null
    try {
      const [message] = await deposerUneReponseAction({ contenu, identifiantPublic, preuve: await enPreparation })
      if (message === 'OK') {
        // Les réponses ne restent pas dans le navigateur : revenir en arrière ne permet pas de les renvoyer
        setContenu({})
        setEcran('fin')
      } else {
        setEnvoi({ enCours: false, message })
      }
    } catch {
      setEnvoi({ enCours: false, message: ENVOI_ECHOUE })
    }
  }

  function allerALaPartie(code: string): void {
    const premiere = posees.find((posee) => posee.partie === code)
    if (premiere !== undefined) {
      allerA(premiere.code)
    }
  }

  function precedent(): void {
    if (position === 0) {
      setEcran('accueil')
      return
    }
    allerA(posees[position - 1].code)
  }

  if (ecran === 'accueil') {
    return (
      <Page titre={`${TITRE} – Accueil`}>
        <LogoDuTerritoire className="fr-mb-4w" />
        <h1 className="fr-h2">{TITRE}</h1>
        <p className="fr-text--lead">
          Vous avez été accompagné(e) pour utiliser le numérique par un médiateur ou une médiatrice numérique. Ce
          questionnaire permet de comprendre ce que cet accompagnement a changé pour vous.
        </p>
        <div className="fr-callout fr-mb-4w">
          <h2 className="fr-callout__title fr-h6">Avant de commencer</h2>
          <ul className="fr-callout__text fr-text--md" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Le questionnaire dure environ 15 minutes.</li>
            <li>Il est anonyme : nous ne demandons ni votre nom, ni votre adresse e-mail.</li>
            <li>Il n’existe pas de mauvaise réponse. Répondez le plus sincèrement possible.</li>
            <li>Vous pouvez aussi demander une version papier à votre médiateur ou médiatrice.</li>
          </ul>
        </div>
        <button
          className="fr-btn fr-btn--lg"
          onClick={() => {
            setEcran('questions')
          }}
          type="button"
        >
          Commencer le questionnaire
        </button>
      </Page>
    )
  }

  if (ecran === 'fin') {
    return (
      <Page titre={`Réponses enregistrées – ${TITRE}`}>
        <span aria-hidden="true" className="fr-icon-checkbox-circle-fill fr-icon--lg fr-text-default--success" />
        <h1 className="fr-h2 fr-mt-2w" ref={titreFin} tabIndex={-1}>
          Merci, vos réponses ont bien été enregistrées
        </h1>
        <p className="fr-text--lead">
          Vos réponses sont anonymes. Elles aideront votre territoire à mieux comprendre ce que les accompagnements au
          numérique changent pour les personnes accompagnées, et à améliorer ces accompagnements.
        </p>
        <LogoDuTerritoire />
      </Page>
    )
  }

  return (
    <Page avecEntete titre={`Question ${numero} sur ${dansLaPartie.length} – ${partie.libelle} – ${TITRE}`}>
      <ol aria-label="Étapes du questionnaire" className="fr-tags-group fr-mb-2w">
        {questionnaire.parties.map((candidate, index) => (
          <li key={candidate.code}>
            {index < partieCourante ? (
              <button
                className={ETAPES.terminee.classes}
                onClick={() => {
                  allerALaPartie(candidate.code)
                }}
                type="button"
              >
                {candidate.libelle}
                <span className="fr-sr-only"> ({ETAPES.terminee.etat})</span>
              </button>
            ) : (
              <p
                aria-current={index === partieCourante ? 'step' : undefined}
                className={ETAPES[etatEtape(index, partieCourante)].classes}
              >
                {candidate.libelle}
                <span className="fr-sr-only"> ({ETAPES[etatEtape(index, partieCourante)].etat})</span>
              </p>
            )}
          </li>
        ))}
      </ol>
      <h1 className="fr-h3 fr-mb-2w">{partie.titre}</h1>
      <p>{partie.intro}</p>
      <form className="fr-mt-4w" noValidate onSubmit={suivant}>
        <QuestionAffichee
          canal={CANAL}
          contenu={contenu}
          enErreur={enErreur}
          key={question.code}
          legendeRef={(element) => {
            legende.current = element
          }}
          numero={numero}
          onChange={(modifie) => {
            setEnErreur(false)
            setContenu(questionnaire.nettoyer(modifie, CANAL))
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
        <ul className="fr-btns-group fr-btns-group--inline-md fr-btns-group--lg">
          <li>
            <button className="fr-btn fr-btn--tertiary" onClick={precedent} type="button">
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
    </Page>
  )
}

// Titre de l'onglet propre à chaque écran. Comme dans les maquettes, seules les questions ont un en-tête :
// les autres écrans portent le logo du territoire dans leur contenu.
function Page({ avecEntete = false, children, titre }: PageProps): ReactElement {
  return (
    <>
      <title>{titre}</title>
      {avecEntete ? <Entete /> : null}
      <main className="fr-container fr-py-6w" id="contenu">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">{children}</div>
        </div>
      </main>
      <PiedDePageQuestionnaire />
    </>
  )
}

function Entete(): ReactElement {
  // Habillage du territoire, sans bloc Marianne (écart au DSFR assumé et validé pour la mesure d'impact) :
  // le logo occupe la place de l'opérateur
  return (
    <header className="fr-header" role="banner">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand">
              <div className="fr-header__brand-top">
                <div className="fr-header__operator">
                  <LogoDuTerritoire />
                </div>
              </div>
              <div className="fr-header__service">
                <p className="fr-header__service-tagline">Votre avis sur vos accompagnements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Logo du territoire pilote, en dur comme dans les maquettes : il viendra de la campagne quand il y en aura d'autres
function LogoDuTerritoire({ className }: Readonly<{ className?: string }>): ReactElement {
  return (
    <img
      alt="Sicoval – L’Agglo du Sud-Est Toulousain"
      className={className}
      height={64}
      src="/mesure-impact/logo-sicoval.svg"
      width={155}
    />
  )
}

function PiedDePageQuestionnaire(): ReactElement {
  return (
    <footer className="fr-footer" id="footer" role="contentinfo">
      <div className="fr-container">
        <div className="fr-footer__bottom">
          <ul className="fr-footer__bottom-list">
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="/accessibilite">
                Accessibilité : non conforme
              </a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="/mentions-legales">
                Mentions légales
              </a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="/politique-confidentialite">
                Données personnelles
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

const CANAL = 'en-ligne'

const TITRE = 'Votre avis sur vos accompagnements au numérique'

const ENVOI_ECHOUE = 'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.'

// Indicateur d'étape : l'état est dit en texte, les icônes sont décoratives. Les parties terminées sont des
// tags cliquables (couleur de tag DSFR) ; les autres ne le sont pas, leurs couleurs viennent des utilitaires DSFR.
const ETAPES: Readonly<Record<EtatEtape, Readonly<{ classes: string; etat: string }>>> = {
  aVenir: { classes: 'fr-tag fr-text-mention--grey', etat: 'à venir' },
  enCours: {
    classes:
      'fr-tag fr-tag--icon-left fr-icon-arrow-right-line fr-background-action-low--blue-france fr-text-action-high--blue-france',
    etat: 'en cours',
  },
  terminee: {
    classes: 'fr-tag fr-tag--icon-left fr-icon-check-line fr-tag--green-emeraude',
    etat: 'terminée',
  },
}

export type QuestionnairePublicViewModel = Readonly<{
  identifiantPublic: string
  libelleTerritoire: string
  ouverte: boolean
  questionnaireVersion: string
}>

function etatEtape(index: number, partieCourante: number): EtatEtape {
  if (index < partieCourante) {
    return 'terminee'
  }
  return index === partieCourante ? 'enCours' : 'aVenir'
}

function libelleBoutonSuivant(derniere: boolean, enCours: boolean): string {
  if (!derniere) {
    return 'Question suivante'
  }
  return enCours ? 'Envoi en cours…' : 'Envoyer mes réponses'
}

type EtatEtape = 'aVenir' | 'enCours' | 'terminee'

type Props = Readonly<{
  viewModel: QuestionnairePublicViewModel
}>

type PageProps = Readonly<{
  avecEntete?: boolean
  children: ReactNode
  titre: string
}>

type ParcoursProps = Readonly<{
  identifiantPublic: string
  questionnaire: Questionnaire
}>
