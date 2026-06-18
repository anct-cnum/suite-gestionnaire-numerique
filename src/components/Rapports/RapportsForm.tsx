'use client'

import Image from 'next/image'
import { ReactElement, SyntheticEvent, useId, useMemo, useState } from 'react'
import ReactSelect, { StylesConfig } from 'react-select'

import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import { regionsEtDepartements } from '@/presenters/filtresUtilisateurPresenter'

type EchelonOption = Readonly<{
  label: string
  type: 'departement' | 'national' | 'region'
  value: string
}>

const optionNational: EchelonOption = { label: 'National', type: 'national', value: 'national' }

export default function RapportsForm(): ReactElement {
  const formatDocxId = useId()
  const formatPdfId = useId()
  const [echelon, setEchelon] = useState(optionNational)

  const options = useMemo<ReadonlyArray<EchelonOption>>(
    () => [
      optionNational,
      ...regionsEtDepartements()
        .filter((zone) => zone.value !== 'all')
        .map((zone): EchelonOption => ({ label: zone.label, type: zone.type, value: zone.value })),
    ],
    []
  )
  const [format, setFormat] = useState<'docx' | 'pdf'>('docx')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<null | string>(null)

  async function genererLeRapport(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErreur(null)
    setEnCours(true)
    try {
      const params = new URLSearchParams({ format })
      if (echelon.type === 'national') {
        params.set('type', 'national')
      } else if (echelon.type === 'region') {
        const codeRegion = echelon.value.split('_')[0]
        params.set('type', 'region')
        params.set('code', codeRegion)
      } else {
        const codeDepartement = echelon.value.split('_')[1]
        params.set('type', 'departement')
        params.set('code', codeDepartement)
      }

      const response = await fetch(`/api/rapport?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Statut ${response.status}`)
      }

      const blob = await response.blob()
      const lienTelechargement = window.URL.createObjectURL(blob)
      const lien = document.createElement('a')
      lien.href = lienTelechargement
      lien.download = nomFichier(response.headers.get('content-disposition'), format)
      document.body.appendChild(lien)
      lien.click()
      document.body.removeChild(lien)
      window.URL.revokeObjectURL(lienTelechargement)
    } catch (error) {
      console.error('Erreur lors de la génération du rapport :', error)
      setErreur('La génération du rapport a échoué. Veuillez réessayer.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <section
      className="fr-p-4w fr-mt-4w"
      style={{ border: '1px solid var(--border-default-grey)', borderRadius: '8px' }}
    >
      <h2 className="fr-h6">Paramètres du rapport</h2>
      <hr />
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-8">
          <form onSubmit={genererLeRapport}>
            <div style={{ maxWidth: '512px' }}>
              <div className="fr-select-group fr-mb-3w">
                <label className="fr-label fr-mb-1w" htmlFor="echelon">
                  Échelon géographique
                </label>
                <ReactSelect<EchelonOption>
                  components={{ DropdownIndicator }}
                  inputId="echelon"
                  instanceId="echelon"
                  isClearable={false}
                  isDisabled={enCours}
                  name="echelon"
                  onChange={(option) => {
                    if (option) {
                      setEchelon(option)
                    }
                  }}
                  options={options as Array<EchelonOption>}
                  styles={selectStyles}
                  value={echelon}
                />
              </div>
            </div>

            <fieldset className="fr-fieldset" disabled={enCours}>
              <legend className="fr-fieldset__legend fr-text--regular" id="formats-export-legend">
                Formats d&#39;export
              </legend>
              <div className="fr-fieldset__content">
                <div className="fr-radio-group">
                  <input
                    checked={format === 'docx'}
                    id={formatDocxId}
                    name="format"
                    onChange={() => {
                      setFormat('docx')
                    }}
                    type="radio"
                    value="docx"
                  />
                  <label className="fr-label" htmlFor={formatDocxId}>
                    Word (.docx)
                  </label>
                </div>
                <div className="fr-radio-group">
                  <input
                    checked={format === 'pdf'}
                    id={formatPdfId}
                    name="format"
                    onChange={() => {
                      setFormat('pdf')
                    }}
                    type="radio"
                    value="pdf"
                  />
                  <label className="fr-label" htmlFor={formatPdfId}>
                    PDF
                  </label>
                </div>
              </div>
            </fieldset>

            {erreur === null ? null : (
              <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w" role="alert">
                <p>{erreur}</p>
              </div>
            )}

            <button className="fr-btn fr-btn--icon-left fr-icon-download-line" disabled={enCours} type="submit">
              Générer le rapport
            </button>

            {enCours ? <SpinnerSimple text="Génération du rapport en cours…" /> : null}
          </form>
        </div>
        <div
          className="fr-col-md-4 fr-hidden fr-unhidden-md"
          style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}
        >
          <Image alt="" height={300} src="/illustration-rapports.png" width={300} />
        </div>
      </div>
    </section>
  )
}

function nomFichier(contentDisposition: null | string, format: string): string {
  const correspondance = contentDisposition?.match(/filename="([^"]+)"/)
  return correspondance ? correspondance[1] : `rapport.${format}`
}

// istanbul ignore next @preserve
const selectStyles: StylesConfig<EchelonOption> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (styles, { data, isFocused, isSelected }) => {
    const colorOfFocus = isFocused ? '#dfdfdf' : undefined
    const backgroundColor = isSelected ? '#bbb' : colorOfFocus
    const borderBottom = data.type === 'region' ? '1px solid #ddd' : undefined
    const fontWeight = data.type === 'region' ? '900' : undefined

    return {
      ...styles,
      backgroundColor,
      borderBottom,
      color: '#222',
      cursor: 'pointer',
      fontWeight,
    }
  },
}

function DropdownIndicator(): ReactElement {
  return (
    <svg height="24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="m12 13.1 5-4.9 1.4 1.4-6.4 6.3-6.4-6.4L7 8.1l5 5z" />
    </svg>
  )
}
