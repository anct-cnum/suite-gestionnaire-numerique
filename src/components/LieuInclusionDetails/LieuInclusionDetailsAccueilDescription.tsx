'use client'

import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { usePathname } from 'next/navigation'
import { FormEvent, ReactElement, useContext, useState } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { useRichTextEditor } from '@/components/shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '@/components/shared/RichTextEditor/TextEditor'
import Select from '@/components/shared/Select/Select'
import TextArea from '@/components/shared/TextArea/TextArea'
import { LabelValue } from '@/presenters/shared/labels'

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

  // Mapping des valeurs de typologie vers leurs labels lisibles
  const typologieLabels: Record<Typologie, string> = {
    [Typologie.ACI]: 'Structures porteuses d\'ateliers et chantiers d\'insertion',
    [Typologie.ACIPHC]: 'SIAE — Atelier chantier d\'insertion premières heures en chantier',
    [Typologie.AFPA]: 'Agence nationale pour la formation professionnelle des adultes',
    [Typologie.AI]: 'Associations intermédiaires',
    [Typologie.ASE]: 'Aide sociale à l\'enfance',
    [Typologie.ASSO]: 'Associations',
    [Typologie.ASSO_CHOMEUR]: 'Associations de chômeurs',
    [Typologie.AUTRE]: 'Autre',
    [Typologie.AVIP]: 'Crèche à vocation d\'insertion professionnelle',
    [Typologie.BIB]: 'Bibliothèque / Médiathèque',
    [Typologie.CAARUD]: 'Centre d\'accueil et d\'accompagnement à la réduction de risques pour usagers de drogues',
    [Typologie.CADA]: 'Centres d\'accueil de demandeurs d\'asile',
    [Typologie.CAF]: 'Caisses d\'allocation familiale',
    [Typologie.CAP_EMPLOI]: 'Cap Emploi',
    [Typologie.CAVA]: 'Centres d\'adaptation à la vie active',
    [Typologie.CC]: 'Communautés de Commune',
    [Typologie.CCAS]: 'Centres communaux d\'action sociale',
    [Typologie.CCONS]: 'Chambres consulaires',
    [Typologie.CD]: 'Conseils Départementaux',
    [Typologie.CDAS]: 'Centre départemental d\'action sociale',
    [Typologie.CFP]: 'Centre des finances publiques',
    [Typologie.CHRS]: 'Centres d\'hébergement et de réinsertion sociale',
    [Typologie.CHU]: 'Centres d\'hébergement d\'urgence',
    [Typologie.CIAS]: 'Centres intercommunaux d\'action sociale',
    [Typologie.CIDFF]: 'Centres d\'information sur les droits des femmes et des familles',
    [Typologie.CITMET]: 'Cité des métiers',
    [Typologie.CMP]: 'Centre Médico Psychologique',
    [Typologie.CMS]: 'Centre médico-social',
    [Typologie.CPAM]: 'Caisse primaire d\'assurance maladie',
    [Typologie.CPH]: 'Centres provisoires d\'hébergement',
    [Typologie.CS]: 'Centre social',
    [Typologie.CSAPA]: 'Centre de soins, d\'accompagnement et de prévention en addictologie',
    [Typologie.CSC]: 'Centre socioculturel',
    [Typologie.DEETS]: 'Directions de l\'Economie, de l\'Emploi, du Travail et des Solidarités',
    [Typologie.DEPT]: 'Services sociaux du Conseil départemental',
    [Typologie.DIPLP]: 'Délégation interministérielle à la prévention et à la lutte contre la pauvreté',
    [Typologie.E2C]: 'École de la deuxième chance',
    [Typologie.EA]: 'Entreprise adaptée',
    [Typologie.EATT]: 'Entreprise adaptée',
    [Typologie.EI]: 'Entreprises d\'insertion',
    [Typologie.EITI]: 'Entreprises d\'insertion par le travail indépendant',
    [Typologie.ENM]: 'Espace Numérique Mobile',
    [Typologie.EPCI]: 'Intercommunalité',
    [Typologie.EPI]: 'Espace Public Internet',
    [Typologie.EPIDE]: 'Établissement pour l\'insertion dans l\'emploi',
    [Typologie.EPN]: 'Espace publique numérique',
    [Typologie.ES]: 'Épicerie solidaire',
    [Typologie.ESAT]: 'Établissements ou services d\'aide par le travail',
    [Typologie.ESS]: 'Entreprise de l\'Économie Sociale et Solidaire',
    [Typologie.ETTI]: 'Entreprises de travail temporaire d\'insertion',
    [Typologie.EVS]: 'Espace de vie sociale',
    [Typologie.FABLAB]: 'Fablab',
    [Typologie.FABRIQUE]: 'Fabrique',
    [Typologie.FAIS]: 'Fédérations d\'acteurs de l\'insertion et de la solidarité',
    [Typologie.FT]: 'France travail',
    [Typologie.GEIQ]: 'Groupements d\'employeurs pour l\'insertion et la qualification',
    [Typologie.HUDA]: 'Hébergement d\'urgence pour demandeurs d\'asile',
    [Typologie.LA_POSTE]: 'La Poste',
    [Typologie.MDE]: 'Maison de l\'emploi',
    [Typologie.MDEF]: 'Maison de l\'emploi et de la formation',
    [Typologie.MDH]: 'Maison des Habitants',
    [Typologie.MDPH]: 'Maison Départementale des Personnes Handicapées',
    [Typologie.MDS]: 'Maison Départementale des Solidarités',
    [Typologie.MJC]: 'Maison des jeunes et de la culture',
    [Typologie.ML]: 'Mission Locale',
    [Typologie.MQ]: 'Maison de quartier',
    [Typologie.MSA]: 'Mutualité Sociale Agricole',
    [Typologie.MSAP]: 'Maison de Services Au Public',
    [Typologie.MUNI]: 'Municipalités',
    [Typologie.OACAS]: 'Structures agréées Organisme d\'accueil communautaire et d\'activité solidaire',
    [Typologie.ODC]: 'Organisation délégataire d\'un CD',
    [Typologie.OF]: 'Organisme de formations',
    [Typologie.OIL]: 'Opérateur d\'intermédiation locative',
    [Typologie.OPCS]: 'Organisation porteuse de la clause sociale',
    [Typologie.PAD]: 'Point d\'Accès au Droit',
    [Typologie.PENSION]: 'Pension de famille',
    [Typologie.PI]: 'Point info',
    [Typologie.PIJ_BIJ]: 'Points et bureaux information jeunesse',
    [Typologie.PIMMS]: 'Point Information Médiation Multi Services',
    [Typologie.PJJ]: 'Protection judiciaire de la jeunesse',
    [Typologie.PLIE]: 'Plans locaux pour l\'insertion et l\'emploi',
    [Typologie.PREF]: 'Préfecture, Sous-Préfecture',
    [Typologie.PREVENTION]: 'Service ou club de prévention',
    [Typologie.REG]: 'Région',
    [Typologie.RELAIS_LECTURE]: 'Relais lecture',
    [Typologie.RESSOURCERIE]: 'Ressourcerie',
    [Typologie.RFS]: 'Réseau France Services',
    [Typologie.RS_FJT]: 'Résidence sociale - Foyer de Jeunes Travailleurs',
    [Typologie.SCP]: 'Services et clubs de prévention',
    [Typologie.SPIP]: 'Services pénitentiaires d\'insertion et de probation',
    [Typologie.TIERS_LIEUX]: 'Tiers lieu & coworking',
    [Typologie.UDAF]: 'Union Départementale d\'Aide aux Familles',
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
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
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }

  return (
    <form
      className="fr-p-4w"
      onSubmit={handleSubmit}
    >
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">
            Description du lieu
          </h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Décrivez ici le lieu et les activités qu&apos;il propose.
          </p>
        </div>
        {!isEditing && peutModifier ? (
          <div className="fr-col-auto">
            <button
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
              onClick={() => { setIsEditing(true) }}
              type="button"
            >
              Modifier
            </button>
          </div>
        ) : null}
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Typologie
        </p>
        {isEditing ? (
          <Select
            id="typologie-select"
            name="typologie"
            options={typologiesOptions}
          >
            Typologie
          </Select>
        ) : (
          <p className="fr-mb-0">
            {typologieLabel}
          </p>
        )}
      </div>

      {isEditing || presentationDetail !== undefined && presentationDetail !== '' ? (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
            Présentation détaillée
          </p>
          {isEditing ? (
            <TextEditor
              ariaLabel="Éditeur de présentation détaillée du lieu"
              contenu={presentationDetailContenu}
              height={200}
              onChange={gererChangementPresentationDetail}
              readOnly={false}
            />
          ) : (
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: presentationDetail ?? '' }}
            />
          )}
        </div>
      ) : null}

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Résumé
        </p>
        {isEditing ? (
          <TextArea
            defaultValue={presentationResume ?? modalitesAccueil ?? ''}
            maxLength={500}
            rows={5}
          >
            Résumé de la présentation
          </TextArea>
        ) : (
          <p className="fr-mb-0">
            {presentationResume ?? modalitesAccueil ?? 'Aucune description disponible'}
          </p>
        )}
      </div>

      {isEditing ? (
        <div className="fr-btns-group fr-btns-group--inline-sm">
          <button
            className="fr-btn fr-btn--secondary"
            disabled={isDisabled}
            onClick={() => { setIsEditing(false) }}
            type="button"
          >
            Annuler
          </button>
          <button
            className="fr-btn"
            disabled={isDisabled}
            type="submit"
          >
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
