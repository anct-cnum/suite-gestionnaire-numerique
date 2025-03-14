import { ReactElement, useEffect, useId, useMemo, useRef, useState } from 'react'

import styles from './Action.module.css'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import NumberInput from '../shared/NumberInput/NumberInput'
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
  const inputMontantRhId = useId()
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
        ref={drawer}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon icon="money-euro-circle-line" />
          <br />
          Demander une subvention
        </DrawerTitle>
        <fieldset className="fr-fieldset">
          <legend className="color-grey fr-text--sm">
            Saisissez le montant de la subvention que vous souhaitez obtenir de l’état.
            {' '}
            <span className="color-blue-france">
              {`Dans la limite de ${formatMontant(montantMaximal())}`}
            </span>
            {/**/}
            .
          </legend>
          <div className="fr-fieldset__element">
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
          </div>
          <div className="fr-fieldset__element">
            <NumberInput
              disabled={!isBudgetEnveloppe}
              displayValidationMessage={displayValidationMessage}
              icon="money-euro-circle-line"
              id={inputMontantPrestaId}
              max={montantMaximal(montantRh)}
              min={0}
              name="Montant en prestation de service"
              onInput={(event) => {
                setMontantPresta(Number(event.currentTarget.value))
              }}
              ref={inputMontantPrestaRef}
            >
              Montant en prestation de service
            </NumberInput>
          </div>
          <div className="fr-fieldset__element">
            <NumberInput
              disabled={!isBudgetEnveloppe}
              displayValidationMessage={displayValidationMessage}
              icon="money-euro-circle-line"
              id={inputMontantRhId}
              max={montantMaximal(montantPresta)}
              min={0}
              name="Montant en ressources humaines"
              onInput={(event) => {
                setMontantRh(Number(event.currentTarget.value))
              }}
              ref={inputMontantRhRef}
            >
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
            </NumberInput>
          </div>
        </fieldset>
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
            disabled={!(isBudgetEnveloppe && isValid)}
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
  return Object.assign(enveloppeById, { [enveloppe.value]: enveloppe })
}

function displayValidationMessage(input: HTMLInputElement): boolean {
  return Number(input.max) > 0
}

type Enveloppe = ActionViewModel['enveloppes'][number]

type EnveloppeById = Readonly<Record<string, Enveloppe>>

type Props = Readonly<{
  enveloppes: ActionViewModel['enveloppes']
  montantMaxAction: number
}>
