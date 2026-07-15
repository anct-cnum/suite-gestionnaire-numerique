'use client'

import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { usePathname } from 'next/navigation'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { useRichTextEditor } from '@/components/shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '@/components/shared/RichTextEditor/TextEditor'
import Select from '@/components/shared/Select/Select'
import TextArea from '@/components/shared/TextArea/TextArea'
import { LabelValue } from '@/presenters/shared/labels'
import { typologieLabels } from '@/presenters/shared/typologie'

export default function LieuInclusionDetailsAccueilDescription(props: Props): ReactElement {
  const { data, peutModifier } = props
  const { modalitesAccueil, presentationDetail, presentationResume, typologies } = data
  const [isEditing, setIsEditing] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { modifierLieuInclusionDescriptionAction } = useContext(clientContext)
  const pathname = usePathname()

  // Extraire l'ID de structure depuis l'URL (/lieu/[id])
  const structureId = pathname.split('/').pop() ?? ''

  // Hook pour gérer le RichTextEditor (présentation détaillée)
  const richTextEditor = useRichTextEditor(presentationDetail ?? '')
  const presentationDetailContenu = richTextEditor.contenu

  function gererChangementPresentationDetail(newContent: string): void {
    richTextEditor.gererLeChangementDeContenu(newContent)
  }

  // Récupérer le label de la typologie actuelle
  const typologieActuelle = typologies?.[0] as Typologie | undefined
  const typologieLabel = typologieActuelle === undefined ? 'Non renseigné' : typologieLabels[typologieActuelle]

  // Construire les options pour le Select
  const typologiesOptions: ReadonlyArray<LabelValue> = [
    { isSelected: typologieActuelle === undefined, label: 'Non renseigné', value: '' },
    ...Object.values(Typologie).map((typologie) => ({
      isSelected: typologieActuelle === typologie,
      label: typologieLabels[typologie],
      value: typologie,
    })),
  ]

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const typologie = form.get('typologie') as string
    // Le composant TextArea utilise toujours name="textarea"
    const resume = form.get('textarea') as string

    setIsDisabled(true)

    const messages = await modifierLieuInclusionDescriptionAction({
      path: pathname,
      presentationDetail: presentationDetailContenu,
      presentationResume: resume,
      structureId,
      typologie,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Description du lieu ' })
      setIsEditing(false)
    } else {
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
    }

    setIsDisabled(false)
  }

  return (
    <form
      className="fr-p-4w"
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
    >
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">Description du lieu</h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Décrivez ici le lieu et les activités qu&apos;il propose.
          </p>
        </div>
        {!isEditing && peutModifier ? (
          <div className="fr-col-auto">
            <button
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
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

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">Typologie</p>
        {isEditing ? (
          <Select id="typologie-select" name="typologie" options={typologiesOptions}>
            Typologie
          </Select>
        ) : (
          <p className="fr-mb-0">{typologieLabel}</p>
        )}
      </div>

      {isEditing || (presentationDetail !== undefined && presentationDetail !== '') ? (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">Présentation détaillée</p>
          {isEditing ? (
            <TextEditor
              ariaLabel="Éditeur de présentation détaillée du lieu"
              contenu={presentationDetailContenu}
              height={200}
              onChange={gererChangementPresentationDetail}
              readOnly={false}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: presentationDetail ?? '' }} />
          )}
        </div>
      ) : null}

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">Résumé</p>
        {isEditing ? (
          <TextArea defaultValue={presentationResume ?? modalitesAccueil ?? ''} maxLength={500} rows={5}>
            Résumé de la présentation
          </TextArea>
        ) : (
          <p className="fr-mb-0">{presentationResume ?? modalitesAccueil ?? 'Aucune description disponible'}</p>
        )}
      </div>

      {isEditing ? (
        <div className="fr-btns-group fr-btns-group--inline-sm">
          <button
            className="fr-btn fr-btn--secondary"
            disabled={isDisabled}
            onClick={() => {
              setIsEditing(false)
            }}
            type="button"
          >
            Annuler
          </button>
          <button className="fr-btn" disabled={isDisabled} type="submit">
            {isDisabled ? 'Enregistrement en cours...' : 'Enregistrer'}
          </button>
        </div>
      ) : null}
    </form>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
  peutModifier: boolean
}>
