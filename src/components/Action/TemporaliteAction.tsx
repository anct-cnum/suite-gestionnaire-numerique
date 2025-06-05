import { ReactElement, useMemo, useState } from 'react'

import styles from '@/components/Action/Action.module.css'
import Select from '@/components/shared/Select/Select'
import { LabelValue } from '@/presenters/shared/labels'

export default function TemporaliteAction({ action, isReadOnly = false }: Props): ReactElement {
  const [temporalite, setTemporalite] = useState<temporalite>(action.anneeDeDebut === action.anneeDeFin || action.anneeDeFin === undefined ? 'annuelle' : 'pluriannuelle')

  let initAnneeDebut: string
  // eslint-disable-next-line no-restricted-syntax
  initAnneeDebut = new Date().getFullYear().toString()
  if(action.anneeDeDebut !== ''){
    initAnneeDebut = action.anneeDeDebut
  }
  const [selectedStartDate, setSelectedStartDate] = useState<string>(initAnneeDebut)

  const anneeDebut = Array.from({ length: 6 }, (_, index) => Number(initAnneeDebut) + index)
  const anneeFin = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => Number(selectedStartDate) + 1 + index)
  }, [selectedStartDate])
  return (
    <div
      className="white-background fr-p-4w fr-mb-2w"
      id="temporaliteAction"
    >
      <p className="fr-h6 fr-text--bold color-blue-france fr-mb-1w">
        Temporalité de l‘action
      </p>
      <p className="color-grey">
        Veuillez indiquer si cette action est annuelle ou pluriannuelle
      </p>
      <hr />
      <div
        className={`fr-radio-group ${styles['align-items']}`}
      >
        <div className={styles['select-width']}>
          <input
            checked={temporalite === 'annuelle'}
            disabled={isReadOnly}
            id="radio-annuelle"
            name="radio-inline"
            onChange={() => {
              if (!isReadOnly) {
                setTemporalite('annuelle')
              }
            }}
            type="radio"
            value="annuelle"
          />
          <label
            className="fr-label fr-mb-2w"
            htmlFor="radio-annuelle"
          >
            Annuelle
          </label>
          <Select
            disabled={isReadOnly}
            id="anneeDeDebut"
            name="anneeDeDebut"
            onChange={(event) => { 
              if (!isReadOnly) {
                setSelectedStartDate(event.target.value)
              }
            }}
            options={anneeDebut.map(toLabelValue(Number(selectedStartDate)))}
            placeholder="Sélectionnez l'année de début de l'action"
          >
            Année de début de l‘action
          </Select>
        </div>
        <div className={styles['select-width']}>
          <input
            checked={temporalite === 'pluriannuelle'}
            disabled={isReadOnly}
            id="radio-pluriannuelle"
            name="radio-pluriannuelle"
            onChange={() => {
              if (!isReadOnly) {
                setTemporalite('pluriannuelle')
              }
            }}
            type="radio"
            value="pluriannuelle"
          />
          <label
            className="fr-label fr-mb-2w"
            htmlFor="radio-pluriannuelle"
          >
            Pluriannuelle
          </label>
          <Select
            disabled={isReadOnly || temporalite !== 'pluriannuelle'}
            id="anneeDeFin"
            name="anneeDeFin"
            options={anneeFin.map(toLabelValue(Number(action.anneeDeFin)))}
            placeholder="Sélectionnez l'année de fin de l'action"
          >
            Année de fin de l‘action
          </Select>
        </div>
      </div>
    </div>
  )
}

type temporalite = 'annuelle' | 'pluriannuelle'

function toLabelValue(selected: number) {
  return (year: number): LabelValue<number> => ({
    isSelected: selected === year,
    label: `${year}`,
    value: year,
  })
}

type Props = Readonly<{
  action: Readonly<{
    anneeDeDebut: string
    anneeDeFin: string | undefined
  }>
  isReadOnly?: boolean
}>

