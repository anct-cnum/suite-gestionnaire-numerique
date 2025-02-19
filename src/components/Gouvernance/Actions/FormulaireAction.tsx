/* eslint-disable @typescript-eslint/unbound-method */
'use client'

import { FormEvent, ReactElement, useId, useState } from 'react'

import styles from './Action.module.css'
import { useRichTextEditor } from '../../shared/RichTextEditor/hooks/useRichTextEditor'
import EditeurDeTexte from '../../shared/RichTextEditor/TextEditor'
import Tag from '../../shared/Tag/Tag'
import TextInput from '../../shared/TextInput/TextInput'

export function FormulaireAction({ date, validerFormulaire, isDisabled }: Props): ReactElement {
  const nomDeLActionId = useId()
  const contexteId = useId()
  const descriptionId = useId()
  const [temporalite, setTemporalite] = useState('annuelle')
  const currentYear = date.getFullYear().toString()
  const years = Array.from({ length: 6 }, (_, index) => 2025 + index)
  const {
    contenu: contexteContenu,
    gererLeChangementDeContenu: gererChangementContexte,
  } = useRichTextEditor()

  const {
    contenu: descriptionContenu,
    gererLeChangementDeContenu: gererChangementDescription,
  } = useRichTextEditor()

  return (
    <div className="fr-container fr-mt-5w">
      <form
        aria-label="Ajouter une action à la feuille de route"
        onSubmit={async (event) => {
          event.preventDefault()
          await validerFormulaire(
            event,
            contexteContenu,
            descriptionContenu
          )
        }}
      >
        <a
          className="fr-tag fr-mb-2w"
          href="/feuilles-de-route/69"
        >
          Feuille de route 69
        </a>
        <h1
          className="color-blue-france fr-mb-2w fr-h1"
        >
          Ajouter une action à la feuille de route
        </h1>
        <p className="fr-badge fr-badge--md fr-mb-4w">
          En construction
        </p>
        <div
          className={styles['form-container']}
        >
          <div
            className="grey-border border-radius fr-mb-2w fr-p-4w"
            style={{ backgroundColor: 'white' }}
          >

            <div
              className={styles['align-items']}
              id="besoinsAction"
            >
              <p className="fr-h6 fr-text--bold color-blue-france fr-mb-0">
                Besoins liés à l‘action
                {' '}
                <span className="color-red">
                  *
                </span>
              </p>
              <button
                className="fr-btn fr-btn--secondary"
                type="button"
              >
                Modifier
              </button>
            </div>
            <p className="color-grey">
              Indiquez à quel besoins se rapporte l’action pour laquelle vous demandez une subvention.
              Si vos besoins ont changé depuis leur première expression dans le formulaire de janvier 2024
              vous pouvez tout à fait sélectionner une autre catégorie de besoin.
            </p>
            <hr />
            <p className="fr-tag">
              Établir un diagnostic territorial
            </p>
          </div>
          <div
            className="grey-border border-radius fr-mb-2w fr-p-4w"
            style={{ backgroundColor: 'white' }}
          >
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
              Informations sur l‘action
            </p>
            <hr />
            <TextInput
              id={nomDeLActionId}
              name="nom"
              required={true}
            >
              Nom de l‘action
              {' '}
              <span className="color-red">
                *
              </span>
            </TextInput>
            <label
              className="fr-label"
              htmlFor={contexteId}
            >
              Contexte de l‘action
              {' '}
              <span className="color-red">
                *
              </span>
            </label>
            <p className="color-grey fr-mb-1w">
              Préciser la nature de l‘action, ses objectifs, ses bénéficiaires, son impact et indicateurs associés.
            </p>
            <EditeurDeTexte
              contenu={contexteContenu}
              height={150}
              onChange={gererChangementContexte}
            />
            <label
              className="fr-label fr-mt-3w"
              htmlFor={descriptionId}
            >
              Description de l‘action
              {' '}
              <span className="color-red">
                *
              </span>
            </label>
            <p className="color-grey fr-mb-1w">
              Préciser la nature de l‘action, ses objectifs, ses bénéficiaires, son impact et indicateurs associés.
            </p>
            <EditeurDeTexte
              contenu={descriptionContenu}
              height={350}
              onChange={gererChangementDescription}
            />

          </div>
          <div
            className="grey-border border-radius fr-mb-2w fr-p-4w"
            style={{ backgroundColor: 'white' }}
          >
            <div
              className={styles['align-items']}
              id="porteurAction"
            >
              <p className="fr-h6 fr-text--bold color-blue-france fr-mb-0">
                Porteur de l‘action
              </p>
              <button
                className="fr-btn fr-btn--secondary"
                type="button"
              >
                Modifier
              </button>
            </div>
            <p>
              Sélectionnez le porteur de l‘action
            </p>
            <hr />
            <Tag>
              CC des Monts du Lyonnais
            </Tag>
          </div>
          <div
            className="grey-border border-radius fr-mb-2w fr-p-4w"
            id="temporaliteAction"
            style={{ backgroundColor: 'white' }}
          >
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
              Temporalité de l‘action
            </p>
            <p className="color-grey">
              Veuillez indiquer si cette action est annuelle ou pluriannuelle
            </p>
            <hr />
            <div
              className={`fr-radio-group ${styles['align-items']}`}
              style={{ maxWidth: '100%' }}
            >
              <div style={{ width: '49%' }}>
                <input
                  checked={temporalite === 'annuelle'}
                  id="radio-annuelle"
                  name="radio-inline"
                  onChange={() => {
                    setTemporalite('annuelle')
                  }}
                  type="radio"
                  value="annuelle"
                />
                <label
                  className="fr-label fr-mb-2w"
                  htmlFor="radio-annuelle"
                >
                  Annuelle
                </label>
                <div className="fr-select-group">
                  <label
                    className="fr-label"
                    htmlFor="anneeDeDebut"
                  >
                    Année de début de l‘action
                  </label>
                  <select
                    className="fr-select"
                    defaultValue={currentYear}
                    id="anneeDeDebut"
                    name="anneeDeDebut"
                  >
                    <option
                      disabled
                      hidden
                      selected
                      value=""
                    >
                      {currentYear}
                    </option>
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ width: '49%' }}>
                <input
                  checked={temporalite === 'pluriannuelle'}
                  id="radio-pluriannuelle"
                  name="radio-inline"
                  onChange={() => {
                    setTemporalite('pluriannuelle')
                  }}
                  type="radio"
                  value="pluriannuelle"
                />
                <label
                  className="fr-label fr-mb-2w"
                  htmlFor="radio-pluriannuelle"
                >
                  Pluriannuelle
                </label>
                <div className="fr-select-group">
                  <label
                    className="fr-label"
                    htmlFor="anneeDeFin"
                  >
                    Année de fin de l‘action
                  </label>
                  <select
                    className="fr-select"
                    disabled={temporalite !== 'pluriannuelle'}
                    id="anneeDeFin"
                    name="anneeDeFin"
                  >
                    <option
                      disabled
                      hidden
                      selected
                      value=""
                    >
                      -
                    </option>
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div
            className="grey-border border-radius fr-mb-2w fr-px-10w fr-py-10w"
            id="budgetAction"
            style={{ backgroundColor: 'white' }}
          >
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
              Information sur le budget et le financement
              {' '}
              <span
                aria-hidden="true"
                className="fr-icon-information-line"
              />
            </p>
            <p className="color-grey">
              Détaillez le budget prévisionnel de l‘action incluant les subventions
              et les co-financements éventuels des membres ou ...
            </p>
            <hr />
            <div className={styles['horizontal-text-input']}>
              <div className={styles['half-width']}>
                <label
                  className="fr-label fr-text--bold"
                  htmlFor="budgetGlobal"
                >
                  Budget global de l‘action
                  {' '}
                  <span className="color-red">
                    *
                  </span>
                </label>
              </div>
              <div className={styles['half-width']}>
                <input
                  className="fr-input"
                  id="budgetGlobal"
                  min={0}
                  name="budgetGlobal"
                  required={true}
                  type="number"
                />
              </div>
            </div>
            <hr />
            <div className={styles['horizontal-text-input']}>
              <div className={styles['half-width']}>
                <p className="fr-text--bold fr-mb-0">
                  Subvention demandée à l‘état
                </p>
              </div>
              <button
                className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['half-width']}`}
                disabled
                type="button"
              >
                Demander une subvention
              </button>
            </div>
            <hr />
            <div className={styles['horizontal-text-input']}>
              <div className={styles['half-width']}>
                <p
                  className="fr-text--bold fr-mb-0"
                >
                  Co-financement
                </p>
              </div>
              <button
                className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['half-width']}`}
                disabled
                type="button"
              >
                Ajouter un financement
              </button>
            </div>
            <hr />
          </div>
          <div
            className="grey-border border-radius fr-mb-2w fr-p-4w"
            id="destinatairesFonds"
            style={{ backgroundColor: 'white' }}
          >
            <div className={styles['align-items']}>
              <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
                Destinataire(s) des fonds
                {' '}
                <span className="color-red">
                  *
                </span>
              </p>
              <button
                className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
                type="button"
              >
                Ajouter
              </button>
            </div>
            <p className="color-grey">
              Précisez le ou les membres de votre gouvernance qui seront destinataires des fonds.
              Dans le cas où vous renseignez plusieurs destinataires des fonds pour cette action,
              un encart s’ouvrira vous demandant d’indiquer le montant de la subvention par destinataire.
            </p>
          </div>
        </div>
        <div className="fr-grid-row fr-grid-row--center fr-mt-4w">
          <button
            className="fr-btn fr-btn--primary fr-col-11 fr-mb-5w"
            disabled={isDisabled}
            style={{ display: 'block' }}
            type="submit"
          >
            Valider et envoyer
          </button>
        </div>
      </form>
    </div>
  )
}

type Props = Readonly<{
  date: Date
  isDisabled: boolean
  validerFormulaire(event: FormEvent<HTMLFormElement>, contexte: string, description: string): Promise<void>
}>
