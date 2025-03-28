import { FormEvent, ReactElement, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Select from '../shared/Select/Select'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function AjouterUnCoFinancement({ coporteurs, label, labelId, onSubmit }: Props): ReactElement {
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
      <div className="fr-mt-3w">
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
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
  label: string
  labelId: string
  onSubmit(coFinanceur: string, montant: string): void
}>
