import { ReactElement, useEffect, useId, useMemo, useRef, useState } from 'react'

import styles from './Action.module.css'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
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
  const inputMontantRhId = useId()
  const drawerId = 'drawerDemanderUneSubventionId'

  const drawer = useRef<HTMLDialogElement>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [budgetEnveloppe, setBudgetEnveloppe] = useState(0)
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
        className="fr-btn fr-btn--icon-left fr-fi-add-line"
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
          <TitleIcon icon="money-euro-circle-line" />
          <br />
          Demander une subvention
        </DrawerTitle>
        <p className="color-grey fr-text--sm">
          Saisissez le montant de la subvention que vous souhaitez obtenir de l’état.
          Dans la limite de
          {' '}
          {formatMontant(montantMaximal())}
          .
        </p>
        <div className="fr-select-group">
          <label
            className="fr-label"
            htmlFor={selectEnveloppeId}
          >
            Enveloppe de financement concernée
          </label>
          <select
            className="fr-select"
            defaultValue=""
            id={selectEnveloppeId}
            onChange={(event) => {
              setBudgetEnveloppe(enveloppeById[event.target.value].value)
            }}
          >
            <option
              disabled
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
        </div>
        <label
          className="fr-label"
          htmlFor={inputMontantPrestaId}
        >
          Montant en prestation de service
        </label>
        <input
          className="fr-input"
          disabled={!isBudgetEnveloppe}
          id={inputMontantPrestaId}
          max={montantMaximal(montantRh)}
          min="0"
          onInput={(event) => {
            setMontantPresta(Number(event.currentTarget.value))
          }}
          type="number"
        />
        <label
          className="fr-label fr-mt-3w"
          htmlFor={inputMontantRhId}
        >
          Montant en ressources humaines
        </label>
        <p className="fr-text--sm color-grey fr-mt-1w">
          Il s’agit d’une ressource humaine interne à la structure employeuse faisant partie de la
          gouvernance et récipiendaire des fonds. Format attendu : Montant
          {' '}
          <abbr title="Équivalent temps plein">
            ETP
          </abbr>
          {' '}
          en euros
        </p>
        <input
          className="fr-input"
          disabled={!isBudgetEnveloppe}
          id={inputMontantRhId}
          max={montantMaximal(montantPresta)}
          min="0"
          onInput={(event) => {
            setMontantRh(Number(event.currentTarget.value))
          }}
          type="number"
        />
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
            <>
              <hr />
              <li className="fr-text--bold fr-grid-row space-between fr-mb-1w">
                Total subventions demandées
                {' '}
                <span>
                  {formatMontant(subventionsDemandees)}
                </span>
              </li>
            </>
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

  function isSaisieValide(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const montantInputs = drawer.current!.querySelectorAll<HTMLInputElement>('input[type="number"]')
    return montantInputs.values().some(({ value }) => Boolean(value)) &&
      montantInputs.values().every(({ validity: { valid } }) => valid)
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

type Props = Readonly<{
  enveloppes: ActionViewModel['enveloppes']
  montantMaxAction: number
}>
