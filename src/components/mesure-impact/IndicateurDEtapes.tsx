import { ReactElement } from 'react'

import { Partie } from '@/domain/mesure-impact/Questionnaire'

// Indicateur d'étape : l'état est dit en texte, les icônes sont décoratives. Les parties terminées sont des
// tags cliquables (couleur de tag DSFR) ; les autres ne le sont pas, leurs couleurs viennent des utilitaires DSFR.
export default function IndicateurDEtapes({ onAllerALaPartie, partieCourante, parties }: Props): ReactElement {
  return (
    <ol aria-label="Étapes du questionnaire" className="fr-tags-group fr-mb-2w">
      {parties.map((candidate, index) => (
        <li key={candidate.code}>
          {index < partieCourante ? (
            <button
              className={ETAPES.terminee.classes}
              onClick={() => {
                onAllerALaPartie(candidate.code)
              }}
              type="button"
            >
              {candidate.libelle}
              <span className="fr-sr-only"> ({ETAPES.terminee.etat})</span>
            </button>
          ) : (
            <p
              aria-current={index === partieCourante ? 'step' : undefined}
              className={ETAPES[etatEtape(index, partieCourante)].classes}
            >
              {candidate.libelle}
              <span className="fr-sr-only"> ({ETAPES[etatEtape(index, partieCourante)].etat})</span>
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

const ETAPES: Readonly<Record<EtatEtape, Readonly<{ classes: string; etat: string }>>> = {
  aVenir: { classes: 'fr-tag fr-text-mention--grey', etat: 'à venir' },
  enCours: {
    classes:
      'fr-tag fr-tag--icon-left fr-icon-arrow-right-line fr-background-action-low--blue-france fr-text-action-high--blue-france',
    etat: 'en cours',
  },
  terminee: {
    classes: 'fr-tag fr-tag--icon-left fr-icon-check-line fr-tag--green-emeraude',
    etat: 'terminée',
  },
}

function etatEtape(index: number, partieCourante: number): EtatEtape {
  if (index < partieCourante) {
    return 'terminee'
  }
  return index === partieCourante ? 'enCours' : 'aVenir'
}

type EtatEtape = 'aVenir' | 'enCours' | 'terminee'

type Props = Readonly<{
  onAllerALaPartie(code: string): void
  partieCourante: number
  parties: ReadonlyArray<Partie>
}>
