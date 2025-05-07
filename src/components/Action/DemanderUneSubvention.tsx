import { PropsWithChildren, ReactElement, RefObject, useEffect, useId, useMemo, useRef, useState } from 'react'

import styles from './Action.module.css'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Select from '../shared/Select/Select'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { formatMontant } from '@/presenters/shared/number'

export default function DemanderUneSubvention({
  enveloppes,
  montantMaxAction,
}: Props): ReactElement {
  const enveloppeById = enveloppes.reduce<EnveloppeById>(enveloppeByIdReducer, {})

  const labelId = useId()
  const selectEnveloppeId = useId()
  const inputMontantPrestaId = useId()
  const inputMontantPrestaErrorTextId = useId()
  const inputMontantRhId = useId()
  const inputMontantRhErrorTextId = useId()
  const drawerId = 'drawerDemanderUneSubventionId'

  const inputMontantPrestaRef = useRef<HTMLInputElement>(null)
  const inputMontantRhRef = useRef<HTMLInputElement>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [budgetEnveloppe, setBudgetEnveloppe] = useState(0)
  // Stryker disable next-line BooleanLiteral
  const [isValid, setIsValid] = useState(false)
  const [montantPresta, setMontantPresta] = useState(0)
  const [montantRh, setMontantRh] = useState(0)

  const isBudgetEnveloppe = useMemo(() => budgetEnveloppe > 0, [budgetEnveloppe])
  const isBudgetAction = useMemo(() => montantMaxAction > 0, [montantMaxAction])
  const subventionsDemandees = useMemo(() => montantPresta + montantRh, [montantPresta, montantRh])

  useEffect(() => {
    setIsValid(isSaisieValide())
  }, [montantPresta, montantRh, budgetEnveloppe])

  return (
    <>
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
      >
        <DrawerTitle id={labelId}>
          <TitleIcon icon="money-euro-circle-line" />
          <br />
          Demander une subvention
        </DrawerTitle>
        <p className="color-grey fr-text--sm">
          Saisissez le montant de la subvention que vous souhaitez obtenir de l’état.
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
            setBudgetEnveloppe(enveloppeById[event.target.value].budget)
          }}
          options={enveloppes}
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
          })
        }
        {montantInput({
          children: (
            <>
              Montant en ressources humaines
              {' '}
              <span className="fr-hint-text">
                Il s’agit d’une ressource humaine interne à la structure employeuse faisant partie de la
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
        })}
        <ul
          className={`background-blue-france color-blue-france fr-my-4w fr-py-2w fr-pr-2w ${styles['no-style-list']}`}
        >
          {isBudgetEnveloppe ? (
            <li className="fr-grid-row space-between fr-mb-1w">
              Vos droits de subvention
              {' '}
              <span>
                {formatMontant(budgetEnveloppe)}
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
    const input = ref.current
    const isInput = input !== null
    const isInvalid = isInput && !input.validity.valid
    const inputGroupDisabledStyle = isBudgetEnveloppe ? '' : 'fr-input-group--disabled'
    const [displayErrorText, inputGroupErrorStyle] = isInvalid
      ? [Number(input.max) > 0, 'fr-input-group--error']
      : [false, '']
    return (
      <div className={`fr-input-group input-group--sobre ${inputGroupDisabledStyle} ${inputGroupErrorStyle}`}>
        <label
          className="fr-label"
          htmlFor={id}
        >
          {children}
        </label>
        <input
          aria-describedby={displayErrorText ? errorTextId : undefined}
          className="fr-input"
          disabled={!isBudgetEnveloppe}
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
          displayErrorText ?
            <p
              className="fr-error-text"
              id={errorTextId}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion*/}
              {input!.validationMessage}
            </p> : null
        }
      </div>
    )
  }

  function isSaisieValide(): boolean {
    if(inputMontantPrestaRef.current  && inputMontantRhRef.current ) {
      const montantInputs = [inputMontantPrestaRef.current, inputMontantRhRef.current]
      return (
        montantInputs.some(({ value }) => Boolean(value)) &&
        montantInputs.every(({ validity: { valid } }) => valid)
      )
    }
    return false
  }

  function montantMaximal(autreMontant = 0): number {
    return isBudgetEnveloppe
      ? Math.min(budgetEnveloppe - autreMontant, montantMaxAction - autreMontant)
      : montantMaxAction
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
}>>

type Props = Readonly<{
  enveloppes: ActionViewModel['enveloppes']
  montantMaxAction: number
}>
