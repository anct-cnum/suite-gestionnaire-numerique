import { FormEvent, ReactElement, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
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
  label: string
  labelId: string
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
  onSubmit(coFinanceur: string, montant: string): void
}>
