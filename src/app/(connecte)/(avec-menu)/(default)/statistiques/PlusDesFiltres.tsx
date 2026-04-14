'use client'

import { Accordion } from '@codegouvfr/react-dsfr/Accordion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import styles from './FiltrePopover.module.css'
import Modal from '@/components/shared/Modal/Modal'

const MODAL_ID = 'plus-de-filtres-modal'
const MODAL_LABEL_ID = 'plus-de-filtres-modal-titre'

export const TYPES_OPTIONS: ReadonlyArray<Readonly<{ label: string; value: string }>> = [
  { label: 'Accompagnement individuel', value: 'Individuel' },
  { label: 'Atelier collectif', value: 'Collectif' },
]

export const THEMATIQUE_NON_ADMIN_OPTIONS: ReadonlyArray<Readonly<{ label: string; value: string }>> = [
  { label: 'Diagnostic numérique', value: 'DiagnosticNumerique' },
  { label: 'Prendre en main du matériel', value: 'PrendreEnMainDuMateriel' },
  { label: 'Maintenance de matériel', value: 'MaintenanceDeMateriel' },
  { label: 'Gérer ses contenus numériques', value: 'GereSesContenusNumeriques' },
  { label: 'Navigation sur internet', value: 'NavigationSurInternet' },
  { label: 'E-mail', value: 'Email' },
  { label: 'Bureautique', value: 'Bureautique' },
  { label: 'Réseaux sociaux communication', value: 'ReseauxSociaux' },
  { label: 'Santé', value: 'Sante' },
  { label: 'Banque et achats en ligne', value: 'BanqueEtAchatsEnLigne' },
  { label: 'Accompagner un professionnel', value: 'Entrepreneuriat' },
  { label: 'Insertion professionnelle', value: 'InsertionProfessionnelle' },
  { label: 'Prévention en sécurité numérique', value: 'SecuriteNumerique' },
  { label: 'Parentalité', value: 'Parentalite' },
  { label: 'Scolarité et numérique', value: 'ScolariteEtNumerique' },
  { label: 'Créer avec le numérique', value: 'CreerAvecLeNumerique' },
  { label: 'Culture numérique', value: 'CultureNumerique' },
  { label: 'Intelligence artificielle (IA)', value: 'IntelligenceArtificielle' },
]

export const THEMATIQUE_ADMIN_OPTIONS: ReadonlyArray<Readonly<{ label: string; value: string }>> = [
  { label: 'Papiers - Élections - Citoyenneté', value: 'PapiersElectionsCitoyennete' },
  { label: 'Famille - Scolarité', value: 'FamilleScolarite' },
  { label: 'Social - Santé', value: 'SocialSante' },
  { label: 'Travail - Formation - Entreprise', value: 'TravailFormation' },
  { label: 'Logement', value: 'Logement' },
  { label: 'Transports - Mobilité', value: 'TransportsMobilite' },
  { label: 'Argent - Impôts', value: 'ArgentImpots' },
  { label: 'Justice', value: 'Justice' },
  { label: 'Étrangers - Europe', value: 'EtrangersEurope' },
  { label: 'Loisirs - Sports - Culture', value: 'LoisirsSportsCulture' },
  { label: 'Associations', value: 'Associations' },
]

export default function PlusDesFiltres({
  thematiqueAdministratives,
  thematiqueNonAdministratives,
  types,
}: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [pendingTypes, setPendingTypes] = useState(types)
  const [pendingNonAdmin, setPendingNonAdmin] = useState(thematiqueNonAdministratives)
  const [pendingAdmin, setPendingAdmin] = useState(thematiqueAdministratives)

  const pendingKey = `${types.join(',')}|${thematiqueNonAdministratives.join(',')}|${thematiqueAdministratives.join(',')}`
  useEffect(() => {
    setPendingTypes(types)
    setPendingNonAdmin(thematiqueNonAdministratives)
    setPendingAdmin(thematiqueAdministratives)
  }, [pendingKey])

  const activeCount = types.length + thematiqueNonAdministratives.length + thematiqueAdministratives.length
  const isFilled = activeCount > 0
  const labelBouton = isFilled ? `Plus de filtres · ${activeCount}` : 'Plus de filtres'

  const appliquer = useCallback(
    (
      selectedTypes: ReadonlyArray<string>,
      selectedNonAdmin: ReadonlyArray<string>,
      selectedAdmin: ReadonlyArray<string>
    ) => {
      const params = new URLSearchParams(searchParams.toString())

      if (selectedTypes.length > 0) {
        params.set('types', selectedTypes.join(','))
      } else {
        params.delete('types')
      }

      if (selectedNonAdmin.length > 0) {
        params.set('thematiqueNonAdministratives', selectedNonAdmin.join(','))
      } else {
        params.delete('thematiqueNonAdministratives')
      }

      if (selectedAdmin.length > 0) {
        params.set('thematiqueAdministratives', selectedAdmin.join(','))
      } else {
        params.delete('thematiqueAdministratives')
      }

      const queryString = params.toString().replaceAll('%2C', ',')
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
      setIsOpen(false)
    },
    [pathname, router, searchParams]
  )

  const valider = useCallback(() => {
    appliquer(pendingTypes, pendingNonAdmin, pendingAdmin)
  }, [appliquer, pendingAdmin, pendingNonAdmin, pendingTypes])

  const effacer = useCallback(() => {
    setPendingTypes([])
    setPendingNonAdmin([])
    setPendingAdmin([])
    appliquer([], [], [])
  }, [appliquer])

  function toggleValue(
    current: ReadonlyArray<string>,
    setter: (val: ReadonlyArray<string>) => void,
    value: string
  ): void {
    if (current.includes(value)) {
      setter(current.filter((val) => val !== value))
    } else {
      setter([...current, value])
    }
  }

  return (
    <div className={styles.container}>
      <button
        aria-expanded={isOpen}
        className={`fr-btn ${isFilled ? 'fr-btn--secondary' : 'fr-btn--tertiary'} fr-border-radius--4 ${isFilled ? styles.filled : ''} ${isOpen ? styles.open : ''}`}
        onClick={() => {
          setIsOpen(true)
        }}
        type="button"
      >
        <span aria-hidden className="fr-icon-equalizer-line fr-icon--sm fr-mr-1v" />
        {labelBouton}
      </button>

      <Modal
        close={() => {
          appliquer(pendingTypes, pendingNonAdmin, pendingAdmin)
        }}
        id={MODAL_ID}
        isOpen={isOpen}
        labelId={MODAL_LABEL_ID}
      >
        <div className="fr-modal__content">
          <h1 className="fr-modal__title" id={MODAL_LABEL_ID}>
            Plus de filtres
          </h1>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              valider()
            }}
          >
            <Accordion defaultExpanded label={<span className="fr-text--bold">Type d&apos;activité</span>} titleAs="h2">
              <div className="fr-form-group">
                {TYPES_OPTIONS.map((opt) => (
                  <div className="fr-fieldset__element" key={opt.value}>
                    <div className="fr-checkbox-group fr-checkbox-group--sm">
                      <input
                        checked={pendingTypes.includes(opt.value)}
                        id={`type-${opt.value}`}
                        onChange={() => {
                          toggleValue(pendingTypes, setPendingTypes, opt.value)
                        }}
                        type="checkbox"
                      />
                      <label className="fr-label" htmlFor={`type-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion
              defaultExpanded
              label={<span className="fr-text--bold">Thématiques médiation numérique</span>}
              titleAs="h2"
            >
              <div className="fr-form-group">
                <div style={{ columnCount: 2, columnGap: '1rem' }}>
                  {THEMATIQUE_NON_ADMIN_OPTIONS.map((opt) => (
                    <div className="fr-fieldset__element" key={opt.value} style={{ breakInside: 'avoid' }}>
                      <div className="fr-checkbox-group fr-checkbox-group--sm">
                        <input
                          checked={pendingNonAdmin.includes(opt.value)}
                          id={`thematique-${opt.value}`}
                          onChange={() => {
                            toggleValue(pendingNonAdmin, setPendingNonAdmin, opt.value)
                          }}
                          type="checkbox"
                        />
                        <label className="fr-label" htmlFor={`thematique-${opt.value}`}>
                          {opt.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>

            <Accordion
              defaultExpanded
              label={<span className="fr-text--bold">Thématiques démarches administratives</span>}
              titleAs="h2"
            >
              <div className="fr-form-group">
                <div style={{ columnCount: 2, columnGap: '1rem' }}>
                  {THEMATIQUE_ADMIN_OPTIONS.map((opt) => (
                    <div className="fr-fieldset__element" key={opt.value} style={{ breakInside: 'avoid' }}>
                      <div className="fr-checkbox-group fr-checkbox-group--sm">
                        <input
                          checked={pendingAdmin.includes(opt.value)}
                          id={`demarche-${opt.value}`}
                          onChange={() => {
                            toggleValue(pendingAdmin, setPendingAdmin, opt.value)
                          }}
                          type="checkbox"
                        />
                        <label className="fr-label" htmlFor={`demarche-${opt.value}`}>
                          {opt.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>

            <hr className="fr-separator-1px fr-my-6v" />
            <div className="fr-flex fr-flex-gap-4v" style={{ alignItems: 'center', flexDirection: 'row-reverse' }}>
              <button className="fr-btn" type="submit">
                Valider
              </button>
              <button className="fr-btn fr-btn--secondary" onClick={effacer} type="button">
                Effacer
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

type Props = Readonly<{
  thematiqueAdministratives: ReadonlyArray<string>
  thematiqueNonAdministratives: ReadonlyArray<string>
  types: ReadonlyArray<string>
}>
