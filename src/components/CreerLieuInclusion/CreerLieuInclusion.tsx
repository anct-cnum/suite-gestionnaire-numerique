'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import styles from './CreerLieuInclusion.module.css'
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

// Création d'un lieu d'activité (#1495). Formulaire unique porté par le composant partagé :
// le SIRET est optionnel et ne fait que pré-remplir le nom et l'adresse. Dès qu'une adresse
// est connue, les lieux existants aux alentours sont proposés pour un contrôle humain — la
// création n'est jamais bloquée.
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
    setLieuxSimilaires(
      await rechercherLieuxInclusionSimilairesAction({
        adresse: nouvelEtat.adresse,
        nom: nouvelEtat.nom,
        siret: nouvelEtat.siretSaisi,
      })
    )
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
                onChangement={handleChangement}
                valeursInitiales={{ adresse: '', nomStructure: '' }}
              />
            </div>
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

          <div className="fr-mb-4w grey-border border-radius">
            <div className={`fr-p-4w ${styles['bandeau-cartographie']}`}>
              <div className="fr-grid-row fr-grid-row--middle fr-mb-3w">
                <Image alt="" className="fr-mr-2w" height={40} src="/carto-nationale.svg" width={40} />
                <h3 className="fr-h6 fr-mb-0 fr-col fr-text-label--blue-france">
                  Vous souhaitez rendre visible ce lieu sur la cartographie nationale des lieux d’inclusion numérique ?
                </h3>
              </div>
              <p className="fr-text--sm fr-mb-1w">
                <span
                  aria-hidden="true"
                  className="fr-icon-pencil-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                />
                Renseignez des informations sur le lieu et les services d’inclusion numérique qui y sont proposés
              </p>
              <p className="fr-text--sm fr-mb-3w">
                <span
                  aria-hidden="true"
                  className="fr-icon-compass-3-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                />
                Gagnez en visibilité et orientez les bénéficiaires grâce à la cartographie
              </p>
              <Link
                className="fr-link fr-icon-external-link-line fr-link--icon-right fr-text--sm"
                href="https://cartographie.societenumerique.gouv.fr/cartographie"
                target="_blank"
              >
                En savoir plus sur la cartographie
              </Link>
            </div>
            <div className="fr-px-4w fr-py-3w">
              <Toggle labelAGauche libelleEtat name="visiblePourCartographie">
                Rendre mon lieu d’activité visible sur la cartographie
              </Toggle>
            </div>
          </div>

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
