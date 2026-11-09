'use client'

import { createContext, ReactElement, use, useMemo, useRef, useState } from 'react'
import { AriaLiveMessages, components, GroupBase, InputProps, MenuProps, StylesConfig } from 'react-select'
import AsyncSelect from 'react-select/async'

import { dsfrSelectStyles } from './styles'
import { rechercheTerritoiresPresenter, TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

const longueurMinimaleDeRecherche = 2
const delaiDeSaisieEnMillisecondes = 300

const stylePied = {
  borderTop: '1px solid var(--border-default-grey)',
  color: 'var(--text-mention-grey)',
  fontSize: '.75rem',
  lineHeight: '1.25rem',
  padding: '1.25rem 1rem .5rem',
} as const

// Identifiant du message d'erreur à relier au champ (aria-describedby), transmis au composant Input de react-select
const IdErreurContext = createContext<string | undefined>(undefined)

export default function RechercheTerritoire({
  id,
  label = 'Rechercher un territoire',
  onSelectionner,
  perimetreLimite = false,
  rechercher,
  valeurInitiale = null,
}: Props): ReactElement {
  const [saisie, setSaisie] = useState('')
  const [resultat, setResultat] = useState<null | Resultat>(null)
  const [termeSansResultat, setTermeSansResultat] = useState<null | string>(null)
  const [territoireSelectionne, setTerritoireSelectionne] = useState(valeurInitiale)
  const numeroDeRecherche = useRef(0)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  const enErreur = termeSansResultat !== null
  const idErreur = `${id}-erreur`
  const avecBoutonEffacer = saisie !== '' || territoireSelectionne !== null
  const composants = useMemo(
    () => ({
      DropdownIndicator: (): null => null,
      Input: ChampDeSaisie,
      LoadingIndicator: (): null => null,
      LoadingMessage: Chargement,
      Menu: enErreur ? (): null => null : creerMenu(resultat),
    }),
    [enErreur, resultat]
  )

  return (
    <div className={`fr-input-group${enErreur ? ' fr-input-group--error' : ''}`}>
      <label className="fr-label fr-mb-1w" htmlFor={id}>
        {label}
      </label>
      <div style={{ alignItems: 'stretch', display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <IdErreurContext value={enErreur ? idErreur : undefined}>
            <AsyncSelect<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>
              aria-invalid={enErreur ? true : undefined}
              ariaLiveMessages={annoncesEnFrancais(label, enErreur)}
              components={composants}
              inputId={id}
              inputValue={saisie}
              instanceId={id}
              loadOptions={chargerLesTerritoires}
              noOptionsMessage={() => 'Saisissez au moins 2 caractères pour lancer la recherche.'}
              onChange={(option) => {
                setTerritoireSelectionne(option)
                onSelectionner(option)
              }}
              onInputChange={(valeur, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                  setSaisie(valeur)
                  if (valeur.trim().length < longueurMinimaleDeRecherche) {
                    setTermeSansResultat(null)
                    setResultat(null)
                  }
                } else {
                  setSaisie('')
                }
              }}
              placeholder="Région, département, intercommunalité, ..."
              screenReaderStatus={({ count }) =>
                `${count} résultat${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`
              }
              styles={stylesRechercheTerritoire(enErreur, avecBoutonEffacer)}
              value={territoireSelectionne}
            />
          </IdErreurContext>
          {avecBoutonEffacer ? (
            <button
              aria-label="Effacer la recherche"
              onClick={effacer}
              style={{
                alignItems: 'center',
                background: 'none',
                color: 'var(--text-mention-grey)',
                display: 'flex',
                padding: 0,
                position: 'absolute',
                right: '.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              type="button"
            >
              <span aria-hidden="true" className="fr-icon-close-circle-fill fr-icon--sm" />
            </button>
          ) : null}
        </div>
        <BoutonLoupe />
      </div>
      <div role="status">
        {enErreur ? (
          <p className="fr-error-text" id={idErreur}>
            {'Aucun territoire ne correspond à « '}
            <strong>{termeSansResultat}</strong>
            {' »'}
          </p>
        ) : null}
      </div>
      {perimetreLimite && !enErreur ? <p className="fr-info-text">Recherche limitée à votre périmètre</p> : null}
    </div>
  )

  async function chargerLesTerritoires(recherche: string): Promise<Array<GroupBase<TerritoireViewModel>>> {
    const terme = recherche.trim()
    if (terme.length < longueurMinimaleDeRecherche) {
      return []
    }
    return new Promise((resolve) => {
      clearTimeout(debounce.current)
      debounce.current = setTimeout(() => {
        void lancerLaRecherche(terme).then(resolve)
      }, delaiDeSaisieEnMillisecondes)
    })
  }

  async function lancerLaRecherche(terme: string): Promise<Array<GroupBase<TerritoireViewModel>>> {
    numeroDeRecherche.current += 1
    const rechercheEnCours = numeroDeRecherche.current
    const viewModel = rechercheTerritoiresPresenter(await rechercher(terme))
    if (numeroDeRecherche.current !== rechercheEnCours) {
      return []
    }
    if (viewModel.total === 0) {
      setTermeSansResultat(terme)
      setResultat(null)
      return []
    }
    setTermeSansResultat(null)
    setResultat({ nombreAffiche: viewModel.nombreAffiche, terme, total: viewModel.total })
    return viewModel.groupes.map((groupe) => ({ label: groupe.label, options: [...groupe.options] }))
  }

  function effacer(): void {
    setSaisie('')
    setResultat(null)
    setTermeSansResultat(null)
    setTerritoireSelectionne(null)
    onSelectionner(null)
  }
}

type Props = Readonly<{
  id: string
  label?: string
  onSelectionner(territoire: null | TerritoireViewModel): void
  perimetreLimite?: boolean
  rechercher(terme: string): Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]>
  valeurInitiale?: null | TerritoireViewModel
}>

type Resultat = Readonly<{
  nombreAffiche: number
  terme: string
  total: number
}>

// Annonces du composant react-select, en anglais par défaut (critère RGAA 8.7)
function annoncesEnFrancais(
  label: string,
  enErreur: boolean
): AriaLiveMessages<TerritoireViewModel, false, GroupBase<TerritoireViewModel>> {
  return {
    guidance: ({ context, isInitialFocus, tabSelectsValue }) => {
      if (context === 'menu') {
        // En erreur, la liste est masquée : seul le message d'erreur est annoncé
        if (enErreur) {
          return ''
        }
        return `Utilisez les flèches haut et bas pour parcourir les résultats, Entrée pour sélectionner le résultat en surbrillance, Échap pour fermer la liste${
          tabSelectsValue ? ', Tabulation pour sélectionner le résultat et quitter la liste' : ''
        }.`
      }
      return context === 'input' && isInitialFocus
        ? `${label} : saisissez au moins 2 caractères pour lancer la recherche, puis utilisez la flèche bas pour parcourir les résultats.`
        : ''
    },
    onChange: ({ action, label: libelle, labels }) => {
      switch (action) {
        case 'deselect-option':
        case 'pop-value':
        case 'remove-value':
          return `Territoire désélectionné : ${libelle}.`
        case 'initial-input-focus':
          return labels.length === 0 ? '' : `Territoire sélectionné : ${labels.join(', ')}.`
        case 'select-option':
          return `Territoire sélectionné : ${libelle}.`
        default:
          return ''
      }
    },
    onFilter: ({ inputValue, resultsMessage }) =>
      inputValue === '' ? `${resultsMessage}.` : `${resultsMessage} pour la recherche « ${inputValue} ».`,
    onFocus: ({ context, focused, isAppleDevice, isSelected, label: libelle, options }) => {
      // Hors appareils Apple, react-select restitue l'option active via aria-activedescendant
      if (context !== 'menu' || !isAppleDevice) {
        return ''
      }
      const optionsAPlat = options.flatMap((option) => ('options' in option ? option.options : [option]))
      return `${libelle}${isSelected ? ', sélectionné' : ''}, ${optionsAPlat.indexOf(focused) + 1} sur ${optionsAPlat.length}.`
    },
  }
}

function ChampDeSaisie(
  props: Readonly<InputProps<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>>
): ReactElement {
  const idErreur = use(IdErreurContext)
  const descriptions = [props['aria-describedby'], idErreur].filter((description) => description !== undefined)
  return (
    <components.Input {...props} aria-describedby={descriptions.length === 0 ? undefined : descriptions.join(' ')} />
  )
}

function BoutonLoupe(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="fr-icon-search-line"
      style={{
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: 'var(--background-action-high-blue-france)',
        borderRadius: '0 .25rem 0 0',
        color: 'var(--text-inverted-blue-france)',
        display: 'flex',
        justifyContent: 'center',
        width: '2.5rem',
      }}
    />
  )
}

function Chargement(): ReactElement {
  return (
    <div>
      {[180, 300, 240].map((largeur) => (
        <div key={largeur} style={{ padding: '.75rem 1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--background-contrast-grey)',
              borderRadius: '.25rem',
              height: '1rem',
              maxWidth: '100%',
              width: `${largeur}px`,
            }}
          />
        </div>
      ))}
      <div style={stylePied}>Recherche en cours…</div>
    </div>
  )
}

function creerMenu(resultat: null | Resultat) {
  return function Menu(props: MenuProps<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>): ReactElement {
    return (
      <components.Menu {...props}>
        {props.children}
        {resultat === null ? null : <div style={stylePied}>{libelleDuPied(resultat)}</div>}
      </components.Menu>
    )
  }
}

function libelleDuPied(resultat: Resultat): ReactElement {
  if (resultat.total > resultat.nombreAffiche) {
    return (
      <>
        {`Seuls les ${resultat.nombreAffiche} premiers résultats sont affichés sur ${resultat.total}.`}
        <br />
        Affinez votre recherche pour réduire la liste.
      </>
    )
  }
  const libelle = resultat.total === 1 ? '1 territoire correspond à' : `${resultat.total} territoires correspondent à`
  return (
    <>
      {`${libelle} « `}
      <strong>{resultat.terme}</strong>
      {' »'}
    </>
  )
}

function stylesRechercheTerritoire(
  enErreur: boolean,
  avecBoutonEffacer: boolean
): StylesConfig<TerritoireViewModel, false, GroupBase<TerritoireViewModel>> {
  const base = dsfrSelectStyles<TerritoireViewModel>()
  return {
    ...base,
    control: (styles, state) => ({
      ...base.control?.(styles, state),
      borderRadius: '.25rem 0 0 0',
      boxShadow: `inset 0 -2px 0 0 ${enErreur ? 'var(--border-plain-error)' : 'var(--border-plain-grey)'}`,
      cursor: 'text',
      minHeight: '2.5rem',
      // Couleur de focus du DSFR, identique en thème clair et sombre, non exposée en variable CSS
      outline: state.isFocused ? '2px solid #0a76f6' : undefined,
      outlineOffset: '2px',
    }),
    group: (styles) => ({
      ...styles,
      padding: 0,
    }),
    groupHeading: (styles) => ({
      ...styles,
      borderBottom: '1px solid var(--border-default-grey)',
      color: 'var(--text-title-blue-france)',
      fontSize: '.75rem',
      fontWeight: 700,
      lineHeight: '1.25rem',
      margin: 0,
      padding: '1.25rem 1rem .5rem',
      textTransform: 'uppercase',
    }),
    input: (styles, state) => ({
      ...base.input?.(styles, state),
      color: 'var(--text-label-grey)',
      margin: 0,
      padding: 0,
    }),
    menu: (styles, state) => ({
      ...base.menu?.(styles, state),
      // Ombre portée de la maquette (les ombres du DSFR ne sont pas exposées en variables CSS)
      boxShadow: '0 8px 8px 0 rgba(0, 0, 0, .1)',
    }),
    menuList: (styles) => ({
      ...styles,
      padding: '.5rem 0',
    }),
    noOptionsMessage: (styles) => ({
      ...styles,
      ...stylePied,
      textAlign: 'left',
    }),
    option: (styles, state) => {
      let backgroundColor
      if (state.isSelected) {
        backgroundColor = 'var(--background-open-blue-france)'
      } else if (state.isFocused) {
        backgroundColor = 'var(--background-default-grey-hover)'
      }
      return {
        ...base.option?.(styles, state),
        ':active': {
          backgroundColor: 'var(--background-default-grey-active)',
        },
        backgroundColor,
        borderBottom: 'none',
        color: state.isSelected ? 'var(--text-title-blue-france)' : 'var(--text-default-grey)',
        fontWeight: state.isSelected ? 700 : undefined,
        lineHeight: '1.5rem',
        padding: '.625rem 1rem',
      }
    },
    placeholder: (styles) => ({
      ...styles,
      color: 'var(--text-mention-grey)',
      fontStyle: 'italic',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'var(--text-default-grey)',
      margin: 0,
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: avecBoutonEffacer ? '0 2.375rem 0 1rem' : '0 1rem',
    }),
  }
}
