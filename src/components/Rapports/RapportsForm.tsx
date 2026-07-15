'use client'

import Image from 'next/image'
import { ReactElement, SyntheticEvent, useId, useMemo, useState } from 'react'

import Select from '../shared/Select/Select'
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
              <div className="fr-mb-3w">
                <Select<EchelonOption>
                  disabled={enCours}
                  formatOptionLabel={(option) => (
                    <span className={option.type === 'region' ? 'fr-text--bold' : ''}>{option.label}</span>
                  )}
                  id="echelon"
                  name="echelon"
                  onChange={(option) => {
                    if (option) {
                      setEchelon(option)
                    }
                  }}
                  options={options}
                  value={echelon.value}
                >
                  Échelon géographique
                </Select>
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
