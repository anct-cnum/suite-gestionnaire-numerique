'use client'

import Link from 'next/link'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import EncartCartographie from '@/components/shared/EncartCartographie/EncartCartographie'
import LieuInclusionFormulaire, {
  EtatLieuInclusionFormulaire,
} from '@/components/shared/LieuInclusionFormulaire/LieuInclusionFormulaire'
import { Notification } from '@/components/shared/Notification/Notification'
import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'

// Création d'un lieu d'activité (#1495). Formulaire unique porté par le composant partagé :
// le SIRET est optionnel et ne fait que pré-remplir le nom et l'adresse. Dès qu'une adresse
// est connue, les lieux déjà déclarés à cette adresse sont proposés sous le champ pour un
// contrôle humain — la création n'est jamais bloquée.
export default function CreerLieuInclusion(): ReactElement {
  const { creerUnLieuInclusionAction, rechercherLieuxInclusionSimilairesAction, router } = useContext(clientContext)
  const [etat, setEtat] = useState({
    adresse: '',
    nom: '',
    siretSaisi: '',
  })
  const [lieuxSimilaires, setLieuxSimilaires] = useState<ReadonlyArray<LieuInclusionSimilaireViewModel>>([])
  const [isDisabled, setIsDisabled] = useState(false)

  async function proposerLieuxSimilaires(nouvelEtat: EtatLieuInclusionFormulaire): Promise<void> {
    if (nouvelEtat.adresse === '') {
      setLieuxSimilaires([])
      return
    }
    setLieuxSimilaires(await rechercherLieuxInclusionSimilairesAction({ adresse: nouvelEtat.adresse }))
  }

  function handleChangement(nouvelEtat: EtatLieuInclusionFormulaire): void {
    const adresseChange = nouvelEtat.adresse !== etat.adresse
    setEtat(nouvelEtat)
    if (adresseChange) {
      void proposerLieuxSimilaires(nouvelEtat)
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const visiblePourCartographie = form.get('visiblePourCartographie') === 'on'
    setIsDisabled(true)

    const resultat = await creerUnLieuInclusionAction({
      adresse: form.get('adresse') as string,
      complementAdresse: form.get('complementAdresse') as string,
      itinerant: form.get('itinerant') === 'on',
      nom: form.get('nom') as string,
      siret: etat.siretSaisi,
      typologies: form.getAll('typologies').map(String),
      visiblePourCartographie,
    })

    if (resultat.statut === 'cree') {
      Notification('success', {
        description: resultat.visibilitePourCartographieForcee
          ? 'a bien été créé, mais n’est pas proposé à la cartographie nationale : son adresse n’a pas été trouvée ' +
            'dans la Base Adresse Nationale.'
          : 'a bien été créé.',
        title: 'Le lieu d’inclusion numérique ',
      })
      router.push(`/lieu/${resultat.lieuId}`)
      return
    }

    Notification('error', { description: resultat.messages.join(', '), title: 'Erreur : ' })
    setIsDisabled(false)
  }

  return (
    // Largeur limitée et bloc centré (maquettes V6) : un formulaire étalé sur toute la
    // largeur de l'écran est illisible. Colonne DSFR, qui se rétracte seule aux petites
    // tailles, plutôt qu'une largeur en dur.
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-md-10 fr-col-lg-8 fr-col-xl-6">
        <div className="fr-mt-5w fr-mb-2w">
          <Link className="fr-link fr-icon-arrow-left-line fr-link--icon-left" href="/liste-lieux-inclusion">
            Retour
          </Link>
        </div>

        <PageTitle margin="fr-mt-0">
          <TitleIcon icon="home-office-line" />
          Création d’un lieu d’activité
        </PageTitle>

        <form
          className="fr-mb-4w"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <section className="fr-mb-4w grey-border border-radius">
            <h2 className="fr-h4 fr-text-label--blue-france fr-px-4w fr-pt-4w fr-mb-2w">Identification du lieu</h2>
            <hr />
            <div className="fr-px-4w fr-pb-4w">
              <LieuInclusionFormulaire
                idPrefixe="creation-lieu"
                lieuxDejaDeclares={{
                  consigne: 'Si c’est votre lieu, inutile de le créer. Sinon, poursuivez la création.',
                  lieux: lieuxSimilaires,
                }}
                onChangement={handleChangement}
                valeursInitiales={{ adresse: '', nomStructure: '' }}
              />
            </div>
          </section>

          <EncartCartographie name="visiblePourCartographie" />

          <div className="fr-btns-group">
            <button className="fr-btn" disabled={isDisabled} type="submit">
              {isDisabled ? 'Création en cours...' : 'Créer le lieu d’activité'}
            </button>
            <Link className="fr-btn fr-btn--secondary" href="/liste-lieux-inclusion">
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
