'use client'

import { FormEvent, PropsWithChildren, ReactElement, useEffect, useId, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import RadioGroup from '../shared/Radio/RadioGroup'
import Select from '../shared/Select/Select'
import TextInput from '../shared/TextInput/TextInput'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { LabelValue } from '@/presenters/shared/labels'

export default function FormulaireFeuilleDeRoute({
  children,
  label,
  labelId,
  membres,
  nom,
  perimetreActuel,
  perimetres,
  resetPerimetre,
  validerFormulaire,
}: Props): ReactElement {
  const nomId = useId()
  const [perimetreSelectionne, setPerimetreSelectionne] = useState(perimetreActuel ?? '')

  useEffect(() => {
    setPerimetreSelectionne(perimetreActuel ?? '')
  }, [perimetreActuel])

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    validerFormulaire(event)
    if (resetPerimetre === true) {
      setPerimetreSelectionne('')
    }
  }
  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon icon="survey-line" />
        <br />
        {label}
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Les champs avec
        {' '}
        <span className="color-red">
          *
        </span>
        {' '}
        sont obligatoires.
      </p>
      <form
        aria-label={label}
        method="dialog"
        onSubmit={handleSubmit}
      >
        <TextInput
          defaultValue={nom}
          id={nomId}
          name="nom"
          required={true}
        >
          Quel est le nom de la feuille de route ?
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <Select
          id="membres"
          isPlaceholderSelectable={true}
          name="membre"
          options={membres}
          required={true}
        >
          Quel membre de la gouvernance porte la feuille de route ?
          {' '}
          <span className="color-red">
            *
          </span>
        </Select>
        <fieldset className="fr-fieldset">
          <legend className="fr-mb-2w">
            Quel est le périmètre géographique de la feuille de route ?
            {' '}
            <span className="color-red">
              *
            </span>
          </legend>
          <RadioGroup
            nomGroupe="perimetre"
            onChange={(event) => { setPerimetreSelectionne(event.target.value) }}
            options={perimetres}
            value={perimetreSelectionne}
          />
        </fieldset>
        <div className="fr-btns-group">
          {children}
        </div>
      </form>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  label: string
  labelId: string
  membres: ReadonlyArray<LabelValue>
  nom: string
  perimetreActuel?: string
  perimetres: ReadonlyArray<LabelValue>
  resetPerimetre?: boolean
  validerFormulaire(event: FormEvent<HTMLFormElement>): void
}>>
