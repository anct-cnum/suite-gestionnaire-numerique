'use client'

import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { Notification } from '@/components/shared/Notification/Notification'
import SelectAsync from '@/components/shared/Select/SelectAsync'
import SelectMulti from '@/components/shared/Select/SelectMulti'
import { LabelValue } from '@/presenters/shared/labels'
import { typologieLabels } from '@/presenters/shared/typologie'

// Champs communs à la création (#1495) et à la modification (#1498) d'un lieu : SIRET
// recherché via l'API Entreprise (nom et adresse en lecture seule, typologies saisies),
// ou saisie manuelle sans SIRET (adresse validée par la BAN). Les champs sont non
// contrôlés (FormData côté parent) ; l'état utile à la soumission remonte par onChangement.
export default function LieuInclusionFormulaire({ idPrefixe, onChangement, valeursInitiales }: Props): ReactElement {
  const { rechercherAdressesAction, rechercherUneEntrepriseAction } = useContext(clientContext)
  const [etat, setEtat] = useState<EtatLieuInclusionFormulaire>({
    adresse: valeursInitiales.adresse,
    entreprise: null,
    nom: valeursInitiales.nomStructure,
    sansSiret: false,
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

  async function rechercherEntreprise(): Promise<void> {
    setRechercheEnCours(true)
    mettreAJour({ entreprise: null })

    const resultat = await rechercherUneEntrepriseAction({ siret: etat.siretSaisi })
    if ('identifiant' in resultat) {
      mettreAJour({ entreprise: resultat, nom: resultat.denomination })
    } else {
      Notification('error', { description: resultat.join(', '), title: 'Erreur : ' })
    }

    setRechercheEnCours(false)
  }

  return (
    <>
      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-siret`}>
          SIRET du lieu d’activité (ou RNA)
        </label>
        <div className="fr-grid-row fr-grid-row--bottom">
          <div className="fr-col">
            <input
              className="fr-input"
              disabled={etat.sansSiret}
              id={`${idPrefixe}-siret`}
              name="siret"
              onChange={(event) => {
                mettreAJour({ entreprise: null, siretSaisi: event.target.value })
              }}
              type="text"
              value={etat.siretSaisi}
            />
          </div>
          <div className="fr-col-auto fr-pl-2w">
            <button
              className="fr-btn fr-btn--secondary"
              disabled={etat.sansSiret || rechercheEnCours || etat.siretSaisi === ''}
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

      <div className="fr-checkbox-group fr-mb-3w">
        <input
          checked={etat.sansSiret}
          id={`${idPrefixe}-sans-siret`}
          onChange={(event) => {
            mettreAJour({
              entreprise: null,
              sansSiret: event.target.checked,
              siretSaisi: event.target.checked ? '' : etat.siretSaisi,
            })
          }}
          type="checkbox"
        />
        <label className="fr-label" htmlFor={`${idPrefixe}-sans-siret`}>
          Il n’y a pas de SIRET de structure pour ce lieu
        </label>
      </div>

      {etat.sansSiret ? (
        <FormulaireSansSiret
          idPrefixe={idPrefixe}
          onAdresseChoisie={(adresse) => {
            mettreAJour({ adresse })
          }}
          onNomSaisi={(nom) => {
            mettreAJour({ nom })
          }}
          rechercherAdressesAction={rechercherAdressesAction}
          typologiesOptions={typologiesOptions}
          valeursInitiales={valeursInitiales}
        />
      ) : (
        <ChampsEntreprise entreprise={etat.entreprise} idPrefixe={idPrefixe} typologiesOptions={typologiesOptions} />
      )}
    </>
  )
}

export type EtatLieuInclusionFormulaire = Readonly<{
  // Adresse choisie (sans SIRET) ; l'adresse d'une entreprise est portée par `entreprise`.
  adresse: string
  entreprise: EntrepriseViewModel | null
  nom: string
  sansSiret: boolean
  siretSaisi: string
}>

type ValeursInitialesLieuInclusion = Readonly<{
  adresse: string
  complementAdresse?: string
  nomStructure: string
  siret?: string
  typologies?: ReadonlyArray<string>
}>

// Cas SIRET : les informations proviennent de l'API Entreprise, non modifiables,
// sauf les typologies, saisies depuis le référentiel de la médiation numérique.
function ChampsEntreprise({ entreprise, idPrefixe, typologiesOptions }: ChampsEntrepriseProps): null | ReactElement {
  if (entreprise === null) {
    return null
  }

  return (
    <>
      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-nom-entreprise`}>
          Nom du lieu d’activité
        </label>
        <input
          className="fr-input"
          disabled={true}
          id={`${idPrefixe}-nom-entreprise`}
          type="text"
          value={entreprise.denomination}
        />
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-adresse-entreprise`}>
          Adresse
        </label>
        <input
          className="fr-input"
          disabled={true}
          id={`${idPrefixe}-adresse-entreprise`}
          type="text"
          value={entreprise.adresse}
        />
      </div>

      <SelectMulti
        id={`${idPrefixe}-typologies`}
        name="typologies"
        options={typologiesOptions}
        placeholder="Choisissez une ou plusieurs typologies"
        required={true}
      >
        Typologie(s) du lieu d’activité *
      </SelectMulti>
    </>
  )
}

// Cas sans SIRET : saisie manuelle, adresse validée via la BAN.
function FormulaireSansSiret({
  idPrefixe,
  onAdresseChoisie,
  onNomSaisi,
  rechercherAdressesAction,
  typologiesOptions,
  valeursInitiales,
}: FormulaireSansSiretProps): ReactElement {
  return (
    <>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">Les champs avec * sont obligatoires.</p>

      <div className="fr-mb-2w">
        <SelectAsyncAdresse
          adresseActuelle={valeursInitiales.adresse}
          id={`${idPrefixe}-adresse`}
          onAdresseChoisie={onAdresseChoisie}
          rechercherAdressesAction={rechercherAdressesAction}
        />
      </div>

      <div className="fr-checkbox-group fr-mb-2w">
        <input id={`${idPrefixe}-itinerant`} name="itinerant" type="checkbox" />
        <label className="fr-label" htmlFor={`${idPrefixe}-itinerant`}>
          Lieu d’activité itinérant (exemple : bus)
        </label>
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-nom`}>
          Nom du lieu d’activité *
        </label>
        <input
          className="fr-input"
          defaultValue={valeursInitiales.nomStructure}
          id={`${idPrefixe}-nom`}
          name="nom"
          onChange={(event) => {
            onNomSaisi(event.target.value)
          }}
          required={true}
          type="text"
        />
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor={`${idPrefixe}-complement-adresse`}>
          Complément d’adresse
        </label>
        <input
          className="fr-input"
          defaultValue={valeursInitiales.complementAdresse}
          id={`${idPrefixe}-complement-adresse`}
          name="complementAdresse"
          type="text"
        />
      </div>

      <SelectMulti
        id={`${idPrefixe}-typologies`}
        name="typologies"
        options={typologiesOptions}
        placeholder="Choisissez une ou plusieurs typologies"
        required={true}
      >
        Typologie(s) du lieu d’activité *
      </SelectMulti>
    </>
  )
}

// Adresse validée via la BAN : autocomplétion sur l'action de recherche d'adresses.
// Pré-remplie avec l'adresse actuelle ; au focus, la saisie repart du texte courant
// pour permettre de le modifier plutôt que de repartir d'un champ vide.
function SelectAsyncAdresse({
  adresseActuelle,
  id,
  onAdresseChoisie,
  rechercherAdressesAction,
}: SelectAsyncAdresseProps): ReactElement {
  const [etat, setEtat] = useState<EtatSelectionAdresse>({
    selection: adresseActuelle === '' ? null : { label: adresseActuelle, value: adresseActuelle },
    texteSaisi: '',
  })

  async function chargerAdresses(recherche: string): Promise<Array<LabelValue>> {
    const adresses = await rechercherAdressesAction(recherche)
    return adresses.map((adresse) => ({ label: adresse.label, value: adresse.label }))
  }

  return (
    <SelectAsync<LabelValue>
      id={id}
      inputValue={etat.texteSaisi}
      loadOptions={chargerAdresses}
      name="adresse"
      noOptionsMessage={(inputValue) => (inputValue.length < 3 ? 'Saisissez au moins 3 caractères' : 'Pas de résultat')}
      onChange={(option) => {
        // À la sélection, on vide le texte : la valeur choisie s'affiche via le rendu standard.
        setEtat({ selection: option, texteSaisi: '' })
        onAdresseChoisie(option?.label ?? '')
      }}
      onFocus={() => {
        setEtat((precedent) => ({ ...precedent, texteSaisi: precedent.selection?.label ?? '' }))
      }}
      onInputChange={(valeur, actionMeta) => {
        if (actionMeta.action === 'input-change') {
          setEtat((precedent) => ({ ...precedent, texteSaisi: valeur }))
        } else if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
          setEtat((precedent) => ({ ...precedent, texteSaisi: '' }))
        }
      }}
      onMenuOpen={() => {
        // Ré-ouverture du menu sur un champ déjà focus : on repart du libellé sélectionné,
        // sauf si une saisie est déjà en cours.
        setEtat((precedent) =>
          precedent.texteSaisi === '' ? { ...precedent, texteSaisi: precedent.selection?.label ?? '' } : precedent
        )
      }}
      placeholder="Rechercher l’adresse"
      required={true}
      value={etat.selection}
    >
      Adresse *
    </SelectAsync>
  )
}

type EtatSelectionAdresse = Readonly<{
  selection: LabelValue | null
  texteSaisi: string
}>

type RechercherAdresses = (recherche: string) => Promise<ReadonlyArray<Readonly<{ label: string }>>>

type SelectAsyncAdresseProps = Readonly<{
  adresseActuelle: string
  id: string
  onAdresseChoisie(adresse: string): void
  rechercherAdressesAction: RechercherAdresses
}>

type ChampsEntrepriseProps = Readonly<{
  entreprise: EntrepriseViewModel | null
  idPrefixe: string
  typologiesOptions: ReadonlyArray<LabelValue>
}>

type FormulaireSansSiretProps = Readonly<{
  idPrefixe: string
  onAdresseChoisie(adresse: string): void
  onNomSaisi(nom: string): void
  rechercherAdressesAction: RechercherAdresses
  typologiesOptions: ReadonlyArray<LabelValue>
  valeursInitiales: ValeursInitialesLieuInclusion
}>

type Props = Readonly<{
  idPrefixe: string
  onChangement(etat: EtatLieuInclusionFormulaire): void
  valeursInitiales: ValeursInitialesLieuInclusion
}>
