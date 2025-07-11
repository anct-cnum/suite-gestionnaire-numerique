import { ReactElement, useContext, useEffect, useMemo, useState } from 'react'

import styles from './Action.module.css'
import Drawer from '@/components/shared/Drawer/Drawer'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { gouvernanceContext } from '@/components/shared/GouvernanceContext'
import MontantInput from '@/components/shared/Montant/MontantInput'
import { MontantPositif } from '@/components/shared/Montant/MontantPositif'
import { Notification } from '@/components/shared/Notification/Notification'
import Select from '@/components/shared/Select/Select'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { Optional } from '@/shared/Optional'

export default function AjouterUnCoFinancement(
  { ajoutCoFinanceur, budgetGlobal, label, labelId }: Props
): ReactElement {
  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  const membresGouvernanceConfirme = gouvernanceViewModel.porteursPotentielsNouvellesFeuillesDeRouteOuActions

  const [coFinanceur, setCoFinanceur] = useState('')
  const [montant, setMontant] = useState<Optional<MontantPositif>>(() => Optional.empty())
  const showButton = useMemo(() => false, [])
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  useEffect(() => {
    setCoFinanceur('')
    setMontant(Optional.empty())
    resetPorteurToutEffacer()
  }, [isDrawerOpen])

  return (
    <>
      <button
        aria-controls="ajouter-un-cofinancement"
        className={`fr-btn fr-btn--icon-left fr-fi-add-line ${styles['third-width']}`}
        data-fr-opened={isDrawerOpen}
        disabled={MontantPositif.of(String(budgetGlobal)).orElse(MontantPositif.Zero).lessThan(MontantPositif.of('1'))}
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        title="Ajouter des coFinancements"
        type="button"
      >
        Ajouter un financement
      </button>
      <Drawer
        boutonFermeture="Fermer"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id="ajouter-un-cofinancement"
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId="ajouter-un-cofinancement-label"
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
          options={membresGouvernanceConfirme.length > 0
            ? membresGouvernanceConfirme
              .map(({ id, nom }) => ({ label: nom, value: id })) : []}
        >
          Membre de la gouvernance
        </Select>
        {showButton ?
          <div
            className="fr-search-bar full-width"
          >
            <label
              className="fr-label fr-mb-1w"
              htmlFor="rechercheStructure"
            >
              Ou rechercher une autre structure
            </label>
            <input
              className="fr-input"
              id="rechercheStructure"
              placeholder="Numéro SIRET/RIDET, Nom, ..."
              type="text"
            />
            <button
              className="fr-btn"
              title="Rechercher"
              type="button"
            >
              Rechercher
            </button>
          </div> : null}
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
        <MontantInput
          id="montantDuFinancement"
          montantInitial={montant}
          onChange={(montant) => { setMontant(montant) }}
        />
        <div className="fr-btns-group fr-mt-2w">
          <button
            className="fr-btn"
            disabled={coFinanceur === '' ||
              montant.orElse(MontantPositif.Zero).lessThan(MontantPositif.of('1'))}
            onClick={handleSubmit}
            type="button"
          >
            Enregistrer
          </button>
        </div>
      </Drawer>

    </>
  )

  function resetPorteurToutEffacer(): void {
    const select = document.getElementById('cofinanceur')
    if (select instanceof HTMLSelectElement) {
      select.value = ''
    }
  }

  function handleSubmit(): void {
    if(montant.isEmpty())
    {
      Notification('error', { description: 'Le montant doit être présent' , title: 'Erreur : ' })
      return
    }
    ajoutCoFinanceur(coFinanceur, montant.orElseThrow(() => new Error('Le montant doit être présent')))
    setCoFinanceur('')
    setMontant(Optional.empty())
    setIsDrawerOpen(false)
  }
}

type Props = Readonly<{
  ajoutCoFinanceur(coFinanceur: string, montant: MontantPositif): void
  budgetGlobal: number
  label: string
  labelId: string
}>
