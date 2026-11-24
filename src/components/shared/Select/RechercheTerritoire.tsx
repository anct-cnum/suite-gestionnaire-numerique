'use client'

import { createContext, ReactElement, ReactNode, use, useMemo, useRef, useState } from 'react'
import {
  AriaLiveMessages,
  components,
  GroupBase,
  GroupHeadingProps,
  InputProps,
  MenuProps,
  OptionProps,
  SelectInstance,
  StylesConfig,
} from 'react-select'
import AsyncSelect from 'react-select/async'

import classes from './RechercheTerritoire.module.css'
import { dsfrSelectStyles } from './styles'
import { rechercheTerritoiresPresenter, TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

const longueurMinimaleDeRecherche = 2
const delaiDeSaisieEnMillisecondes = 300

const classesDuPied = `fr-text--xs fr-mb-0 fr-pt-5v fr-px-2w fr-pb-2v ${classes.pied}`

// Consigne d'utilisation demandée par l'audit RGAA (critère 7.1), reliée au champ par aria-describedby
const consigne =
  "La liste des territoires apparaît automatiquement lorsqu'au moins 2 caractères sont saisis dans le champ. " +
  'Seuls les 5 premiers résultats seront affichés. Affinez votre recherche pour réduire la liste.'

// Identifiants à relier au champ (aria-describedby), transmis au composant Input de react-select
const DescriptionsContext = createContext<ReadonlyArray<string>>([])

export default function RechercheTerritoire({
  id,
  label = 'Rechercher un territoire',
  onSelectionner,
  onValider,
  perimetreLimite = false,
  rechercher,
  valeurInitiale = null,
}: Props): ReactElement {
  const [saisie, setSaisie] = useState('')
  const [resultat, setResultat] = useState<null | Resultat>(null)
  const [derniersResultats, setDerniersResultats] = useState<Array<GroupBase<TerritoireViewModel>>>([])
  const [termeSansResultat, setTermeSansResultat] = useState<null | string>(null)
  const [erreurDeValidation, setErreurDeValidation] = useState<ErreurDeValidation | null>(null)
  const [territoireSelectionne, setTerritoireSelectionne] = useState(valeurInitiale)
  const numeroDeRecherche = useRef(0)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)
  const champ = useRef<SelectInstance<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>>(null)

  // Mode « sélectionner puis valider » (vitrine) : la sélection ne déclenche aucune action, le bouton Rechercher valide
  const avecValidation = onValider !== undefined
  const sansResultat = termeSansResultat !== null
  const enErreur = sansResultat || erreurDeValidation !== null
  const idErreur = `${id}-erreur`
  const idConsigne = `${id}-consigne`
  const avecBoutonEffacer = saisie !== '' || territoireSelectionne !== null
  const composants = useMemo(
    () => ({
      DropdownIndicator: (): null => null,
      GroupHeading: IntituleDeGroupe,
      Input: ChampDeSaisie,
      LoadingIndicator: (): null => null,
      LoadingMessage: Chargement,
      Menu: sansResultat ? (): null => null : creerMenu(resultat),
      NoOptionsMessage: MessageSansOption,
      Option: OptionAvecEtatSelectionne,
    }),
    [sansResultat, resultat]
  )

  const champDeRecherche = (
    <div className={classes.champ}>
      <DescriptionsContext value={enErreur ? [idErreur, idConsigne] : [idConsigne]}>
        <AsyncSelect<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>
          aria-invalid={enErreur ? true : undefined}
          ariaLiveMessages={annoncesEnFrancais(sansResultat)}
          components={composants}
          defaultOptions={avecValidation ? derniersResultats : undefined}
          inputId={id}
          inputValue={saisie}
          instanceId={id}
          loadOptions={chargerLesTerritoires}
          noOptionsMessage={() => 'Saisissez au moins 2 caractères pour lancer la recherche.'}
          onChange={(option) => {
            setTerritoireSelectionne(option)
            setErreurDeValidation(null)
            onSelectionner?.(option)
          }}
          onInputChange={(valeur, actionMeta) => {
            if (actionMeta.action === 'input-change') {
              setSaisie(valeur)
              setErreurDeValidation(null)
              // Le texte affiché ne correspond plus au territoire choisi : la sélection est annulée
              if (avecValidation && territoireSelectionne !== null) {
                setTerritoireSelectionne(null)
              }
              if (valeur.trim().length < longueurMinimaleDeRecherche) {
                setTermeSansResultat(null)
                setResultat(null)
              }
            } else if (!avecValidation || actionMeta.action === 'set-value') {
              // En mode validation, la saisie reste dans le champ quand on le quitte (pour le bouton Rechercher)
              setSaisie('')
            }
          }}
          placeholder="Région, département, intercommunalité, ..."
          ref={champ}
          screenReaderStatus={({ count }) =>
            `${count} résultat${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`
          }
          styles={stylesRechercheTerritoire(enErreur, avecBoutonEffacer)}
          value={territoireSelectionne}
        />
      </DescriptionsContext>
      {avecBoutonEffacer ? (
        <button aria-label="Effacer la recherche" className={classes.boutonEffacer} onClick={effacer} type="button">
          <span aria-hidden="true" className="fr-icon-close-circle-fill fr-icon--sm" />
        </button>
      ) : null}
    </div>
  )

  const groupe = (
    <div className={`fr-input-group${enErreur ? ' fr-input-group--error' : ''}`}>
      <label className="fr-label fr-mb-1w" htmlFor={id}>
        {label}
      </label>
      {avecValidation ? (
        <div className="fr-input-wrap fr-input-wrap--addon">
          {champDeRecherche}
          <button className="fr-btn fr-btn--icon-left fr-icon-search-line" type="submit">
            Rechercher
          </button>
        </div>
      ) : (
        <div className={classes.champEtLoupe}>
          {champDeRecherche}
          <BoutonLoupe />
        </div>
      )}
      <p className="fr-sr-only" id={idConsigne}>
        {consigne}
      </p>
      <div role="status">{enErreur ? messageErreur() : null}</div>
      {perimetreLimite && !enErreur ? <p className="fr-info-text">Recherche limitée à votre périmètre</p> : null}
    </div>
  )

  return avecValidation ? (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        valider()
      }}
      role="search"
    >
      {groupe}
    </form>
  ) : (
    groupe
  )

  function messageErreur(): ReactElement {
    if (sansResultat) {
      return (
        <p className="fr-error-text" id={idErreur}>
          {'Aucun territoire ne correspond à « '}
          <strong>{termeSansResultat}</strong>
          {' »'}
        </p>
      )
    }
    return (
      <p className="fr-error-text" id={idErreur}>
        {erreurDeValidation === 'saisie-trop-courte'
          ? 'Saisissez au moins 2 caractères, puis sélectionnez un territoire dans la liste.'
          : 'Sélectionnez un territoire dans la liste des résultats.'}
      </p>
    )
  }

  function valider(): void {
    if (territoireSelectionne !== null) {
      onValider?.(territoireSelectionne)
      return
    }
    if (!sansResultat) {
      setErreurDeValidation(
        saisie.trim().length < longueurMinimaleDeRecherche ? 'saisie-trop-courte' : 'sans-selection'
      )
    }
    champ.current?.focus()
  }

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
    const groupes = viewModel.groupes.map((groupe) => ({ label: groupe.label, options: [...groupe.options] }))
    // Liste rouverte après une sélection : mêmes résultats, territoire choisi signalé (aria-selected)
    setDerniersResultats(groupes)
    return groupes
  }

  function effacer(): void {
    setSaisie('')
    setResultat(null)
    setDerniersResultats([])
    setTermeSansResultat(null)
    setErreurDeValidation(null)
    setTerritoireSelectionne(null)
    onSelectionner?.(null)
  }
}

type Props = Readonly<{
  id: string
  label?: string
  // Appelé à chaque sélection (application connectée : action immédiate)
  onSelectionner?(territoire: null | TerritoireViewModel): void
  // Appelé par le bouton Rechercher (vitrine) : la sélection seule ne déclenche rien
  onValider?(territoire: TerritoireViewModel): void
  perimetreLimite?: boolean
  rechercher(terme: string): Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]>
  valeurInitiale?: null | TerritoireViewModel
}>

type ErreurDeValidation = 'saisie-trop-courte' | 'sans-selection'

type Resultat = Readonly<{
  nombreAffiche: number
  terme: string
  total: number
}>

// Annonces du composant react-select, en anglais par défaut (critère RGAA 8.7). Aucune consigne d'utilisation
// dans la zone d'annonce (audit RGAA 7.1) : elle est portée par la description du champ.
function annoncesEnFrancais(
  sansResultat: boolean
): AriaLiveMessages<TerritoireViewModel, false, GroupBase<TerritoireViewModel>> {
  return {
    guidance: () => '',
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
    onFilter: ({ inputValue, resultsMessage }) => {
      // Sans résultat, la liste est masquée : seul le message d'erreur est annoncé
      if (sansResultat) {
        return ''
      }
      return inputValue === '' ? `${resultsMessage}.` : `${resultsMessage} pour la recherche « ${inputValue} ».`
    },
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
  const descriptionsDuChamp = use(DescriptionsContext)
  const descriptions = [...descriptionsDuChamp, props['aria-describedby']].filter(
    (description) => description !== undefined
  )
  return <components.Input {...props} aria-describedby={descriptions.join(' ')} />
}

// react-select retire aria-selected sur les appareils Apple : l'audit RGAA demande de le conserver partout
function OptionAvecEtatSelectionne(
  props: Readonly<OptionProps<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>>
): ReactElement {
  return <components.Option {...props} innerProps={{ ...props.innerProps, 'aria-selected': props.isSelected }} />
}

// Les textes de la liste qui ne sont pas des options sont des paragraphes (audit RGAA 7.1)
function IntituleDeGroupe(
  props: Readonly<GroupHeadingProps<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>>
): ReactElement {
  return (
    <p className={`fr-text--xs fr-text--bold fr-mb-0 fr-pt-5v fr-px-2w fr-pb-2v ${classes.intitule}`} id={props.id}>
      {props.children}
    </p>
  )
}

function MessageSansOption({ children }: Readonly<{ children?: ReactNode }>): ReactElement {
  return <p className={classesDuPied}>{children}</p>
}

function BoutonLoupe(): ReactElement {
  return <span aria-hidden="true" className={`fr-icon-search-line ${classes.loupe}`} />
}

function Chargement(): ReactElement {
  return (
    <div>
      {['courte', 'longue', 'moyenne'].map((ligne) => (
        <div className={`fr-py-3v fr-px-2w ${classes.ligneDeChargement}`} key={ligne}>
          <div className={classes.squelette} />
        </div>
      ))}
      <p className={classesDuPied}>Recherche en cours…</p>
    </div>
  )
}

function creerMenu(resultat: null | Resultat) {
  return function Menu(props: MenuProps<TerritoireViewModel, false, GroupBase<TerritoireViewModel>>): ReactElement {
    return (
      <components.Menu {...props}>
        {props.children}
        {resultat === null ? null : <p className={classesDuPied}>{libelleDuPied(resultat)}</p>}
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
    input: (styles, state) => ({
      ...base.input?.(styles, state),
      color: 'var(--text-label-grey)',
      margin: 0,
      padding: 0,
    }),
    menu: (styles, state) => ({
      ...base.menu?.(styles, state),
      // Fond des listes superposées du DSFR (react-select impose un blanc fixe, illisible en thème sombre)
      backgroundColor: 'var(--background-overlap-grey)',
      // Ombre portée de la maquette (les ombres du DSFR ne sont pas exposées en variables CSS)
      boxShadow: '0 8px 8px 0 rgba(0, 0, 0, .1)',
    }),
    menuList: (styles) => ({
      ...styles,
      padding: '.5rem 0',
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
