import { PropsWithChildren, ReactElement, RefObject, useEffect, useId, useMemo, useRef, useState } from 'react'

import styles from './Action.module.css'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Select from '../shared/Select/Select'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'
import { formatMontant } from '@/presenters/shared/number'

export default function DemanderUneSubvention({
  ajouterDemandeDeSubvention,
  demandeDeSubvention,
  enveloppes,
  isReadOnly = false,
  montantMaxAction,
  supprimerUneDemandeDeSubvention,
}: Props): ReactElement {
  const enveloppeById = enveloppes.length > 0 
    ? enveloppes.reduce<EnveloppeById>(enveloppeByIdReducer, {})
    : {}

  const labelId = useId()
  const selectEnveloppeId = useId()
  const inputMontantPrestaId = useId()
  const inputMontantPrestaErrorTextId = useId()
  const inputMontantRhId = useId()
  const inputMontantRhErrorTextId = useId()
  const drawerId = 'drawerDemanderUneSubventionId'

  const inputMontantPrestaRef = useRef<HTMLInputElement>(null)
  const inputMontantRhRef = useRef<HTMLInputElement>(null)

  const drawer = useRef<HTMLDialogElement>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [budgetEnveloppe, setBudgetEnveloppe] = useState<number | undefined>(undefined)
  const [hasError, setHasError] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [montantPresta, setMontantPresta] = useState(demandeDeSubvention?.montantPrestation)
  const [montantRh, setMontantRh] = useState(demandeDeSubvention?.montantRh)
  const [selectedEnveloppeId, setSelectedEnveloppeId] = useState<string>(demandeDeSubvention?.enveloppeId ?? '')
  const [isEnveloppeSelectionnee, setIsEnveloppeSelectionnee] = useState(false)
  const isBudgetAction = useMemo(() => montantMaxAction > 0, [montantMaxAction])
  const subventionsDemandees = useMemo(() => (montantPresta ?? 0) + (montantRh ?? 0), [montantPresta, montantRh])

  function reinitialiserDrawer(): void {
    setIsEnveloppeSelectionnee(false)
    setBudgetEnveloppe(undefined)
    setMontantPresta(undefined)
    setMontantRh(undefined)
    setSelectedEnveloppeId('')
    setHasError(false)
    setIsValid(false)
    if (inputMontantPrestaRef.current) {
      inputMontantPrestaRef.current.value = ''
    }
    if (inputMontantRhRef.current) {
      inputMontantRhRef.current.value = ''
    }
    const selectEnveloppe = document.getElementById(selectEnveloppeId) as HTMLSelectElement
    selectEnveloppe.value = ''
  }

  useEffect(() => {
    if (isDrawerOpen) {
      reinitialiserDrawer()
    }
  }, [isDrawerOpen])

  useEffect(() => {
    if (isDrawerOpen && demandeDeSubvention) {
      if (demandeDeSubvention.enveloppeId) {
        const selectedEnveloppe = enveloppeById[demandeDeSubvention.enveloppeId]
        if (selectedEnveloppe.limiteLaDemandeSubvention) {
          setBudgetEnveloppe(selectedEnveloppe.budget)
        } else {
          setBudgetEnveloppe(undefined)
        }
      }

      if (inputMontantPrestaRef.current && demandeDeSubvention.montantPrestation) {
        inputMontantPrestaRef.current.value = demandeDeSubvention.montantPrestation.toString()
      }
      if (inputMontantRhRef.current && demandeDeSubvention.montantRh) {
        inputMontantRhRef.current.value = demandeDeSubvention.montantRh.toString()
      }
    }
  }, [isDrawerOpen, demandeDeSubvention])

  useEffect(() => {
    const montantMax = montantMaximal()
    const montantPrestaValue = montantPresta ?? 0
    const montantRhValue = montantRh ?? 0
    const total = montantPrestaValue + montantRhValue
    
    const hasErrorValue = total > montantMax
    setHasError(hasErrorValue)
    
    setIsValid(
      selectedEnveloppeId !== '' && 
      !hasErrorValue && 
      (montantPrestaValue > 0 || montantRhValue > 0) &&
      total <= montantMax
    )
  }, [selectedEnveloppeId, montantPresta, montantRh, budgetEnveloppe, montantMaxAction])

  return (
    <>
      {
        demandeDeSubvention ?
          <div >
            <div className="fr-grid-row space-between">
              <p className="fr-text--bold fr-mb-0">
                Subvention demandée
              </p>
              <div className={`fr-grid-row ${styles['align-items']}`}>
                {!isReadOnly && (
                  <button
                    className="fr-btn fr-btn--tertiary fr-icon-delete-line color-red fr-ml-1w"
                    onClick={() => {
                      supprimerUneDemandeDeSubvention?.()
                    }}
                    title="Supprimer la demande de subvention"
                    type="button"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            <div className="fr-p-2w background-blue-france">
              <div className="fr-grid-row space-between">
                <p className="fr-col-10 fr-mb-0 color-blue-france fr-text--bold">
                  {enveloppeById[demandeDeSubvention.enveloppeId].label}
                </p>
                <p className="fr-mb-0 fr-mr-2w color-blue-france fr-text--bold">
                  {formatMontant(demandeDeSubvention.total)}
                </p>
              </div>
              <ul className="color-blue-france fr-mt-1w fr-pl-0 fr-pt-1w">
                <li>
                  <div className="fr-grid-row space-between">
                    <p>
                      Prestation de service
                    </p>
                    <p className="fr-text--lg fr-mr-1w">
                      {formatMontant(demandeDeSubvention.montantPrestation)}
                    </p>
                  </div>
                </li>
                <li>
                  <div className="fr-grid-row space-between">
                    <p>
                      Ressources humaines
                    </p>
                    <p className="fr-text--lg fr-mr-1w">
                      {formatMontant(demandeDeSubvention.montantRh)}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          :
          <div className={styles['horizontal-text-input']}>
            <div className={styles['half-width']}>
              <label
                className="fr-label fr-text--bold"
                htmlFor="subventionsDemandees"
              >
                Subvention demandée à l&apos;état
              </label>
            </div>
            <button
              aria-controls={drawerId}
              className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['third-width']}`}
              data-fr-opened="false"
              disabled={!isBudgetAction}
              onClick={() => {
                setIsDrawerOpen(true)
              }}
              title="Faire une demande de subvention"
              type="button"
            >
              Demander une subvention
            </button>
          </div>
      }
      <Drawer
        boutonFermeture="Fermer la demande de subvention"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawer}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon icon="money-euro-circle-line" />
          <br />
          Demander une subvention
        </DrawerTitle>
        <p className="color-grey fr-text--sm">
          Saisissez le montant de la subvention que vous souhaitez obtenir de l&apos;état.
          {' '}
          <span className="color-blue-france">
            {`Dans la limite de ${formatMontant(montantMaximal())}`}
          </span>
          {/**/}
          .
        </p>
        <Select
          id={selectEnveloppeId}
          name="enveloppes"
          onChange={(event) => {
            const enveloppeId = event.target.value
            setSelectedEnveloppeId(enveloppeId)
            setIsEnveloppeSelectionnee(true)
            if (enveloppeById[enveloppeId].limiteLaDemandeSubvention) {
              setBudgetEnveloppe(enveloppeById[enveloppeId].budget)
            } else {
              setBudgetEnveloppe(undefined)
            }
          }}
          options={enveloppes.filter((enveloppe) => enveloppe.available).map((enveloppe) => ({
            ...enveloppe,
            isSelected: enveloppe.value === selectedEnveloppeId,
          }))}
        >
          Enveloppe de financement concernée
        </Select>
        {
          montantInput({
            children: (
              <>
                Montant en prestation de service
              </>
            ),
            errorTextId: inputMontantPrestaErrorTextId,
            id: inputMontantPrestaId,
            max: montantMaximal(montantRh),
            onInput: setMontantPresta,
            ref: inputMontantPrestaRef,
            value: demandeDeSubvention?.montantPrestation,
          })
        }
        {montantInput({
          children: (
            <>
              Montant en ressources humaines
              {' '}
              <span className="fr-hint-text">
                Il s&apos;agit d&apos;une ressource humaine interne à la structure employeuse faisant partie de la
                gouvernance et récipiendaire des fonds.
                <br />
                Format attendu : Montant
                {' '}
                <abbr title="Équivalent temps plein">
                  ETP
                </abbr>
                {' '}
                en euros
              </span>
            </>
          ),
          errorTextId: inputMontantRhErrorTextId,
          id: inputMontantRhId,
          max: montantMaximal(montantPresta),
          onInput: setMontantRh,
          ref: inputMontantRhRef,
          value: demandeDeSubvention?.montantRh,
        })}
        <ul
          className={`background-blue-france color-blue-france fr-my-4w fr-py-2w fr-pr-2w ${styles['no-style-list']}`}
        >
          {selectedEnveloppeId && enveloppeById[selectedEnveloppeId].limiteLaDemandeSubvention ? (
            <li className="fr-grid-row space-between fr-mb-1w">
              Vos droits de subvention
              {' '}
              <span>
                {formatMontant(budgetEnveloppe ?? 0)}
              </span>
            </li>
          ) : null}
          <li className="fr-grid-row space-between fr-mb-1w">
            Maximum autorisé pour cette action
            {' '}
            <span>
              {formatMontant(montantMaxAction)}
            </span>
          </li>
          {subventionsDemandees > 0 ? (
            <li className="fr-text--bold fr-grid-row space-between fr-pt-1w fr-text--lg separator-up">
              Total subventions demandées
              {' '}
              <span>
                {formatMontant(subventionsDemandees)}
              </span>
            </li>
          ) : null}
        </ul>
        <div className="fr-btns-group fr-mt-2w">
          <button
            aria-controls={drawerId}
            className="fr-btn"
            disabled={!isValid}
            onClick={() => {
              const nouvelleDemandeDeSubvention = {
                enveloppeId: selectedEnveloppeId,
                montantPrestation: montantPresta ?? 0,
                montantRh: montantRh ?? 0,
                total: subventionsDemandees,
              }
              ajouterDemandeDeSubvention?.(nouvelleDemandeDeSubvention)
              setIsDrawerOpen(false)
            }}
            type="button"
          >
            Enregistrer
          </button>
        </div>
      </Drawer>
    </>
  )

  function montantInput({ children, errorTextId, id, max, onInput, ref }: MontantInputProps): ReactElement {
    const inputGroupDisabledStyle = isEnveloppeSelectionnee ? '' : 'fr-input-group--disabled'
    const inputGroupErrorStyle = hasError ? 'fr-input-group--error' : ''

    return (
      <div className={`fr-input-group input-group--sobre ${inputGroupDisabledStyle} ${inputGroupErrorStyle}`}>
        <label
          className="fr-label"
          htmlFor={id}
        >
          {children}
        </label>
        <input
          aria-describedby={hasError ? errorTextId : undefined}
          className="fr-input"
          disabled={!isEnveloppeSelectionnee}
          id={id}
          max={max}
          min="0"
          onInput={(event) => {
            onInput(Number(event.currentTarget.value))
          }}
          ref={ref}
          type="number"
        />
        {
          hasError ?
            <p
              className="fr-error-text"
              id={errorTextId}
            >
              Les montants de prestation de service et ressources humaines cumulés dépassent vos droits de subvention
            </p> : null
        }
      </div>
    )
  }

  function montantMaximal(autreMontant = 0): number {
    if (budgetEnveloppe === undefined) {
      return montantMaxAction
    }
    return Math.min(budgetEnveloppe - autreMontant, montantMaxAction - autreMontant)
  }
}

function enveloppeByIdReducer(enveloppeById: EnveloppeById, enveloppe: Enveloppe): EnveloppeById {
  return Object.assign(enveloppeById, { [enveloppe.value]: enveloppe })
}

type Enveloppe = ActionViewModel['enveloppes'][number]

type EnveloppeById = Readonly<Record<string, Enveloppe>>

type MontantInputProps = PropsWithChildren<Readonly<{
  errorTextId: string
  id: string
  max: number
  onInput(montant: number): void
  ref: RefObject<HTMLInputElement | null>
  value?: number
}>>

type Props = Readonly<{
  ajouterDemandeDeSubvention?(demandeDeSubvention: DemandeDeSubvention): void
  demandeDeSubvention?: DemandeDeSubvention
  enveloppes: ActionViewModel['enveloppes']
  isReadOnly?: boolean
  montantMaxAction: number
  supprimerUneDemandeDeSubvention?(): void
}>
