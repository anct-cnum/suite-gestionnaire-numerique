'use client'

import { usePathname } from 'next/navigation'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import { InformationsGeneralesData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import styles from '@/components/LieuInclusionDetails/LieuInclusionDetailsShared.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import LieuInclusionFormulaire, {
  EtatLieuInclusionFormulaire,
} from '@/components/shared/LieuInclusionFormulaire/LieuInclusionFormulaire'
import { Notification } from '@/components/shared/Notification/Notification'
import { libelleTypologie } from '@/presenters/shared/typologie'

export default function LieuInclusionDetailsInformationsGenerales(props: Props): ReactElement {
  const { data, peutModifier } = props
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [etatFormulaire, setEtatFormulaire] = useState(etatInitial(data))

  const { modifierLieuInclusionInformationsGeneralesAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID du lieu depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  const typologiesActuelles = data.typologies ?? []

  function quitterEdition(): void {
    setIsEditing(false)
    setEtatFormulaire(etatInitial(data))
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    setIsDisabled(true)

    const messages = await modifierLieuInclusionInformationsGeneralesAction(
      etatFormulaire.sansSiret
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
            siret: etatFormulaire.siretSaisi,
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
          <LieuInclusionFormulaire
            idPrefixe="informations-generales"
            onChangement={setEtatFormulaire}
            valeursInitiales={data}
          />

          <div className="fr-btns-group fr-btns-group--inline-sm fr-btns-group--right fr-mt-3w">
            <button className="fr-btn fr-btn--secondary" disabled={isDisabled} onClick={quitterEdition} type="button">
              Annuler
            </button>
            <button
              className="fr-btn"
              disabled={isDisabled || (!etatFormulaire.sansSiret && etatFormulaire.entreprise === null)}
              type="submit"
            >
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

function etatInitial(data: InformationsGeneralesData): EtatLieuInclusionFormulaire {
  return {
    adresse: data.adresse,
    entreprise: null,
    nom: data.nomStructure,
    sansSiret: false,
    siretSaisi: data.siret ?? '',
  }
}

type Props = Readonly<{
  data: InformationsGeneralesData
  peutModifier: boolean
}>
