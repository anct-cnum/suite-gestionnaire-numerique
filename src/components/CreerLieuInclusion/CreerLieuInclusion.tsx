'use client'

import Link from 'next/link'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import Alerte from '@/components/shared/Alerte/Alerte'
import { clientContext } from '@/components/shared/ClientContext'
import LieuInclusionFormulaire, {
  EtatLieuInclusionFormulaire,
} from '@/components/shared/LieuInclusionFormulaire/LieuInclusionFormulaire'
import { Notification } from '@/components/shared/Notification/Notification'
import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import Toggle from '@/components/shared/Toggle/Toggle'
import { LieuInclusionSimilaireViewModel } from '@/presenters/lieuxInclusionSimilairesPresenter'

// Création d'un lieu d'activité (#1495). Deux parcours (SIRET / sans SIRET) portés par le
// formulaire partagé ; dès qu'une adresse ou une entreprise est connue, les lieux existants
// aux alentours sont proposés pour un contrôle humain — la création n'est jamais bloquée.
export default function CreerLieuInclusion(): ReactElement {
  const { creerUnLieuInclusionAction, rechercherLieuxInclusionSimilairesAction, router } = useContext(clientContext)
  const [etat, setEtat] = useState<EtatLieuInclusionFormulaire>({
    adresse: '',
    entreprise: null,
    nom: '',
    sansSiret: false,
    siretSaisi: '',
  })
  const [lieuxSimilaires, setLieuxSimilaires] = useState<ReadonlyArray<LieuInclusionSimilaireViewModel>>([])
  const [isDisabled, setIsDisabled] = useState(false)

  async function proposerLieuxSimilaires(nouvelEtat: EtatLieuInclusionFormulaire): Promise<void> {
    const adresse = nouvelEtat.sansSiret ? nouvelEtat.adresse : (nouvelEtat.entreprise?.adresse ?? '')
    if (adresse === '') {
      setLieuxSimilaires([])
      return
    }
    setLieuxSimilaires(
      await rechercherLieuxInclusionSimilairesAction(
        nouvelEtat.sansSiret
          ? { adresse, nom: nouvelEtat.nom }
          : { adresse, nom: nouvelEtat.nom, siret: nouvelEtat.siretSaisi }
      )
    )
  }

  function handleChangement(nouvelEtat: EtatLieuInclusionFormulaire): void {
    const adresseChange = nouvelEtat.adresse !== etat.adresse || nouvelEtat.entreprise !== etat.entreprise
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

    const resultat = await creerUnLieuInclusionAction(
      etat.sansSiret
        ? {
            adresse: form.get('adresse') as string,
            complementAdresse: form.get('complementAdresse') as string,
            itinerant: form.get('itinerant') === 'on',
            nom: form.get('nom') as string,
            typologies: form.getAll('typologies').map(String),
            visiblePourCartographie,
          }
        : {
            siret: etat.siretSaisi,
            typologies: form.getAll('typologies').map(String),
            visiblePourCartographie,
          }
    )

    if (resultat.statut === 'cree') {
      Notification('success', { description: 'a bien été créé.', title: 'Le lieu d’inclusion numérique ' })
      router.push(`/lieu/${resultat.lieuId}`)
      return
    }

    Notification('error', { description: resultat.messages.join(', '), title: 'Erreur : ' })
    setIsDisabled(false)
  }

  return (
    <>
      <PageTitle>
        <TitleIcon icon="map-pin-2-line" />
        Création d’un lieu d’activité
      </PageTitle>

      <form
        className="fr-mb-4w"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <section className="fr-mb-4w grey-border border-radius fr-p-4w">
          <h2 className="fr-h4 fr-text-label--blue-france">Informations générales</h2>
          <LieuInclusionFormulaire
            idPrefixe="creation-lieu"
            onChangement={handleChangement}
            valeursInitiales={{ adresse: '', nomStructure: '' }}
          />
        </section>

        {lieuxSimilaires.length > 0 ? (
          <Alerte titre="Des lieux existent déjà aux alentours" type="warning">
            <p>Vérifiez qu’il ne s’agit pas du même lieu avant de créer :</p>
            <ul>
              {lieuxSimilaires.map((lieu) => (
                <li key={lieu.href}>
                  <Link href={lieu.href} target="_blank">
                    {lieu.nom}
                  </Link>
                  {` — ${lieu.adresse} · ${lieu.libelleMotif}${lieu.estLieuCoop ? ' · géré dans la Coop' : ''}`}
                </li>
              ))}
            </ul>
          </Alerte>
        ) : null}

        <div className="fr-callout fr-mb-4w">
          <h3 className="fr-callout__title">La cartographie nationale de l’inclusion numérique</h3>
          <p className="fr-callout__text">
            Un lieu visible est proposé à la cartographie nationale, où les usagers trouvent les lieux d’accompagnement
            près de chez eux. L’apparition sur la carte suit le prochain référencement, sous quelques jours. Cette
            option pourra être modifiée depuis la fiche du lieu.
          </p>
          <Toggle name="visiblePourCartographie">Rendre mon lieu d’activité visible sur la cartographie</Toggle>
        </div>

        <div className="fr-btns-group fr-btns-group--inline-sm fr-btns-group--right">
          <Link className="fr-btn fr-btn--secondary" href="/liste-lieux-inclusion">
            Annuler
          </Link>
          <button
            className="fr-btn"
            disabled={isDisabled || (!etat.sansSiret && etat.entreprise === null)}
            type="submit"
          >
            {isDisabled ? 'Création en cours...' : 'Créer le lieu d’activité'}
          </button>
        </div>
      </form>
    </>
  )
}
