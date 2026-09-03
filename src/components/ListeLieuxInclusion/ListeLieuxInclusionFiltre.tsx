'use client'

import { ReactElement, useEffect, useId, useState } from 'react'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import Checkbox from '../shared/Checkbox/Checkbox'
import Select from '../shared/Select/Select'
import { TypologieRole } from '@/domain/Role'
import { cleGeographiqueParType, territoireDepuisCodes } from '@/presenters/rechercheTerritoiresPresenter'
import { FiltresLieuxInclusionInternes } from '@/shared/filtresLieuxInclusionUtils'
import { libellesFraicheur, SlugFraicheur, slugParCouleurFraicheur, temporalitesFraicheur } from '@/shared/fraicheur'

const optionsFraicheur: ReadonlyArray<Readonly<{ label: string; value: '' | SlugFraicheur }>> = [
  { label: 'Tous', value: '' },
  ...(['blue', 'yellow', 'orange', 'red'] as const).map((couleur) => ({
    label: `${libellesFraicheur[couleur]} (${temporalitesFraicheur[couleur]})`,
    value: slugParCouleurFraicheur[couleur],
  })),
]

export default function ListeLieuxInclusionFiltre({
  closeDrawer,
  currentFilters,
  onFilterAction,
  onResetAction,
  utilisateurRole,
}: Props): ReactElement {
  const [selectedZone, setSelectedZone] = useState(territoireDepuisCodes(currentFilters))
  const [cleReinitialisation, setCleReinitialisation] = useState(0)
  const [isQpvSelected, setIsQpvSelected] = useState(currentFilters.qpv)
  const [isFrrSelected, setIsFrrSelected] = useState(currentFilters.frr)
  const [isHorsZonePrioritaireSelected, setIsHorsZonePrioritaireSelected] = useState(currentFilters.horsZonePrioritaire)
  const [selectedFraicheur, setSelectedFraicheur] = useState<'' | SlugFraicheur>(currentFilters.fraicheur ?? '')

  const qpvCheckboxId = useId()
  const frrCheckboxId = useId()
  const horsZonePrioritaireCheckboxId = useId()
  const fraicheurSelectId = useId()
  const peutFiltrerGeographiquement =
    utilisateurRole === 'Administrateur dispositif' || utilisateurRole === 'Gestionnaire région'

  const typologiesTerritoire = [
    {
      checked: isQpvSelected,
      id: qpvCheckboxId,
      label: 'QPV',
      name: 'qpv',
      onChange: setIsQpvSelected,
    },
    {
      checked: isFrrSelected,
      id: frrCheckboxId,
      label: 'FRR',
      name: 'frr',
      onChange: setIsFrrSelected,
    },
    {
      checked: isHorsZonePrioritaireSelected,
      id: horsZonePrioritaireCheckboxId,
      label: 'Hors zone prioritaire',
      name: 'horsZonePrioritaire',
      onChange: setIsHorsZonePrioritaireSelected,
    },
  ]

  // Synchroniser l'état du filtre avec les filtres actuels
  useEffect(() => {
    setSelectedZone(territoireDepuisCodes(currentFilters))
    setIsQpvSelected(currentFilters.qpv)
    setIsFrrSelected(currentFilters.frr)
    setIsHorsZonePrioritaireSelected(currentFilters.horsZonePrioritaire)
    setSelectedFraicheur(currentFilters.fraicheur ?? '')
  }, [currentFilters])

  function handleApplyFilters(): void {
    const params = new URLSearchParams()

    // Filtre géographique - administrateurs (France entière) et gestionnaires région (leur région)
    if (peutFiltrerGeographiquement && selectedZone) {
      params.set(cleGeographiqueParType[selectedZone.type], selectedZone.code)
    }

    if (isQpvSelected) {
      params.set('qpv', 'true')
    }
    if (isFrrSelected) {
      params.set('frr', 'true')
    }
    if (isHorsZonePrioritaireSelected) {
      params.set('horsZonePrioritaire', 'true')
    }
    if (selectedFraicheur !== '') {
      params.set('fraicheur', selectedFraicheur)
    }

    onFilterAction(params)
    closeDrawer()
  }

  function handleReset(): void {
    setCleReinitialisation((cle) => cle + 1)
    setSelectedZone(null)
    setIsQpvSelected(false)
    setIsFrrSelected(false)
    setIsHorsZonePrioritaireSelected(false)
    setSelectedFraicheur('')
    onResetAction()
    closeDrawer()
  }

  return (
    <div>
      {peutFiltrerGeographiquement && (
        <>
          <FiltrerParZonesGeographiques
            key={cleReinitialisation}
            onSelectionner={setSelectedZone}
            source={utilisateurRole === 'Administrateur dispositif' ? 'complet' : 'perimetre'}
            valeurInitiale={selectedZone}
          />
          <hr className="fr-hr" />
        </>
      )}

      <Select
        id={fraicheurSelectId}
        onChange={(option) => {
          setSelectedFraicheur(option?.value ?? '')
        }}
        options={optionsFraicheur}
        value={selectedFraicheur}
      >
        Statut des données
      </Select>
      <hr className="fr-hr" />

      <div className="fr-fieldset">
        <legend className="fr-fieldset__legend fr-text--regular">Typologie de territoire</legend>
        {typologiesTerritoire.map(({ checked, id, label, name, onChange }) => (
          <Checkbox
            id={id}
            isSelected={checked}
            key={name}
            label={name}
            onChange={(event) => {
              onChange(event.target.checked)
            }}
            value={name}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <div className="fr-btns-group fr-mt-3w">
        <button className="fr-btn" onClick={handleApplyFilters} type="button">
          Afficher les lieux
        </button>
        <button className="fr-btn fr-btn--secondary" onClick={handleReset} type="button">
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

type Props = Readonly<{
  closeDrawer(): void
  currentFilters: FiltresLieuxInclusionInternes
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
  utilisateurRole: TypologieRole
}>
