'use client'

import { ReactElement, RefCallback, useState } from 'react'

import styles from './Echelle.module.css'
import {
  Canal,
  Contenu,
  LONGUEUR_MAXIMALE,
  NIVEAUX_ECHELLE,
  Option,
  Question,
  QuestionChoixMultiple,
  QuestionChoixUnique,
  QuestionEchelle,
  QuestionGrille,
  Questionnaire,
  ReponseQuestion,
} from '@/domain/mesure-impact/Questionnaire'

// Une question du questionnaire, avec ses précisions (« Précisez », « Pourquoi ? », « Lequel/lesquels ? »).
// Chaque modification renvoie le contenu complet : le parent le remet en cohérence avec les règles du questionnaire.
export default function QuestionAffichee({
  canal,
  contenu,
  enErreur,
  legendeRef,
  numero,
  onChange,
  question,
  questionnaire,
  total,
}: Props): ReactElement {
  const reponse = contenu[question.code]

  function modifier(modification: Partial<ReponseQuestion>): void {
    onChange({ ...contenu, [question.code]: { valeur: '', ...reponse, ...modification } })
  }

  const entete = (
    <>
      <span className="fr-hint-text fr-mb-1w">
        Question {numero} sur {total}
      </span>
      <span className="fr-h6 fr-mb-0">{question.titre}</span>
      {question.aide === undefined ? null : <span className="fr-hint-text">{question.aide}</span>}
    </>
  )

  if (question.type === 'code-postal') {
    return (
      <div className={`fr-input-group${enErreur ? ' fr-input-group--error' : ''}`}>
        <label className="fr-label" htmlFor={`${question.code}-champ`} ref={legendeRef} tabIndex={-1}>
          {entete}
        </label>
        <input
          aria-describedby={`${question.code}-messages`}
          aria-invalid={enErreur}
          autoComplete="postal-code"
          className={`fr-input${enErreur ? ' fr-input--error' : ''}`}
          id={`${question.code}-champ`}
          inputMode="numeric"
          maxLength={5}
          onChange={(event) => {
            modifier({ valeur: event.target.value.replace(/\D/g, '').slice(0, 5) })
          }}
          type="text"
          value={typeof reponse?.valeur === 'string' ? reponse.valeur : ''}
        />
        <Messages code={question.code} enErreur={enErreur} message={messageErreur(question, reponse)} />
      </div>
    )
  }

  return (
    <>
      <fieldset
        aria-labelledby={`${question.code}-legende ${question.code}-messages`}
        className={`fr-fieldset${enErreur ? ' fr-fieldset--error' : ''}`}
        id={question.code}
      >
        <legend className="fr-fieldset__legend" id={`${question.code}-legende`} ref={legendeRef} tabIndex={-1}>
          {entete}
        </legend>
        {question.type === 'choix-unique' ? (
          <ChoixUnique
            modifier={modifier}
            options={questionnaire.optionsProposees(question, contenu, canal)}
            question={question}
            reponse={reponse}
          />
        ) : null}
        {question.type === 'choix-multiple' ? (
          <ChoixMultiple
            modifier={modifier}
            options={questionnaire.optionsProposees(question, contenu, canal)}
            question={question}
            reponse={reponse}
          />
        ) : null}
        {question.type === 'echelle' ? <Echelle modifier={modifier} question={question} reponse={reponse} /> : null}
        {question.type === 'grille' ? (
          <Grille
            lignes={questionnaire.lignesProposees(question, contenu, canal)}
            modifier={modifier}
            question={question}
            reponse={reponse}
          />
        ) : null}
        <Messages code={question.code} enErreur={enErreur} message={messageErreur(question, reponse)} />
      </fieldset>
      {question.type === 'choix-unique' ? (
        <Complements
          equipements={questionnaire.optionsLequel(question, contenu, canal)}
          modifier={modifier}
          question={question}
          reponse={reponse}
        />
      ) : null}
    </>
  )
}

function Echelle({ modifier, question, reponse }: EchelleProps): ReactElement {
  const extremites: Readonly<Record<string, string>> = { 1: question.poles.minimum, 5: question.poles.maximum }
  return (
    <div className="fr-fieldset__element">
      <div className={styles.niveaux}>
        {NIVEAUX_ECHELLE.map((niveau) => (
          <div className="fr-radio-group" key={niveau}>
            <input
              checked={reponse?.valeur === niveau}
              id={`${question.code}-${niveau}`}
              name={question.code}
              onChange={() => {
                modifier({ valeur: niveau })
              }}
              type="radio"
              value={niveau}
            />
            <label className="fr-label" htmlFor={`${question.code}-${niveau}`}>
              {niveau}
              {niveau in extremites ? <span className="fr-sr-only"> : {extremites[niveau]}</span> : null}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function Grille({ lignes, modifier, question, reponse }: GrilleProps): ReactElement {
  const valeurs = valeursDeGrille(reponse)
  return (
    <>
      {lignes.map((ligne) => (
        <div className="fr-fieldset__element" key={ligne.code}>
          <fieldset aria-labelledby={`${question.code}-${ligne.code}-legende`} className="fr-fieldset">
            <legend
              className="fr-fieldset__legend fr-fieldset__legend--regular"
              id={`${question.code}-${ligne.code}-legende`}
            >
              {ligne.libelle}
            </legend>
            {question.options.map((option) => (
              <div className="fr-fieldset__element fr-fieldset__element--inline" key={option.code}>
                <div className="fr-radio-group">
                  <input
                    checked={valeurs[ligne.code] === option.code}
                    id={`${question.code}-${ligne.code}-${option.code}`}
                    name={`${question.code}-${ligne.code}`}
                    onChange={() => {
                      modifier({ valeur: { ...valeurs, [ligne.code]: option.code } })
                    }}
                    type="radio"
                    value={option.code}
                  />
                  <label className="fr-label" htmlFor={`${question.code}-${ligne.code}-${option.code}`}>
                    {option.libelle}
                  </label>
                </div>
              </div>
            ))}
          </fieldset>
        </div>
      ))}
    </>
  )
}

function ChoixUnique({ modifier, options, question, reponse }: ChoixProps<QuestionChoixUnique>): ReactElement {
  return (
    <>
      {options.map((option) => (
        <div className="fr-fieldset__element" key={option.code}>
          <div className="fr-radio-group">
            <input
              checked={reponse?.valeur === option.code}
              id={`${question.code}-${option.code}`}
              name={question.code}
              onChange={() => {
                modifier({ valeur: option.code })
              }}
              type="radio"
              value={option.code}
            />
            <label className="fr-label" htmlFor={`${question.code}-${option.code}`}>
              {option.libelle}
            </label>
          </div>
          {option.code === question.optionAutre && reponse?.valeur === option.code ? (
            <Precisez code={question.code} modifier={modifier} reponse={reponse} />
          ) : null}
        </div>
      ))}
    </>
  )
}

function ChoixMultiple({ modifier, options, question, reponse }: ChoixProps<QuestionChoixMultiple>): ReactElement {
  const cochees = Array.isArray(reponse?.valeur) ? (reponse.valeur as ReadonlyArray<string>) : []
  // Annonce des cases décochées automatiquement, pour qu'elles ne surprennent pas
  const [annonce, setAnnonce] = useState('')

  function basculer(code: string, coche: boolean): void {
    setAnnonce('')
    if (!coche) {
      modifier({ valeur: cochees.filter((cochee) => cochee !== code) })
      return
    }
    // Réponse exclusive (« Aucun », « Rien n’a changé ») : elle décoche les autres, et inversement
    const exclusive = options.find((option) => option.code === question.optionExclusive)
    if (code === exclusive?.code) {
      setAnnonce(cochees.length > 0 ? 'Les autres réponses ont été décochées.' : '')
      modifier({ valeur: [code] })
      return
    }
    if (exclusive !== undefined && cochees.includes(exclusive.code)) {
      setAnnonce(`La réponse « ${exclusive.libelle} » a été décochée.`)
    }
    modifier({ valeur: [...cochees.filter((cochee) => cochee !== exclusive?.code), code] })
  }

  return (
    <>
      {options.map((option) => (
        <div className="fr-fieldset__element" key={option.code}>
          <div className="fr-checkbox-group">
            <input
              checked={cochees.includes(option.code)}
              id={`${question.code}-${option.code}`}
              name={question.code}
              onChange={(event) => {
                basculer(option.code, event.target.checked)
              }}
              type="checkbox"
              value={option.code}
            />
            <label className="fr-label" htmlFor={`${question.code}-${option.code}`}>
              {option.libelle}
            </label>
          </div>
          {option.code === question.optionAutre && cochees.includes(option.code) ? (
            <Precisez code={question.code} modifier={modifier} reponse={reponse} />
          ) : null}
        </div>
      ))}
      <p aria-live="polite" className="fr-sr-only">
        {annonce}
      </p>
    </>
  )
}

function Precisez({ code, modifier, reponse }: PrecisezProps): ReactElement {
  return (
    <div className="fr-input-group fr-mt-1w">
      <label className="fr-label" htmlFor={`${code}-autre-precision`}>
        Précisez :
      </label>
      <p className="fr-hint-text fr-mb-1w" id={`${code}-autre-aide`}>
        N’indiquez pas d’information permettant de vous identifier (nom, adresse, téléphone…).
      </p>
      <input
        aria-describedby={`${code}-autre-aide`}
        className="fr-input"
        id={`${code}-autre-precision`}
        maxLength={LONGUEUR_MAXIMALE.autre}
        onChange={(event) => {
          modifier({ autre: event.target.value })
        }}
        type="text"
        value={reponse?.autre ?? ''}
      />
    </div>
  )
}

function Complements({ equipements, modifier, question, reponse }: ComplementsProps): null | ReactElement {
  const valeur = reponse?.valeur
  if (typeof valeur !== 'string') {
    return null
  }

  if (question.optionsPourquoi?.includes(valeur) === true) {
    return (
      <div className="fr-input-group">
        <label className="fr-label" htmlFor={`${question.code}-pourquoi`}>
          Pourquoi ? (facultatif)
        </label>
        <textarea
          className="fr-input"
          id={`${question.code}-pourquoi`}
          maxLength={LONGUEUR_MAXIMALE.texte}
          onChange={(event) => {
            modifier({ pourquoi: event.target.value })
          }}
          rows={3}
          value={reponse?.pourquoi ?? ''}
        />
      </div>
    )
  }

  if (question.lequel === undefined || valeur !== question.lequel.siOption) {
    return null
  }

  if (equipements.length === 0) {
    return (
      <div className="fr-input-group">
        <label className="fr-label" htmlFor={`${question.code}-lequel`}>
          Lequel/lesquels ?
        </label>
        <input
          className="fr-input"
          id={`${question.code}-lequel`}
          maxLength={LONGUEUR_MAXIMALE.texte}
          onChange={(event) => {
            modifier({ lequelTexte: event.target.value })
          }}
          type="text"
          value={reponse?.lequelTexte ?? ''}
        />
      </div>
    )
  }

  const choisis = reponse?.lequel ?? []
  return (
    <fieldset aria-labelledby={`${question.code}-lequel-legende`} className="fr-fieldset">
      <legend className="fr-fieldset__legend fr-fieldset__legend--regular" id={`${question.code}-lequel-legende`}>
        Lequel/lesquels ?
      </legend>
      {equipements.map((equipement) => (
        <div className="fr-fieldset__element" key={equipement.code}>
          <div className="fr-checkbox-group">
            <input
              checked={choisis.includes(equipement.code)}
              id={`${question.code}-lequel-${equipement.code}`}
              name={`${question.code}-lequel`}
              onChange={(event) => {
                modifier({
                  lequel: event.target.checked
                    ? [...choisis, equipement.code]
                    : choisis.filter((choisi) => choisi !== equipement.code),
                })
              }}
              type="checkbox"
              value={equipement.code}
            />
            <label className="fr-label" htmlFor={`${question.code}-lequel-${equipement.code}`}>
              {equipement.libelle}
            </label>
          </div>
        </div>
      ))}
    </fieldset>
  )
}

function Messages({ code, enErreur, message }: MessagesProps): ReactElement {
  return (
    <div aria-live="polite" className="fr-messages-group" id={`${code}-messages`}>
      {enErreur ? <p className="fr-message fr-message--error">{message}</p> : null}
    </div>
  )
}

function messageErreur(question: Question, reponse: ReponseQuestion | undefined): string {
  switch (question.type) {
    case 'code-postal':
      return reponse?.valeur === undefined || reponse.valeur === ''
        ? 'Veuillez renseigner ce champ.'
        : 'Le code postal doit contenir 5 chiffres.'
    case 'grille':
      return 'Veuillez répondre pour chaque équipement.'
    default:
      return 'Veuillez sélectionner au moins une réponse.'
  }
}

function valeursDeGrille(reponse: ReponseQuestion | undefined): Readonly<Record<string, string>> {
  const valeur = reponse?.valeur
  return typeof valeur === 'object' && !Array.isArray(valeur) ? (valeur as Readonly<Record<string, string>>) : {}
}

type Props = Readonly<{
  canal: Canal
  contenu: Contenu
  enErreur: boolean
  legendeRef: RefCallback<HTMLElement>
  numero: number
  onChange(contenu: Contenu): void
  question: Question
  questionnaire: Questionnaire
  total: number
}>

type Modifier = (modification: Partial<ReponseQuestion>) => void

type ChoixProps<Q> = Readonly<{
  modifier: Modifier
  options: ReadonlyArray<Option>
  question: Q
  reponse: ReponseQuestion | undefined
}>

type EchelleProps = Readonly<{
  modifier: Modifier
  question: QuestionEchelle
  reponse: ReponseQuestion | undefined
}>

type GrilleProps = Readonly<{
  lignes: ReadonlyArray<Option>
  modifier: Modifier
  question: QuestionGrille
  reponse: ReponseQuestion | undefined
}>

type PrecisezProps = Readonly<{
  code: string
  modifier: Modifier
  reponse: ReponseQuestion | undefined
}>

type ComplementsProps = Readonly<{
  equipements: ReadonlyArray<Option>
  modifier: Modifier
  question: QuestionChoixUnique
  reponse: ReponseQuestion | undefined
}>

type MessagesProps = Readonly<{
  code: string
  enErreur: boolean
  message: string
}>
