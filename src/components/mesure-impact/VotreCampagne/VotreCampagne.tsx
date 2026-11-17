'use client'

import Link from 'next/link'
import { ReactElement, useId, useState } from 'react'

import LogoDuTerritoire from '../LogoDuTerritoire'
import { VotreCampagneViewModel } from '@/presenters/mesure-impact/votreCampagnePresenter'

// Espace de la structure qui porte la campagne (maquette 07b) : détails, résultats, saisie et diffusion.
// L'adresse diffusée est celle du site vitrine, jamais celle de MIN (#2263).
export default function VotreCampagne({ viewModel }: Props): ReactElement {
  const { adresseDuQuestionnaire, details, lienResultats, lienSaisie, nomDuFichierQrCode, ouverte, qrCode } = viewModel
  const [annonce, setAnnonce] = useState('')
  const titreEnLigne = useId()
  const titrePapier = useId()

  return (
    <>
      <h1 className="fr-h2">La mesure d’impact de la médiation numérique sur votre territoire</h1>
      <p className="fr-text--lead">
        Gérez votre campagne et diffusez le questionnaire à vos structures et médiateurs numériques.
      </p>
      {ouverte ? null : (
        <div className="fr-alert fr-alert--info fr-alert--sm fr-mb-3w" role="alert">
          <p>Cette campagne n’accepte pas de réponses en ce moment.</p>
        </div>
      )}
      {/* La carte DSFR prend toute la hauteur de sa colonne : sans grille, elle s'étirerait à celle du menu */}
      <div className="fr-grid-row fr-mb-6w">
        <div className="fr-col-12">
          <div className="fr-card">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <dl className="fr-col-12 fr-col-md-8 fr-m-0">
                    {details.map(({ libelle, valeur }) => (
                      <div className="fr-grid-row fr-mb-1w" key={libelle}>
                        <dt className="fr-col-12 fr-col-sm-5 fr-text-mention--grey">{libelle}</dt>
                        <dd className="fr-col-12 fr-col-sm-7 fr-m-0">{valeur}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="fr-col-12 fr-col-md-4">
                    <LogoDuTerritoire />
                  </div>
                </div>
              </div>
              <div className="fr-card__footer">
                <ul className="fr-btns-group fr-btns-group--inline-md">
                  <li>
                    <Link className="fr-btn" href={lienResultats}>
                      Voir les résultats
                    </Link>
                  </li>
                  <li>
                    <Link className="fr-btn fr-btn--secondary" href={lienSaisie}>
                      Saisir manuellement
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="fr-h4">Diffuser le questionnaire</h2>
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <section aria-labelledby={titreEnLigne} className="fr-col-12 fr-col-md-6">
          <div className="fr-card">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h3 className="fr-card__title" id={titreEnLigne}>
                  Questionnaire en ligne
                </h3>
                <p className="fr-card__desc">Sur téléphone, tablette ou ordinateur</p>
                <div className="fr-card__end">
                  <div className="fr-background-alt--grey fr-p-3w">
                    <img alt={`QR code de l’adresse ${adresseDuQuestionnaire}`} height={160} src={qrCode} width={160} />
                    <p className="fr-mt-1w fr-mb-0">
                      <a className="fr-link fr-link--download" download={nomDuFichierQrCode} href={qrCode}>
                        Télécharger le QR code <span className="fr-link__detail">PNG</span>
                      </a>
                    </p>
                  </div>
                  <p className="fr-mt-2w">
                    La personne scanne le QR code ou ouvre le lien, reçu par courriel, par SMS ou sur votre site. Aucun
                    compte n’est demandé.
                  </p>
                  <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{adresseDuQuestionnaire}</p>
                </div>
              </div>
              <div className="fr-card__footer">
                <ul className="fr-btns-group fr-btns-group--inline-md">
                  <li>
                    <button
                      className="fr-btn"
                      onClick={() => {
                        void navigator.clipboard.writeText(adresseDuQuestionnaire).then(() => {
                          setAnnonce('Lien copié')
                        })
                      }}
                      type="button"
                    >
                      Copier le lien
                    </button>
                  </li>
                  <li>
                    <a
                      className="fr-btn fr-btn--secondary"
                      href={adresseDuQuestionnaire}
                      rel="noopener noreferrer"
                      target="_blank"
                      title="Faire répondre quelqu’un - nouvel onglet"
                    >
                      Faire répondre quelqu’un
                    </a>
                  </li>
                </ul>
                <p className="fr-sr-only" role="status">
                  {annonce}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section aria-labelledby={titrePapier} className="fr-col-12 fr-col-md-6">
          <div className="fr-card">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h3 className="fr-card__title" id={titrePapier}>
                  Questionnaire papier
                </h3>
                <p className="fr-card__desc">À imprimer et remettre en main propre</p>
                <div className="fr-card__end">
                  <p>
                    Pour les personnes sans appareil ou qui préfèrent le papier. Vous saisissez ensuite les réponses
                    dans l’outil.
                  </p>
                  <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                    Le questionnaire à imprimer sera disponible prochainement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

type Props = Readonly<{
  viewModel: VotreCampagneViewModel
}>
