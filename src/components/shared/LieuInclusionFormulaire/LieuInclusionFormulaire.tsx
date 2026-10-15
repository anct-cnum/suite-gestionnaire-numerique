'use client'

import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import LieuxDejaDeclares from '@/components/shared/LieuxDejaDeclares/LieuxDejaDeclares'
import { Notification } from '@/components/shared/Notification/Notification'
import SelectAsync from '@/components/shared/Select/SelectAsync'
import SelectMulti from '@/components/shared/Select/SelectMulti'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'
import { LabelValue } from '@/presenters/shared/labels'
import { typologieLabels } from '@/presenters/shared/typologie'

// Champs communs à la création (#1495) et à la modification (#1498) d'un lieu. Formulaire
// unique (maquettes V6) : le SIRET est optionnel et ne sert qu'à pré-remplir le nom et
// l'adresse, qui restent saisissables, comme tous les autres champs. L'adresse est validée
// par la BAN. L'état utile à la soumission remonte au parent par onChangement.
export default function LieuInclusionFormulaire({
  idPrefixe,
  lieuxDejaDeclares,
  onChangement,
  valeursInitiales,
}: Props): ReactElement {
  const { rechercherAdressesAction, rechercherUneEntrepriseAction } = useContext(clientContext)
  const [etat, setEtat] = useState({
    adresse: valeursInitiales.adresse,
    nom: valeursInitiales.nomStructure,
    siretSaisi: valeursInitiales.siret ?? '',
  })
  const [rechercheEnCours, setRechercheEnCours] = useState(false)

  const typologiesActuelles = valeursInitiales.typologies ?? []
  const typologiesOptions: ReadonlyArray<LabelValue> = Object.values(Typologie).map((typologie) => ({
    isSelected: typologiesActuelles.includes(typologie),
    label: typologieLabels[typologie],
    value: typologie,
  }))

  function mettreAJour(partiel: Partial<EtatLieuInclusionFormulaire>): void {
    const nouvelEtat = { ...etat, ...partiel }
    setEtat(nouvelEtat)
    onChangement(nouvelEtat)
  }

  // Le SIRET est un accélérateur de saisie : il remplit le nom et l'adresse, que
  // l'utilisateur reste libre de corriger ensuite.
  async function rechercherEntreprise(): Promise<void> {
    setRechercheEnCours(true)

    const resultat = await rechercherUneEntrepriseAction({ siret: etat.siretSaisi })
    if ('identifiant' in resultat) {
      mettreAJour({ adresse: resultat.adresse, nom: resultat.denomination })
    } else {
      Notification('error', { description: resultat.join(', '), title: 'Erreur : ' })
    }

    setRechercheEnCours(false)
  }

  return (
    <>
      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-siret`}>
          N° SIRET du lieu (optionnel)
          <span className="fr-hint-text">
            Gagnez du temps : le nom et l’adresse du lieu se remplissent automatiquement.
          </span>
        </label>
        <div className="fr-grid-row fr-grid-row--bottom">
          <div className="fr-col">
            <input
              className="fr-input"
              id={`${idPrefixe}-siret`}
              name="siret"
              onChange={(event) => {
                mettreAJour({ siretSaisi: event.target.value })
              }}
              type="text"
              value={etat.siretSaisi}
            />
          </div>
          <div className="fr-col-auto fr-pl-2w">
            <button
              className="fr-btn fr-icon-search-line fr-btn--icon-left"
              disabled={rechercheEnCours || etat.siretSaisi === ''}
              onClick={() => {
                void rechercherEntreprise()
              }}
              type="button"
            >
              {rechercheEnCours ? 'Recherche en cours...' : 'Rechercher'}
            </button>
          </div>
        </div>
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-nom`}>
          Nom du lieu d’activité <span className="color-red">*</span>
          <span className="fr-hint-text">
            Nom usuel affiché sur la cartographie, par exemple « Espace numérique de la mairie ».
          </span>
        </label>
        <input
          className="fr-input"
          id={`${idPrefixe}-nom`}
          name="nom"
          onChange={(event) => {
            mettreAJour({ nom: event.target.value })
          }}
          required={true}
          type="text"
          value={etat.nom}
        />
      </div>

      <div className="fr-mb-2w">
        <SelectMulti
          id={`${idPrefixe}-typologies`}
          name="typologies"
          options={typologiesOptions}
          placeholder="Choisissez une ou plusieurs typologies"
          required={true}
        >
          Typologie(s) du lieu d’activité <span className="color-red">*</span>
        </SelectMulti>
      </div>

      <div className="fr-mb-2w">
        <SelectAsyncAdresse
          adresse={etat.adresse}
          id={`${idPrefixe}-adresse`}
          onAdresseChoisie={(adresse) => {
            mettreAJour({ adresse })
          }}
          rechercherAdressesAction={rechercherAdressesAction}
        />
      </div>

      {lieuxDejaDeclares !== undefined && lieuxDejaDeclares.lieux.length > 0 ? (
        <div className="fr-mb-2w">
          <LieuxDejaDeclares consigne={lieuxDejaDeclares.consigne} lieux={lieuxDejaDeclares.lieux} />
        </div>
      ) : null}

      <div className="fr-checkbox-group fr-mb-2w">
        <input
          defaultChecked={valeursInitiales.itinerant ?? false}
          id={`${idPrefixe}-itinerant`}
          name="itinerant"
          type="checkbox"
        />
        <label className="fr-label" htmlFor={`${idPrefixe}-itinerant`}>
          Lieu d’activité itinérant (exemple : bus)
        </label>
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-complement-adresse`}>
          Complément d’adresse
          <span className="fr-hint-text">Bâtiment, étage, entrée…</span>
        </label>
        <input
          className="fr-input"
          defaultValue={valeursInitiales.complementAdresse}
          id={`${idPrefixe}-complement-adresse`}
          name="complementAdresse"
          type="text"
        />
      </div>
    </>
  )
}

export type EtatLieuInclusionFormulaire = Readonly<{
  adresse: string
  nom: string
  siretSaisi: string
}>

type ValeursInitialesLieuInclusion = Readonly<{
  adresse: string
  complementAdresse?: string
  itinerant?: boolean
  nomStructure: string
  siret?: string
  typologies?: ReadonlyArray<string>
}>

// Adresse validée via la BAN : autocomplétion sur l'action de recherche d'adresses.
// La valeur affichée est pilotée par le parent (`adresse`), pour qu'une recherche par
// SIRET puisse la pré-remplir ; seul le texte en cours de frappe est local.
// Au focus, la saisie repart du texte courant pour permettre de le modifier plutôt que
// de repartir d'un champ vide.
function SelectAsyncAdresse({
  adresse,
  id,
  onAdresseChoisie,
  rechercherAdressesAction,
}: SelectAsyncAdresseProps): ReactElement {
  const [texteSaisi, setTexteSaisi] = useState('')
  const selection = adresse === '' ? null : { label: adresse, value: adresse }

  async function chargerAdresses(recherche: string): Promise<Array<LabelValue>> {
    const adresses = await rechercherAdressesAction(recherche)
    return adresses.map((adresseTrouvee) => ({ label: adresseTrouvee.label, value: adresseTrouvee.label }))
  }

  return (
    <SelectAsync<LabelValue>
      id={id}
      inputValue={texteSaisi}
      loadOptions={chargerAdresses}
      name="adresse"
      noOptionsMessage={(inputValue) => (inputValue.length < 3 ? 'Saisissez au moins 3 caractères' : 'Pas de résultat')}
      onChange={(option) => {
        // À la sélection, on vide le texte : la valeur choisie s'affiche via le rendu standard.
        setTexteSaisi('')
        onAdresseChoisie(option?.label ?? '')
      }}
      onFocus={() => {
        setTexteSaisi(adresse)
      }}
      onInputChange={(valeur, actionMeta) => {
        if (actionMeta.action === 'input-change') {
          setTexteSaisi(valeur)
        } else if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
          setTexteSaisi('')
        }
      }}
      onMenuOpen={() => {
        // Ré-ouverture du menu sur un champ déjà focus : on repart du libellé sélectionné,
        // sauf si une saisie est déjà en cours.
        setTexteSaisi((precedent) => (precedent === '' ? adresse : precedent))
      }}
      placeholder="Rechercher l’adresse"
      required={true}
      value={selection}
    >
      Adresse du lieu <span className="color-red">*</span>
      <span className="fr-hint-text">Commencez à saisir, puis choisissez une adresse dans la liste.</span>
    </SelectAsync>
  )
}

type RechercherAdresses = (recherche: string) => Promise<ReadonlyArray<Readonly<{ label: string }>>>

type SelectAsyncAdresseProps = Readonly<{
  adresse: string
  id: string
  onAdresseChoisie(adresse: string): void
  rechercherAdressesAction: RechercherAdresses
}>

type Props = Readonly<{
  idPrefixe: string
  // Lieux déjà déclarés à l'adresse saisie : affichés sous le champ adresse, avec
  // une consigne propre au contexte (création ou modification), maquettes V6.
  lieuxDejaDeclares?: Readonly<{
    consigne: string
    lieux: ReadonlyArray<LieuInclusionSimilaireViewModel>
  }>
  onChangement(etat: EtatLieuInclusionFormulaire): void
  valeursInitiales: ValeursInitialesLieuInclusion
}>
