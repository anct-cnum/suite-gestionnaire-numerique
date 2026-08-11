'use client'

import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { usePathname } from 'next/navigation'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import { InformationsGeneralesData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import styles from '@/components/LieuInclusionDetails/LieuInclusionDetailsShared.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { Notification } from '@/components/shared/Notification/Notification'
import SelectAsync from '@/components/shared/Select/SelectAsync'
import SelectMulti from '@/components/shared/Select/SelectMulti'
import { LabelValue } from '@/presenters/shared/labels'
import { libelleTypologie, typologieLabels } from '@/presenters/shared/typologie'

export default function LieuInclusionDetailsInformationsGenerales(props: Props): ReactElement {
  const { data, peutModifier } = props
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [sansSiret, setSansSiret] = useState(false)
  const [siretSaisi, setSiretSaisi] = useState(data.siret ?? '')
  const [entreprise, setEntreprise] = useState<EntrepriseViewModel | null>(null)
  const [rechercheEnCours, setRechercheEnCours] = useState(false)

  const { modifierLieuInclusionInformationsGeneralesAction, rechercherAdressesAction, rechercherUneEntrepriseAction } =
    useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID du lieu depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  const typologiesActuelles = data.typologies ?? []

  const typologiesOptions: ReadonlyArray<LabelValue> = Object.values(Typologie).map((typologie) => ({
    isSelected: typologiesActuelles.includes(typologie),
    label: typologieLabels[typologie],
    value: typologie,
  }))

  function quitterEdition(): void {
    setIsEditing(false)
    setSansSiret(false)
    setEntreprise(null)
    setSiretSaisi(data.siret ?? '')
  }

  async function rechercherEntreprise(): Promise<void> {
    setRechercheEnCours(true)
    setEntreprise(null)

    const resultat = await rechercherUneEntrepriseAction({ siret: siretSaisi })
    if ('identifiant' in resultat) {
      setEntreprise(resultat)
    } else {
      Notification('error', { description: resultat.join(', '), title: 'Erreur : ' })
    }

    setRechercheEnCours(false)
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    setIsDisabled(true)

    const messages = await modifierLieuInclusionInformationsGeneralesAction(
      sansSiret
        ? {
            adresse: form.get('adresse') as string,
            complementAdresse: form.get('complementAdresse') as string,
            itinerant: form.get('itinerant') === 'on',
            nom: form.get('nom') as string,
            path: pathname,
            structureId,
            typologies: form.getAll('typologies').map(String),
          }
        : {
            path: pathname,
            siret: siretSaisi,
            structureId,
            typologies: form.getAll('typologies').map(String),
          }
    )

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiées', title: 'Informations générales ' })
      quitterEdition()
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  return (
    <section className="fr-mb-4w grey-border border-radius ">
      <div className="fr-grid-row fr-grid-row--middle fr-p-4w">
        <div className="fr-col">
          <h2 className="fr-h4 fr-mb-0 fr-text-label--blue-france">Informations générales</h2>
        </div>
        {!isEditing && peutModifier ? (
          <div className="fr-col-auto">
            <button
              className="fr-link fr-icon-edit-fill fr-link--icon-right"
              onClick={() => {
                setIsEditing(true)
              }}
              type="button"
            >
              Modifier
            </button>
          </div>
        ) : null}
      </div>

      <hr className="fr-hr fr-mb-1w" />
      {isEditing ? (
        <form
          className="fr-px-4w fr-pb-4w"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="fr-input-group fr-mb-2w">
            <label className="fr-label" htmlFor="informations-generales-siret">
              SIRET du lieu d’activité (ou RNA)
            </label>
            <div className="fr-grid-row fr-grid-row--bottom">
              <div className="fr-col">
                <input
                  className="fr-input"
                  disabled={sansSiret}
                  id="informations-generales-siret"
                  name="siret"
                  onChange={(event) => {
                    setSiretSaisi(event.target.value)
                    setEntreprise(null)
                  }}
                  type="text"
                  value={siretSaisi}
                />
              </div>
              <div className="fr-col-auto fr-pl-2w">
                <button
                  className="fr-btn fr-btn--secondary"
                  disabled={sansSiret || rechercheEnCours || siretSaisi === ''}
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
              checked={sansSiret}
              id="informations-generales-sans-siret"
              onChange={(event) => {
                setSansSiret(event.target.checked)
                setEntreprise(null)
                if (event.target.checked) {
                  setSiretSaisi('')
                }
              }}
              type="checkbox"
            />
            <label className="fr-label" htmlFor="informations-generales-sans-siret">
              Il n’y a pas de SIRET de structure pour ce lieu
            </label>
          </div>

          {sansSiret ? (
            <FormulaireSansSiret
              data={data}
              rechercherAdressesAction={rechercherAdressesAction}
              typologiesOptions={typologiesOptions}
            />
          ) : (
            <ChampsEntreprise entreprise={entreprise} typologiesOptions={typologiesOptions} />
          )}

          <div className="fr-btns-group fr-btns-group--inline-sm fr-btns-group--right fr-mt-3w">
            <button className="fr-btn fr-btn--secondary" disabled={isDisabled} onClick={quitterEdition} type="button">
              Annuler
            </button>
            <button className="fr-btn" disabled={isDisabled || (!sansSiret && entreprise === null)} type="submit">
              {isDisabled ? 'Enregistrement en cours...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      ) : (
        <div className="fr-px-4w">
          <div className="fr-mb-4v ">
            <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>Nom du lieu d’activité</h3>
            <p className="fr-text--bold fr-mb-0">{data.nomStructure}</p>
          </div>

          <div className="fr-mb-4v">
            <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>Adresse</h3>
            <p className="fr-text--bold fr-mb-0">{data.adresse}</p>
          </div>

          <div className="fr-mb-4v">
            <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>
              Complément d&apos;adresse
            </h3>
            <p className="fr-text--bold fr-mb-0">{data.complementAdresse ?? 'Non renseigné'}</p>
          </div>

          <div className="fr-mb-4v">
            <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>Typologie(s)</h3>
            <p className="fr-text--bold fr-mb-0">
              {typologiesActuelles.length > 0
                ? typologiesActuelles.map((typologie) => libelleTypologie(typologie)).join(', ')
                : 'Non renseigné'}
            </p>
          </div>

          <div className="fr-mb-4v">
            <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>SIRET du lieu d’activité</h3>
            <p className="fr-text--bold fr-mb-0">{data.siret ?? 'Non renseigné'}</p>
          </div>
        </div>
      )}
    </section>
  )
}

// Cas SIRET : les informations proviennent de l'API Entreprise, non modifiables,
// sauf les typologies, saisies depuis le référentiel de la médiation numérique.
function ChampsEntreprise(props: ChampsEntrepriseProps): null | ReactElement {
  const { entreprise, typologiesOptions } = props

  if (entreprise === null) {
    return null
  }

  return (
    <>
      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor="informations-generales-nom-entreprise">
          Nom du lieu d’activité
        </label>
        <input
          className="fr-input"
          disabled={true}
          id="informations-generales-nom-entreprise"
          type="text"
          value={entreprise.denomination}
        />
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor="informations-generales-adresse-entreprise">
          Adresse
        </label>
        <input
          className="fr-input"
          disabled={true}
          id="informations-generales-adresse-entreprise"
          type="text"
          value={entreprise.adresse}
        />
      </div>

      <SelectMulti
        id="informations-generales-typologies"
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
function FormulaireSansSiret(props: FormulaireSansSiretProps): ReactElement {
  const { data, rechercherAdressesAction, typologiesOptions } = props

  return (
    <>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">Les champs avec * sont obligatoires.</p>

      <div className="fr-mb-2w">
        <SelectAsyncAdresse adresseActuelle={data.adresse} rechercherAdressesAction={rechercherAdressesAction} />
      </div>

      <div className="fr-checkbox-group fr-mb-2w">
        <input id="informations-generales-itinerant" name="itinerant" type="checkbox" />
        <label className="fr-label" htmlFor="informations-generales-itinerant">
          Lieu d’activité itinérant (exemple : bus)
        </label>
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor="informations-generales-nom">
          Nom du lieu d’activité *
        </label>
        <input
          className="fr-input"
          defaultValue={data.nomStructure}
          id="informations-generales-nom"
          name="nom"
          required={true}
          type="text"
        />
      </div>

      <div className="fr-input-group fr-mb-2w">
        <label className="fr-label" htmlFor="informations-generales-complement-adresse">
          Complément d’adresse
        </label>
        <input
          className="fr-input"
          defaultValue={data.complementAdresse}
          id="informations-generales-complement-adresse"
          name="complementAdresse"
          type="text"
        />
      </div>

      <SelectMulti
        id="informations-generales-typologies"
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
function SelectAsyncAdresse(props: SelectAsyncAdresseProps): ReactElement {
  const { adresseActuelle, rechercherAdressesAction } = props
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
      id="informations-generales-adresse"
      inputValue={etat.texteSaisi}
      loadOptions={chargerAdresses}
      name="adresse"
      noOptionsMessage={(inputValue) => (inputValue.length < 3 ? 'Saisissez au moins 3 caractères' : 'Pas de résultat')}
      onChange={(option) => {
        // À la sélection, on vide le texte : la valeur choisie s'affiche via le rendu standard.
        setEtat({ selection: option, texteSaisi: '' })
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

type SelectAsyncAdresseProps = Readonly<{
  adresseActuelle: string
  rechercherAdressesAction(recherche: string): Promise<ReadonlyArray<Readonly<{ label: string }>>>
}>

type ChampsEntrepriseProps = Readonly<{
  entreprise: EntrepriseViewModel | null
  typologiesOptions: ReadonlyArray<LabelValue>
}>

type FormulaireSansSiretProps = Readonly<{
  data: InformationsGeneralesData
  rechercherAdressesAction(recherche: string): Promise<ReadonlyArray<Readonly<{ label: string }>>>
  typologiesOptions: ReadonlyArray<LabelValue>
}>

type Props = Readonly<{
  data: InformationsGeneralesData
  peutModifier: boolean
}>
