'use client'

// Adapté de la Coop : apps/web/src/app/coop/(sidemenu-layout)/mes-statistiques/_components/ExportStatistiques.tsx
import { useSearchParams } from 'next/navigation'
import { ReactElement, useState } from 'react'

import Modal from '@/components/shared/Modal/Modal'
import { Notification } from '@/components/shared/Notification/Notification'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'

const MODAL_ID = 'export-statistiques-modal'
const MODAL_LABEL_ID = 'export-statistiques-modal-titre'
const DELAI_FERMETURE_MODAL_AVANT_IMPRESSION = 200

export default function ExportStatistiques({ filtres }: Props): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [exportXlsxEnCours, setExportXlsxEnCours] = useState(false)
  const searchParams = useSearchParams()

  function exporterPdf(): void {
    setIsOpen(false)
    // Laisser le temps à la modal de se fermer avant d'ouvrir la boîte de dialogue d'impression.
    // Pas de notification : impossible de savoir si l'utilisateur a imprimé ou annulé.
    setTimeout(() => {
      window.print()
    }, DELAI_FERMETURE_MODAL_AVANT_IMPRESSION)
  }

  async function exporterXlsx(): Promise<void> {
    setExportXlsxEnCours(true)
    try {
      const params = searchParams.toString()
      const response = await fetch(params ? `/api/export/statistiques-xlsx?${params}` : '/api/export/statistiques-xlsx')
      if (!response.ok) {
        throw new Error(`Export xlsx en erreur (${response.status})`)
      }
      const blob = await response.blob()
      const nomFichier =
        (response.headers.get('content-disposition') ?? '').match(/filename="(?<nom>[^"]+)"/)?.groups?.nom ??
        'statistiques.xlsx'
      const url = URL.createObjectURL(blob)
      const lien = document.createElement('a')
      lien.href = url
      lien.download = nomFichier
      lien.click()
      URL.revokeObjectURL(url)
      setIsOpen(false)
      Notification('success', {
        description: 'est terminé.',
        title: 'Le téléchargement de vos statistiques ',
      })
    } catch {
      Notification('error', {
        description: 'a échoué. Veuillez réessayer.',
        title: 'Le téléchargement de vos statistiques ',
      })
    } finally {
      setExportXlsxEnCours(false)
    }
  }

  return (
    <>
      <button
        className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-download-line"
        onClick={() => {
          setIsOpen(true)
        }}
        type="button"
      >
        Exporter
      </button>
      <Modal
        close={() => {
          setIsOpen(false)
        }}
        id={MODAL_ID}
        isOpen={isOpen}
        labelId={MODAL_LABEL_ID}
        titre="Exporter les statistiques"
      >
        <div className="fr-modal__content">
          {filtres.length > 0 ? (
            <div className="fr-my-6v">
              <p className="fr-mb-2v">Vous avez appliqué les filtres suivants&nbsp;:</p>
              <ul className="fr-tags-group">
                {filtres.map((filtre) => (
                  <li className="fr-line-height-1" key={filtre.cle}>
                    <span className="fr-tag fr-tag--sm">{filtre.libelle}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="fr-my-6v">
              Vous n&apos;avez pas appliqué de filtre, toutes les statistiques seront exportées.
            </p>
          )}
          <div className="fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1 fr-mt-4v fr-mb-6v fr-border-radius--8">
            <div className="fr-background-alt--blue-france fr-p-3v fr-border-radius--8 fr-flex" aria-hidden>
              <span className="fr-icon-chat-poll-fill ri-lg fr-line-height-1 fr-text-label--blue-france" />
            </div>
            <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--medium fr-mb-0 fr-flex-grow-1">
              Statistiques
            </div>
            <button
              className="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-icon-download-line"
              disabled={exportXlsxEnCours}
              onClick={exporterPdf}
              title="Télécharger les statistiques au format PDF"
              type="button"
            >
              PDF
            </button>
            {exportXlsxEnCours ? (
              <SpinnerSimple size="small" text="Export en cours..." />
            ) : (
              <button
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-right fr-icon-download-line"
                onClick={exporterXlsx}
                title="Télécharger les statistiques au format xlsx"
                type="button"
              >
                Tableur (xlsx)
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

type Props = Readonly<{
  filtres: ReadonlyArray<Readonly<{ cle: string; libelle: string }>>
}>
