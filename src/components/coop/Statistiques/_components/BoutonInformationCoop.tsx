import { useInformationDepliable } from '@/components/shared/Information/InformationDepliable'

// MIN (#2350) : même bouton qui déplie son texte que BoutonInformation, avec l'apparence d'origine de la Coop (icône
// Remix ri-information-line agrandie, marges propres à chaque emplacement). Nom accessible en texte masqué plutôt
// qu'en attribut title, qui ajoutait la bulle du navigateur à l'infobulle.
export function BoutonInformationCoop({ className, libelle }: { className: string; libelle: string }) {
  const { basculer, estOuvert, idTexte } = useInformationDepliable()

  return (
    <button
      aria-controls={idTexte}
      aria-expanded={estOuvert}
      className={`fr-btn fr-btn--tertiary-no-outline fr-btn--sm ${className}`}
      onClick={basculer}
      type="button"
    >
      <span className="ri-information-line fr-text--lg" aria-hidden />
      <span className="fr-sr-only">{libelle}</span>
    </button>
  )
}
