/* eslint-disable @typescript-eslint/unbound-method */
'use client'

import { FormEvent, Fragment, PropsWithChildren, ReactElement, RefObject, useContext, useId, useState } from 'react'

import styles from './Action.module.css'
import AjouterDesBesoins from './AjouterDesBesoins'
import AjouterDesMembres from './AjouterDesMembres'
import DemanderUneSubvention from './DemanderUneSubvention'
import Badge from '../shared/Badge/Badge'
import PageTitle from '../shared/PageTitle/PageTitle'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '../shared/RichTextEditor/TextEditor'
import Select from '../shared/Select/Select'
import Tag from '../shared/Tag/Tag'
import TextInput from '../shared/TextInput/TextInput'
import { gouvernanceContext } from '@/components/shared/GouvernanceContext'
import { actionARemplir, ActionViewModel, BesoinsPotentielle } from '@/presenters/actionPresenter'
import { LabelValue } from '@/presenters/shared/labels'

export function FormulaireAction({
  action,
  children,
  cofinancements,
  drawerId,
  label,
  setIsDrawerOpen,
  supprimerUnCofinancement,
  validerFormulaire,
}: Props): ReactElement {
  const nomDeLActionId = useId()
  const [temporalite, setTemporalite] = useState('annuelle')
  const [budgetGlobal, setBudgetGlobal] = useState(action.budgetGlobal)
  const [porteurs, setPorteurs] = useState(action.porteurs)
  const [beneficiaires, setBeneficiaires] = useState(action.beneficiaires)
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

  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  const membresGouvernanceConfirme = gouvernanceViewModel.porteursPotentielsNouvellesFeuillesDeRouteOuActions

  const [besoinsSelected, setBesoinsSelected] = useState(besoins)

  function enregistrerLeOuLesBesoins(fieldset: RefObject<HTMLFieldSetElement | null>): void {
    let besoinsSelectionner: Array<BesoinsPotentielle['value']> = []
    // istanbul ignore next @preserve
    if (fieldset.current) {
      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        if (input.checked) {
          besoinsSelectionner = [...besoinsSelectionner, input.value as BesoinsPotentielle['value']]
        }
      })
      const action = actionARemplir({ besoins: besoinsSelectionner })
      setBesoinsSelected([
        ...action.besoins.financements,
        ...action.besoins.formations,
        ...action.besoins.formationsProfessionnels,
        ...action.besoins.outillages,
      ])
    }
  }

  function createToutEffacer() {
    return (fieldset: RefObject<HTMLFieldSetElement | null>) => {
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

  function resetToutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): void {
    // istanbul ignore next @preserve
    if (fieldset.current) {
      const besoins: Array<BesoinsPotentielle['value']> = besoinsSelected.filter(i => i.isSelected).map(i => i.value)
      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        input.checked = besoins.includes(input.value as BesoinsPotentielle['value'])
      })
    }

  }

  const toutEffacerBeneficiaires = createToutEffacer()
  const toutEffacerBesoins = createToutEffacer()
  const toutEffacerPorteurs = createToutEffacer()

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
              enregistrerBesoins={enregistrerLeOuLesBesoins}
              financements={action.besoins.financements}
              formations={action.besoins.formations}
              formationsProfesionnels={action.besoins.formationsProfessionnels}
              hasBesoins={action.hasBesoins}
              outillages={action.besoins.outillages}
              toutEffacer={toutEffacerBesoins}
              resetToutEffacer={resetToutEffacer}
            />
          </div>
          <p className="color-grey">
            Indiquez à quels besoins se rapporte l’action pour laquelle vous demandez une subvention.
          </p>
          <hr />
          {besoinsSelected
            .filter((besoin) => Boolean(besoin.isSelected))
            .map((besoin) => (
              <p
                className="fr-tag fr-mr-1w fr-mb-1w"
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
              enregistrer={enregistrerPorteurs}
              labelPluriel="porteurs"
              membres={porteurs}
              titre="Ajouter le(s) porteur(s)"
              toutEffacer={toutEffacerPorteurs}
              urlGouvernance={action.urlGouvernance}
            />
          </div>
          <p>
            Indiquez quelle est la structure porteuse de cette action
          </p>
          <hr />
          {
            porteurs
              .map((porteur) => (
                <Fragment key={porteur.id}>
                  <Tag
                    href={porteur.link}
                    target="_blank"
                  >
                    {porteur.nom}
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
            <div className={styles['third-width']}>
              <input
                className="fr-input"
                defaultValue={action.budgetGlobal}
                id="budgetGlobal"
                min={0}
                name="budgetGlobal"
                onChange={(event) => {
                  setBudgetGlobal(Number(event.target.value))
                }}
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
              enregistrer={enregistrerBeneficiaires}
              labelPluriel="bénéficiaires des fonds"
              membres={beneficiaires}
              titre="Ajouter le(s) bénéficiaire(s)"
              toutEffacer={toutEffacerBeneficiaires}
              urlGouvernance={action.urlGouvernance}
            />
          </div>
          <p className="color-grey">
            Précisez le ou les membres de votre gouvernance qui seront destinataires des fonds.
          </p>
          <div>
            {
              beneficiaires
                .map((beneficiaire) => (
                  <Fragment key={beneficiaire.id}>
                    <Tag
                      href={beneficiaire.link}
                      target="_blank"
                    >
                      {beneficiaire.nom}
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

  function enregistrerPorteurs(fieldset: RefObject<HTMLFieldSetElement | null>) {
    return () => {
      // istanbul ignore next @preserve
      if (!fieldset.current) { return }

      const members = Array.from(fieldset.current.querySelectorAll('input')).map(
        (input: HTMLInputElement) => {
          return {
            member: {
              uid: input.value,
            },
            selected: input.checked,
          }
        }
      )
      const selectedMemberIds = members
        .filter((member) => member.selected)
        .map(memberSelected => memberSelected.member.uid)
      const newPorteurs = membresGouvernanceConfirme
        .filter(coporteurPotentiel => selectedMemberIds.includes(coporteurPotentiel.id))
      setPorteurs(newPorteurs)
    }
  }

  function enregistrerBeneficiaires(fieldset: RefObject<HTMLFieldSetElement | null>) {
    return () => {
      // istanbul ignore next @preserve
      if (!fieldset.current) { return }

      const members = Array.from(fieldset.current.querySelectorAll('input')).map(
        (input: HTMLInputElement) => {
          return {
            member: {
              uid: input.value,
            },
            selected: input.checked,
          }
        }
      )
      const selectedMemberIds = members
        .filter((member) => member.selected)
        .map(memberSelected => memberSelected.member.uid)
      const newBenificiaire = membresGouvernanceConfirme
        .filter(membreGouvernanceConfirme => selectedMemberIds.includes(membreGouvernanceConfirme.id))
      setBeneficiaires(newBenificiaire)
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
  action: ActionViewModel
  cofinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  date?: Date
  drawerId: string
  label: string
  setIsDrawerOpen(isDrawerOpen: boolean): void
  supprimerUnCofinancement(index: number): void
  validerFormulaire(event: FormEvent<HTMLFormElement>, contexte: string, description: string): Promise<void>
}>>
