'use client'

import { ReactElement, SyntheticEvent, useId, useState } from 'react'

import SpinnerSimple from '../shared/Spinner/SpinnerSimple'

type TerritoireOption = Readonly<{
  code: string
  nom: string
}>

type Props = Readonly<{
  departements: ReadonlyArray<TerritoireOption>
  regions: ReadonlyArray<TerritoireOption>
}>

const ECHELON_NATIONAL = 'national'

export default function RapportsForm({ departements, regions }: Props): ReactElement {
  const echelonId = useId()
  const formatDocxId = useId()
  const formatPdfId = useId()
  const [echelon, setEchelon] = useState(ECHELON_NATIONAL)
  const [format, setFormat] = useState<'docx' | 'pdf'>('docx')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<null | string>(null)

  async function genererLeRapport(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErreur(null)
    setEnCours(true)
    try {
      const params = new URLSearchParams({ format })
      if (echelon === ECHELON_NATIONAL) {
        params.set('type', 'national')
      } else {
        const [type, code] = echelon.split(':')
        params.set('type', type)
        params.set('code', code)
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
      <form onSubmit={genererLeRapport}>
        <div className="fr-select-group" style={{ maxWidth: '512px' }}>
          <label className="fr-label" htmlFor={echelonId}>
            Échelon géographique
          </label>
          <select
            className="fr-select"
            disabled={enCours}
            id={echelonId}
            onChange={(event) => {
              setEchelon(event.target.value)
            }}
            value={echelon}
          >
            <option value={ECHELON_NATIONAL}>National</option>
            <optgroup label="Région">
              {regions.map((region) => (
                <option key={region.code} value={`region:${region.code}`}>
                  {region.nom}
                </option>
              ))}
            </optgroup>
            <optgroup label="Département">
              {departements.map((departement) => (
                <option key={departement.code} value={`departement:${departement.code}`}>
                  {departement.nom}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <fieldset className="fr-fieldset" disabled={enCours}>
          <legend className="fr-fieldset__legend fr-text--regular" id="formats-export-legend">
            Formats d’export
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
    </section>
  )
}

function nomFichier(contentDisposition: null | string, format: string): string {
  const correspondance = contentDisposition?.match(/filename="([^"]+)"/)
  return correspondance ? correspondance[1] : `rapport.${format}`
}
