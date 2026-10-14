'use client'

import { Accordion } from '@codegouvfr/react-dsfr/Accordion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useEffect, useId, useState } from 'react'

import styles from './FiltrePopover.module.css'
import { THEMATIQUE_ADMIN_OPTIONS, THEMATIQUE_NON_ADMIN_OPTIONS, TYPES_OPTIONS } from './filtresOptions'
import Badge from '@/components/shared/Badge/Badge'
import Modal from '@/components/shared/Modal/Modal'

const MODAL_ID = 'plus-de-filtres-modal'
const MODAL_LABEL_ID = 'plus-de-filtres-modal-titre'

const COULEURS_PORTEE: Readonly<Record<TagOption['portee'], string>> = {
  departemental: 'green-emeraude',
  equipe: 'purple-glycine',
  national: 'blue-ecume',
}

const LIBELLES_PORTEE: Readonly<Record<TagOption['portee'], string>> = {
  departemental: 'Tag départemental',
  equipe: 'Tag d’équipe',
  national: 'Tag national',
}

export default function PlusDesFiltres({
  tags,
  tagsDisponibles,
  thematiqueAdministratives,
  thematiqueNonAdministratives,
  types,
}: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const formId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const [pendingTypes, setPendingTypes] = useState(types)
  const [pendingNonAdmin, setPendingNonAdmin] = useState(thematiqueNonAdministratives)
  const [pendingAdmin, setPendingAdmin] = useState(thematiqueAdministratives)
  const [pendingTags, setPendingTags] = useState(tags)

  const pendingKey = `${types.join(',')}|${thematiqueNonAdministratives.join(',')}|${thematiqueAdministratives.join(',')}|${tags.join(',')}`
  useEffect(() => {
    setPendingTypes(types)
    setPendingNonAdmin(thematiqueNonAdministratives)
    setPendingAdmin(thematiqueAdministratives)
    setPendingTags(tags)
  }, [pendingKey])

  const activeCount =
    types.length + thematiqueNonAdministratives.length + thematiqueAdministratives.length + tags.length
  const isFilled = activeCount > 0
  const labelBouton = isFilled ? `Plus de filtres · ${activeCount}` : 'Plus de filtres'
  const tousLesTagsCoches = tagsDisponibles.every((tag) => pendingTags.includes(tag.value))

  const appliquer = useCallback(
    (
      selectedTypes: ReadonlyArray<string>,
      selectedNonAdmin: ReadonlyArray<string>,
      selectedAdmin: ReadonlyArray<string>,
      selectedTags: ReadonlyArray<string>
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

      if (selectedTags.length > 0) {
        params.set('tags', selectedTags.join(','))
      } else {
        params.delete('tags')
      }

      const queryString = params.toString().replaceAll('%2C', ',')
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
      setIsOpen(false)
    },
    [pathname, router, searchParams]
  )

  const valider = useCallback(() => {
    appliquer(pendingTypes, pendingNonAdmin, pendingAdmin, pendingTags)
  }, [appliquer, pendingAdmin, pendingNonAdmin, pendingTags, pendingTypes])

  const effacer = useCallback(() => {
    setPendingTypes([])
    setPendingNonAdmin([])
    setPendingAdmin([])
    setPendingTags([])
    appliquer([], [], [], [])
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
          appliquer(pendingTypes, pendingNonAdmin, pendingAdmin, pendingTags)
        }}
        id={MODAL_ID}
        isOpen={isOpen}
        labelId={MODAL_LABEL_ID}
        titre="Plus de filtres"
      >
        <div className="fr-modal__content">
          <form
            id={formId}
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

            {tagsDisponibles.length > 0 ? (
              <Accordion defaultExpanded label={<span className="fr-text--bold">Tags spécifiques</span>} titleAs="h2">
                <div className="fr-form-group">
                  {tagsDisponibles.length >= 2 ? (
                    <div className="fr-fieldset__element">
                      <div className="fr-checkbox-group fr-checkbox-group--sm">
                        <input
                          checked={tousLesTagsCoches}
                          id="tag-tous"
                          onChange={() => {
                            setPendingTags(tousLesTagsCoches ? [] : tagsDisponibles.map((tag) => tag.value))
                          }}
                          type="checkbox"
                        />
                        <label className="fr-label" htmlFor="tag-tous">
                          Tous les tags
                        </label>
                      </div>
                    </div>
                  ) : null}
                  <div style={{ columnCount: 2, columnGap: '1rem' }}>
                    {tagsDisponibles.map((opt) => (
                      <div className="fr-fieldset__element" key={opt.value} style={{ breakInside: 'avoid' }}>
                        <div className="fr-checkbox-group fr-checkbox-group--sm">
                          <input
                            aria-describedby={`tag-${opt.value}-portee`}
                            checked={pendingTags.includes(opt.value)}
                            id={`tag-${opt.value}`}
                            onChange={() => {
                              toggleValue(pendingTags, setPendingTags, opt.value)
                            }}
                            type="checkbox"
                          />
                          <label className="fr-label" htmlFor={`tag-${opt.value}`}>
                            {opt.label}
                          </label>
                        </div>
                        <Badge color={COULEURS_PORTEE[opt.portee]} id={`tag-${opt.value}-portee`} small>
                          {opt.departement === null
                            ? LIBELLES_PORTEE[opt.portee]
                            : `${LIBELLES_PORTEE[opt.portee]} (${opt.departement})`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
            ) : null}
          </form>
        </div>

        <div className="fr-modal__footer">
          <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
            <button className="fr-btn fr-btn--secondary" onClick={effacer} type="button">
              Effacer
            </button>
            <button className="fr-btn" form={formId} type="submit">
              Valider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

type Props = Readonly<{
  tags: ReadonlyArray<string>
  tagsDisponibles: ReadonlyArray<TagOption>
  thematiqueAdministratives: ReadonlyArray<string>
  thematiqueNonAdministratives: ReadonlyArray<string>
  types: ReadonlyArray<string>
}>

type TagOption = Readonly<{
  departement: null | string
  label: string
  portee: 'departemental' | 'equipe' | 'national'
  value: string
}>
