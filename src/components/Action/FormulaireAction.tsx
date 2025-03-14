/* eslint-disable @typescript-eslint/unbound-method */
'use client'

import { FormEvent, Fragment, PropsWithChildren, ReactElement, RefObject, useId, useState } from 'react'

import styles from './Action.module.css'
import AjouterDesBesoins from './AjouterDesBesoins'
import AjouterDesMembres from './AjouterDesMembres'
import DemanderUneSubvention from './DemanderUneSubvention'
import Badge from '../shared/Badge/Badge'
import NumberInput from '../shared/NumberInput/NumberInput'
import PageTitle from '../shared/PageTitle/PageTitle'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '../shared/RichTextEditor/TextEditor'
import Select from '../shared/Select/Select'
import Tag from '../shared/Tag/Tag'
import TextInput from '../shared/TextInput/TextInput'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { LabelValue } from '@/presenters/shared/labelValue'

export function FormulaireAction({
  action,
  cofinancements,
  label,
  validerFormulaire,
  children,
  setIsDrawerOpen,
  supprimerUnCofinancement,
  drawerId,
}: Props): ReactElement {
  const nomDeLActionId = useId()
  const [temporalite, setTemporalite] = useState('annuelle')
  const [budgetGlobal, setBudgetGlobal] = useState(action.budgetGlobal)
  const years = Array.from({ length: 6 }, (_, index) => 2025 + index)
  const {
    contenu: contexteContenu,
    gererLeChangementDeContenu: gererChangementContexte,
  } = useRichTextEditor(action.contexte)

  const {
    contenu: descriptionContenu,
    gererLeChangementDeContenu: gererChangementDescription,
  } = useRichTextEditor(action.description)

  const besoins = [
    ...action.besoins.financements,
    ...action.besoins.formations,
    ...action.besoins.formationsProfessionnels,
    ...action.besoins.outillages,
  ]

  return (
    <form
      aria-label={label}
      className="fr-mt-5w"
      onSubmit={async (event) => {
        event.preventDefault()
        await validerFormulaire(
          event,
          contexteContenu,
          descriptionContenu
        )
      }}
    >
      <Tag href={action.urlFeuilleDeRoute}>
        {action.nomFeuilleDeRoute}
      </Tag>
      <PageTitle>
        {label}
      </PageTitle>
      <Badge color="grey-main">
        En construction
      </Badge>
      <div className="glycine-background fr-p-4w fr-mt-4w">
        <div className="white-background fr-p-4w fr-mb-2w">
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
            <AjouterDesBesoins
              financements={action.besoins.financements}
              formations={action.besoins.formations}
              formationsProfesionnels={action.besoins.formationsProfessionnels}
              hasBesoins={action.hasBesoins}
              outillages={action.besoins.outillages}
              toutEffacer={toutEffacer}
            />
          </div>
          <p className="color-grey">
            Indiquez à quels besoins se rapporte l’action pour laquelle vous demandez une subvention.
          </p>
          <hr />
          {besoins
            .filter((besoin) => Boolean(besoin.isSelected))
            .map((besoin) => (
              <p
                className="fr-tag fr-mr-1w"
                key={besoin.value}
              >
                {besoin.label}
              </p>
            ))}
        </div>
        <div
          className="white-background fr-p-4w fr-mb-2w"
        >
          <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
            Informations sur l‘action
          </p>
          <hr />
          <TextInput
            defaultValue={action.nom}
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
          <TextEditor
            ariaLabel="Éditeur de contexte de l‘action"
            contenu={contexteContenu}
            height={150}
            onChange={gererChangementContexte}
          />
          <label
            className="fr-label fr-mt-3w"
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
          <TextEditor
            ariaLabel="Éditeur de description de l‘action"
            contenu={descriptionContenu}
            height={350}
            onChange={gererChangementDescription}
          />

        </div>
        <div
          className="white-background fr-p-4w fr-mb-2w"
        >
          <div
            className={styles['align-items']}
            id="porteurAction"
          >
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-0">
              Porteur de l‘action
            </p>
            <AjouterDesMembres
              checkboxName="porteurs"
              drawerId="drawerAjouterDesPorteursId"
              labelPluriel="porteurs"
              membres={action.porteurs}
              titre="Ajouter le(s) porteur(s)"
              toutEffacer={toutEffacer}
              urlGouvernance={action.urlGouvernance}
            />
          </div>
          <p>
            Indiquez quelle est la structure porteuse de cette action
          </p>
          <hr />
          {
            action.porteurs
              .filter((porteur) => Boolean(porteur.isSelected))
              .map((porteur) => (
                <Fragment key={porteur.value}>
                  <Tag>
                    {porteur.label}
                  </Tag>
                </Fragment>
              ))
          }
        </div>
        <div
          className="white-background fr-p-4w fr-mb-2w"
          id="temporaliteAction"
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
          >
            <div className={styles['select-width']}>
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
              <Select
                id="anneeDeDebut"
                name="anneeDeDebut"
                options={years.map(toLabelValue(Number(action.anneeDeDebut)))}
                placeholder={action.anneeDeDebut}
              >
                Année de début de l‘action
              </Select>
            </div>
            <div className={styles['select-width']}>
              <input
                checked={temporalite === 'pluriannuelle'}
                id="radio-pluriannuelle"
                name="radio-pluriannuelle"
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
              <Select
                disabled={temporalite !== 'pluriannuelle'}
                id="anneeDeFin"
                name="anneeDeFin"
                options={years.map(toLabelValue(Number(action.anneeDeFin)))}
                placeholder="-"

              >
                Année de fin de l‘action
              </Select>
            </div>
          </div>
        </div>
        <div
          className="white-background fr-p-4w fr-mb-2w"
          id="budgetAction"
        >
          <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
            Information sur le budget et le financement
          </p>
          <p className="color-grey">
            Détaillez le budget prévisionnel de l‘action incluant les subventions
            et les co-financements éventuels des membres ou ...
          </p>
          <hr />
          <div className="input-group-horizontal input-group-horizontal--third-width fr-mb-2w">
            <NumberInput
              defaultValue={action.budgetGlobal}
              icon="money-euro-circle-line"
              id="budgetGlobal"
              min={0}
              name="budgetGlobal"
              onInput={(event) => {
                setBudgetGlobal(Number(event.currentTarget.value))
              }}
              required={true}
            >
              <span className="fr-text--bold">
                Budget global de l‘action
              </span>
            </NumberInput>
          </div>
          <hr />
          <div className={styles['horizontal-text-input']}>
            <div className={styles['half-width']}>
              <p className="fr-text--bold fr-mb-0">
                Subvention demandée à l‘état
              </p>
            </div>
            <DemanderUneSubvention
              enveloppes={action.enveloppes}
              montantMaxAction={budgetGlobal}
            />
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
            {
              cofinancements.length === 0 && (
                <button
                  aria-controls={drawerId}
                  className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['third-width']}`}
                  data-fr-opened="false"
                  disabled={budgetGlobal === 0}
                  onClick={() => {
                    setIsDrawerOpen(true)
                  }}
                  type="button"
                >
                  Ajouter un financement
                </button>
              )
            }
          </div>
          {
            cofinancements.length > 0 ?
              <>
                <ul className={`color-blue-france fr-text--bold fr-mt-1w fr-pl-0 fr-pt-1w ${styles['no-style-list']}`}>
                  {cofinancements.map((cofinancement) => (
                    <li
                      key={cofinancement.coFinanceur}
                    >
                      <div className={`fr-p-2w background-blue-france ${styles['align-items']}`}>
                        <p className="fr-col-10 fr-mb-0">
                          {cofinancement.coFinanceur}
                        </p>
                        <div
                          className={`fr-col-2 ${styles['deletion-section']}`}
                        >
                          <p className="fr-mb-0 fr-mr-2w">
                            {cofinancement.montant}
                          </p>
                          <button
                            className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-delete-line color-red"
                            onClick={() => {
                              supprimerUnCofinancement(cofinancements.indexOf(cofinancement))
                            }}
                            title="Label bouton"
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  className="fr-mt-3w fr-mb-5w"
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <hr />
                  <button
                    aria-controls={drawerId}
                    className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['third-width']}`}
                    data-fr-opened="false"
                    onClick={() => {
                      setIsDrawerOpen(true)
                    }}
                    type="button"
                  >
                    Ajouter un financement
                  </button>
                </div>
              </>
              : null
          }
          <hr />
        </div>
        <div
          className="white-background fr-p-4w"
          id="destinatairesFonds"
        >
          <div className={styles['align-items']}>
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
              Destinataire(s) des fonds
              {' '}
              <span className="color-red">
                *
              </span>
            </p>
            <AjouterDesMembres
              checkboxName="beneficiaires"
              drawerId="drawerAjouterDesBeneficiairesId"
              labelPluriel="bénéficiaires des fonds"
              membres={action.beneficiaires}
              titre="Ajouter le(s) bénéficiaire(s)"
              toutEffacer={toutEffacer}
              urlGouvernance={action.urlGouvernance}
            />
          </div>
          <p className="color-grey">
            Précisez le ou les membres de votre gouvernance qui seront destinataires des fonds.
          </p>
          <div>
            {
              action.beneficiaires
                .filter((beneficiaire) => Boolean(beneficiaire.isSelected))
                .map((beneficiaire) => (
                  <Fragment key={beneficiaire.value}>
                    <Tag>
                      {beneficiaire.label}
                    </Tag>
                  </Fragment>
                ))
            }
          </div>
        </div>
      </div>
      <div className="fr-grid-row fr-grid-row--center fr-mt-4w">
        {children}
      </div>
    </form>
  )

  function toutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>) {
    return () => {
      // istanbul ignore next @preserve
      if (fieldset.current) {
        fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
          input.checked = false
        })
      }
    }
  }
}

function toLabelValue(selected: number) {
  return (year: number): LabelValue<number> => ({
    isSelected: selected === year,
    label: `${year}`,
    value: year,
  })
}

type Props = PropsWithChildren<Readonly<{
  date?: Date
  action: ActionViewModel
  cofinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  label: string
  drawerId: string
  setIsDrawerOpen(isDrawerOpen: boolean): void
  supprimerUnCofinancement(index: number): void
  validerFormulaire(event: FormEvent<HTMLFormElement>, contexte: string, description: string): Promise<void>
}>>
