import { PropsWithChildren, ReactElement, RefObject, useEffect, useId, useMemo, useRef, useState } from 'react'

import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
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

  const drawer = useRef<HTMLDialogElement>(null)

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
        ref={drawer}
      >
        <DrawerTitle id={labelId}>
          Demander une subvention
        </DrawerTitle>
        <p>
          Saisissez le montant de la subvention que vous souhaitez obtenir de l’état. Dans la limite
          de
          {' '}
          {formatMontant(montantMaximal())}
          .
        </p>
        <label htmlFor={selectEnveloppeId}>
          Enveloppe de financement concernée
        </label>
        <select
          defaultValue=""
          id={selectEnveloppeId}
          onChange={(event) => {
            setBudgetEnveloppe(enveloppeById[event.target.value].value)
          }}
        >
          <option
            hidden
            value=""
          >
            Choisir
          </option>
          {enveloppes.map((enveloppe) => (
            <option
              key={enveloppe.id}
              value={enveloppe.id}
            >
              {enveloppe.label}
            </option>
          ))}
        </select>
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
              Montant en ressources humaines Il s’agit d’une ressource humaine interne à la structure
              employeuse faisant partie de la gouvernance et récipiendaire des fonds.
              <br />
              Format attendu : Montant
              <abbr title="Équivalent temps plein">
                ETP
              </abbr>
              {' '}
              en euros
            </>
          ),
          errorTextId: inputMontantRhErrorTextId,
          id: inputMontantRhId,
          max: montantMaximal(montantPresta),
          onInput: setMontantRh,
          ref: inputMontantRhRef,
        })}
        <ul>
          {isBudgetEnveloppe ? (
            <li>
              Vos droits de subvention
              {' '}
              {formatMontant(budgetEnveloppe)}
            </li>
          ) : null}
          <li>
            Maximum autorisé pour cette action
            {' '}
            {formatMontant(montantMaxAction)}
          </li>
          {subventionsDemandees > 0 ? (
            <li>
              Total subventions demandées
              {' '}
              {formatMontant(subventionsDemandees)}
            </li>
          ) : null}
        </ul>
        <button
          aria-controls={drawerId}
          disabled={!isValid}
          onClick={() => {
            setIsDrawerOpen(false)
          }}
          type="button"
        >
          Enregistrer
        </button>
      </Drawer>
    </>
  )

  function montantInput({ ref, id, errorTextId, max, onInput, children }: MontantInputProps): ReactElement {
    const input = ref.current
    const displayErrorText = input !== null && Number(input.max) > 0 && !input.validity.valid
    return (
      <>
        <label htmlFor={id}>
          {children}
        </label>
        <input
          aria-describedby={displayErrorText ? errorTextId : undefined}
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
            <p id={errorTextId}>
              {input.validationMessage}
            </p> : null
        }
      </>
    )
  }

  function isSaisieValide(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const montantInputs = [inputMontantPrestaRef.current!, inputMontantRhRef.current!]
    return (
      montantInputs.some(({ value }) => Boolean(value)) &&
      montantInputs.every(({ validity: { valid } }) => valid)
    )
  }

  function montantMaximal(autreMontant = 0): number {
    return isBudgetEnveloppe
      ? Math.min(budgetEnveloppe - autreMontant, montantMaxAction - autreMontant)
      : montantMaxAction
  }
}

function enveloppeByIdReducer(enveloppeById: EnveloppeById, enveloppe: Enveloppe): EnveloppeById {
  return Object.assign(enveloppeById, { [enveloppe.id]: enveloppe })
}

type Enveloppe = ActionViewModel['enveloppes'][number]

type EnveloppeById = Readonly<Record<string, Enveloppe>>

type MontantInputProps = PropsWithChildren<Readonly<{
  ref: RefObject<HTMLInputElement | null>
  id: string
  errorTextId: string
  max: number
  onInput(montant: number): void
}>>

type Props = Readonly<{
  enveloppes: ActionViewModel['enveloppes']
  montantMaxAction: number
}>
