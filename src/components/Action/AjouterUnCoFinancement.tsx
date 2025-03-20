import { FormEvent, ReactElement, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import NumberInput from '../shared/NumberInput/NumberInput'
import Select from '../shared/Select/Select'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
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
        <TitleIcon icon="money-euro-circle-line" />
        <br />
        {label}
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Précisez l‘origine du financement
      </p>
      <Select
        id="cofinanceur"
        name="cofinanceur"
        onChange={(event) => {
          setCoFinanceur(event.target.value)
        }}
        options={coporteurs.length > 0 ? coporteurs.map(({ nom }) => ({ label: nom, value: nom })) : []}
        required={true}
      >
        Membre de la gouvernance
      </Select>
      <div className="fr-input-group">
        <label
          className="fr-label fr-mb-1w"
          htmlFor="rechercheStructure"
        >
          Ou rechercher une autre structure
        </label>
        <div
          className="fr-search-bar full-width"
        >
          <input
            className="fr-input"
            id="rechercheStructure"
            placeholder="Numéro SIRET/RIDET, Nom, ..."
            type="text"
          />
          <button
            className="fr-btn"
            title="Rechercher"
            type="submit"
          >
            Rechercher
          </button>
        </div>
      </div>
      <NumberInput
        id="montantDuFinancement"
        min={0}
        name="montantDuFinancement"
        onInput={(event) => {
          setMontant(event.currentTarget.value)
        }}
        placeholder="5 000"
        required={true}
      >
        Montant du financement
      </NumberInput>
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
    onSubmit(coFinanceur, montant)
    setCoFinanceur('')
    setMontant('')
  }
}

type Props = Readonly<{
  label: string
  labelId: string
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
  onSubmit(coFinanceur: string, montant: string): void
}>
