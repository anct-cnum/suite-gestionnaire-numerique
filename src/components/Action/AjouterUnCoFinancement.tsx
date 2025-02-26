import { FormEvent, ReactElement, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Icon from '../shared/Icon/Icon'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function AjouterUnCoFinancement({ label, labelId, coporteurs, onSubmit }: Props): ReactElement {
  const [coFinanceur, setCoFinanceur] = useState('')
  const [montant, setMontant] = useState('')
  return (
    <form
      method="dialog"
      onSubmit={handleSubmit}
    >
      <DrawerTitle id={labelId}>
        <Icon icon="calendar-event-line" />
        <br />
        {label}
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Précisez l‘origine du financement
      </p>
      <div className="fr-select-group">
        <label
          className="fr-label"
          htmlFor="cofinanceur"
        >
          Membre de la gouvernance
        </label>
        <select
          className="fr-select"
          id="cofinanceur"
          name="cofinanceur"
          onChange={(event) => {
            setCoFinanceur(event.target.value)
          }}
          required={true}
          value={coFinanceur}
        >
          <option
            hidden
            value=""
          >
            Choisir
          </option>
          {coporteurs.length > 0 && coporteurs.map((coporteur) => (
            <option
              key={coporteur.nom}
              value={coporteur.nom}
            >
              {coporteur.nom}
            </option>
          ))}
        </select>
      </div>
      <div >
        <label
          className="fr-label fr-mb-1w"
          htmlFor="montantDuFinancement"
        >
          Montant du financement
          {' '}
          <span className="color-red">
            *
          </span>
        </label>
      </div>
      <div>
        <input
          className="fr-input"
          id="montantDuFinancement"
          min={0}
          name="montantDuFinancement"
          onChange={(event) => {
            setMontant(event.target.value)
          }}
          placeholder="5 000"
          required={true}
          type="number"
          value={montant}
        />
      </div>
      <div className="fr-btns-group fr-mt-2w">
        <SubmitButton
          ariaControls="ajouter-un-cofinancement"
          isDisabled={!coFinanceur || !montant}
        >
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (coFinanceur && montant) {
      onSubmit(coFinanceur, montant)
      setCoFinanceur('')
      setMontant('')
    }
  }
}

type Props = Readonly<{
  label: string
  labelId: string
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
  onSubmit(coFinanceur: string, montant: string): void
}>
