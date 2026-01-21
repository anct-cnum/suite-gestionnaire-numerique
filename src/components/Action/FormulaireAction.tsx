/* eslint-disable @typescript-eslint/unbound-method */
'use client'

import { FormEvent, Fragment, PropsWithChildren, ReactElement, RefObject, useContext, useId, useState } from 'react'

import styles from './Action.module.css'
import AjouterDesBesoins from './AjouterDesBesoins'
import AjouterDesMembres from './AjouterDesMembres'
import AjouterUnCoFinancement from './AjouterUnCoFinancement'
import { AlertePrevisionnel } from './AlertePrevisionnel'
import DemanderUneSubvention from './DemanderUneSubvention'
import { MontantPositif } from '../shared/Montant/MontantPositif'
import PageTitle from '../shared/PageTitle/PageTitle'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '../shared/RichTextEditor/TextEditor'
import Tag from '../shared/Tag/Tag'
import TextInput from '../shared/TextInput/TextInput'
import TemporaliteAction from '@/components/Action/TemporaliteAction'
import { gouvernanceContext } from '@/components/shared/GouvernanceContext'
import {  ActionViewModel, Besoins, BesoinsPotentielle, DemandeDeSubvention, transformBesoins } from '@/presenters/actionPresenter'
import { Optional } from '@/shared/Optional'

export function FormulaireAction({
  action,
  ajouterDemandeDeSubvention,
  children,
  demandeDeSubvention,
  isReadOnly = false,
  label,
  supprimerUneDemandeDeSubvention,
  validerFormulaire,
}: Props): ReactElement {
  const nomDeLActionId = useId()

  const [budgetGlobal, setBudgetGlobal] = useState(action.budgetGlobal)
  const [porteurs, setPorteurs] = useState(action.porteurs)
  const [destinataires, setDestinataires] = useState(action.destinataires)
  const [cofinancements, setCofinancements] = useState(action.cofinancements)

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

  function resetPorteurToutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): void {
    // istanbul ignore next @preserve
    if (fieldset.current) {
      const porteurIds = porteurs.map(porteur => porteur.id)

      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        input.checked = porteurIds.includes(input.value)
      })
    }
  }

  function resetBeneficiaireToutEffacer(fieldset: RefObject<HTMLFieldSetElement | null>): void {
    // istanbul ignore next @preserve
    if (fieldset.current) {
      const beneficiaireIds = destinataires.map(beneficiare => beneficiare.id)

      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        input.checked = beneficiaireIds.includes(input.value)
      })
    }
  }

  function enregistrerLeOuLesBesoins(fieldset: RefObject<HTMLFieldSetElement | null>) : void {
    let besoinsSelectionner: Array<BesoinsPotentielle['value']> = []
    // istanbul ignore next @preserve
    if (fieldset.current) {
      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        if (input.checked) {
          besoinsSelectionner = [...besoinsSelectionner, input.value as BesoinsPotentielle['value']]
        }
      })
      const besoinsTransformes = transformBesoins(besoinsSelectionner)
      setBesoinsSelected([
        ...besoinsTransformes.financements,
        ...besoinsTransformes.formations,
        ...besoinsTransformes.formationsProfessionnels,
        ...besoinsTransformes.outillages,
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
      const besoins: Array<BesoinsPotentielle['value']> = besoinsSelected
        .filter(besoin => Boolean(besoin.isSelected))
        .map(besoin => besoin.value)
      fieldset.current.querySelectorAll('input').forEach((input: HTMLInputElement) => {
        input.checked = besoins.includes(input.value as BesoinsPotentielle['value'])
      })
    }
  }

  const toutEffacerBesoins = createToutEffacer()

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form
      aria-label={label}
      className="fr-mt-5w"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
        }
      }}
      onSubmit={async (event) => {
        event.preventDefault()

        if (isReadOnly) {
          return
        }
        await validerFormulaire?.(
          event,
          contexteContenu,
          descriptionContenu,
          cofinancements.map(cofinancement => cofinancement)
        )
      }}
    >
      <Tag href={action.urlFeuilleDeRoute}>
        {action.nomFeuilleDeRoute}
      </Tag>
      <PageTitle>
        {label}
      </PageTitle>
      <div className="glycine-background fr-p-4w fr-mt-4w">
        <div className="white-background fr-p-4w fr-mb-2w">
          <div
            className={styles['align-items']}
            id="besoinsAction"
          >
            <p className="fr-h6 fr-text--bold color-blue-france fr-mb-0">
              Besoins liés à l‘action
              {' '}
              {!isReadOnly && (
                <span className="color-red">
                  *
                </span>
              )}
            </p>
            {!isReadOnly && (
              <AjouterDesBesoins
                enregistrerBesoins={enregistrerLeOuLesBesoins}
                financements={action.besoins.financements}
                formations={action.besoins.formations}
                formationsProfesionnels={action.besoins.formationsProfessionnels}
                hasBesoins={checkHasBesoinsSelected(besoinsSelected)}
                outillages={action.besoins.outillages}
                resetToutEffacer={resetToutEffacer}
                toutEffacer={toutEffacerBesoins}
              />
            )}
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
            disabled={isReadOnly}
            id={nomDeLActionId}
            name="nom"
            required={!isReadOnly}
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
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
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
              Porteur(s) de l‘action
            </p>
            {!isReadOnly && (
              <AjouterDesMembres
                checkboxName="porteurs"
                drawerId="drawerAjouterDesPorteursId"
                enregistrer={enregistrerPorteurs}
                labelPluriel="porteurs"
                membres={porteurs}
                resetToutEffacer={resetPorteurToutEffacer}
                titre="Ajouter le(s) porteur(s)"
                toutEffacer={createToutEffacer()}
                urlGestionMembresGouvernance={action.urlGestionMembresGouvernance}
              />
            )}
          </div>
          <p>
            Précisez la ou les structure(s) porteuse(s) de cette action
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
        <TemporaliteAction 
          action={{ anneeDeDebut: action.anneeDeDebut, anneeDeFin:action.anneeDeFin }} 
          isReadOnly={isReadOnly}
        />
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
                disabled={isReadOnly}
                id="budgetGlobal"
                min={0}
                name="budgetGlobal"
                onChange={(event) => {
                  if (!isReadOnly) {
                    setBudgetGlobal(Number(event.target.value))
                  }
                }}
                required={!isReadOnly}
                type="number"
              />
            </div>
          </div>
          <hr />
          <DemanderUneSubvention
            ajouterDemandeDeSubvention={ajouterDemandeDeSubvention}
            demandeDeSubvention={demandeDeSubvention}
            enveloppes={action.enveloppes}
            isReadOnly={isReadOnly}
            montantMaxAction={budgetGlobal}
            supprimerUneDemandeDeSubvention={supprimerUneDemandeDeSubvention}
          />
          <hr />
          <div className={styles['horizontal-text-input']}>
            <div className={styles['half-width']}>
              <p
                className="fr-text--bold fr-mb-0"
              >
                Co-financement
              </p>
            </div>
            {!isReadOnly && (
              <AjouterUnCoFinancement
                ajoutCoFinanceur={ajouterCofinancement}
                budgetGlobal={budgetGlobal}
                label="Ajouter un co-financement"
                labelId="ajouter-un-cofinancement-label"
              />
            )}
          </div>
          {
            cofinancements.length > 0 ?
              <>
                <ul
                  className={`color-blue-france fr-text--bold fr-mt-1w fr-pl-0 fr-pt-1w ${styles['no-style-list']}`}
                  data-testid="liste-cofinanceurs"
                >
                  {cofinancements.map((cofinancement) => (
                    <li
                      key={cofinancement.coFinanceur+cofinancement.montant}
                    >
                      <div className={`fr-p-2w background-blue-france ${styles['align-items']}`}>
                        <p className="fr-col-10 fr-mb-0">
                          {membresGouvernanceConfirme
                            .find(membre => membre.id === cofinancement.coFinanceur)
                            ?.nom}
                        </p>
                        <div
                          className={`fr-col-2 ${styles['deletion-section']}`}
                        >
                          <p className="fr-mb-0 fr-mr-2w">
                            {Optional
                              .ofNullable(cofinancement.montant)
                              .flatMap(MontantPositif.of)
                              .map((montant) => montant.format())
                              .orElse(cofinancement.montant)}
                            {' '}
                            €
                          </p>
                          {!isReadOnly && (
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
                          )}
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
                </div>
              </>
              : null
          }
          <hr />
          <AlertePrevisionnel
            budgetGlobal={budgetGlobal}
            cofinancements={cofinancements}
            demandeDeSubvention={demandeDeSubvention}
          />
        </div>

        {demandeDeSubvention ? (
          <div
            className="white-background fr-p-4w"
            id="destinatairesSubvention"
          >
            <div className={styles['align-items']}>
              <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
                Destinataire(s) de la subvention
                {' '}
                {!isReadOnly && (
                  <span className="color-red">
                    *
                  </span>
                )}
              </p>
              {!isReadOnly && (
                <AjouterDesMembres
                  checkboxName="beneficiaires"
                  drawerId="drawerAjouterDesBeneficiairesId"
                  enregistrer={enregistrerBeneficiaires}
                  labelPluriel="bénéficiaires de la subvention"
                  membres={destinataires}
                  resetToutEffacer={resetBeneficiaireToutEffacer}
                  titre="Ajouter le(s) bénéficiaire(s)"
                  toutEffacer={createToutEffacer()}
                  urlGestionMembresGouvernance={action.urlGestionMembresGouvernance}
                />
              )}
            </div>
            <p className="color-grey">
              Précisez le ou les membres de votre gouvernance qui seront destinataires de la subvention.
            </p>
            <div>
              {
                destinataires
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
        ) : null}
      </div>
      <div className="fr-grid-row fr-grid-row--center fr-mt-4w">
        {children}
      </div>
    </form>
  )

  function ajouterCofinancement(coFinanceur: string, montant: MontantPositif): void {
    setCofinancements([...cofinancements, { coFinanceur, montant: montant.get.toString() }])
  }

  function supprimerUnCofinancement(index: number): void {
    const filteredCofinancements = cofinancements.filter((_, indexToRemove) => indexToRemove !== index)
    setCofinancements(filteredCofinancements)
  }
  function enregistrerPorteurs(fieldset: RefObject<HTMLFieldSetElement | null>) {
    return () => {
      // istanbul ignore next @preserve
      if (!fieldset.current) {return}

      const members = Array.from(fieldset.current.querySelectorAll('input')).map(
        (input: HTMLInputElement) => {
          return {
            member : {
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
      if (!fieldset.current) {return}

      const members = Array.from(fieldset.current.querySelectorAll('input')).map(
        (input: HTMLInputElement) => {
          return {
            member : {
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
      setDestinataires(newBenificiaire)
    }
  }
}

function checkHasBesoinsSelected(besoins: Besoins): boolean {
  return Object.values(besoins)
    .flat()
    .some(besoin => Boolean(besoin.isSelected))
}

type Props = PropsWithChildren<Readonly<{
  action: ActionViewModel
  ajouterDemandeDeSubvention?(demandeDeSubvention: DemandeDeSubvention): void
  date?: Date
  demandeDeSubvention?: DemandeDeSubvention
  isReadOnly?: boolean
  label: string
  supprimerUneDemandeDeSubvention?(): void
  validerFormulaire?(event: FormEvent<HTMLFormElement>, contexte: string, description: string, cofinancement : Array<{
    coFinanceur: string
    montant: string
  }>): Promise<void> | undefined
}>>
