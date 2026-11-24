'use client'

import { createContext, PropsWithChildren, ReactElement, use, useId, useState } from 'react'

import styles from './InformationDepliable.module.css'

// RGAA 7.3 et 10.13 (#2350) : le « i » est un bouton qui déplie son texte dans la page (motif « divulgation » de
// l'APG), sous la ligne qui le porte, au lieu d'une infobulle qui recouvre le contenu et ne s'ouvre pas au clavier.
// Bouton natif : Entrée et Espace ouvrent et ferment ; le texte reste affiché tant qu'on ne le referme pas.
// Le bouton et le texte sont deux morceaux, placés par l'appelant : le texte ne peut aller ni dans un titre ni dans
// un paragraphe. Cet élément ne rend aucune balise : il relie les deux morceaux et porte l'état ouvert ou fermé,
// piloté par React seul (aria-expanded, texte rendu ou non).
export default function InformationDepliable({ children }: Readonly<PropsWithChildren>): ReactElement {
  const idTexte = useId()
  const [estOuvert, setEstOuvert] = useState(false)

  return (
    <InformationContext
      value={{
        basculer() {
          setEstOuvert(!estOuvert)
        },
        estOuvert,
        idTexte,
      }}
    >
      {children}
    </InformationContext>
  )
}

export function BoutonInformation({ libelle }: BoutonProps): ReactElement {
  const { basculer, estOuvert, idTexte } = useInformationDepliable()

  return (
    <button
      aria-controls={idTexte}
      aria-expanded={estOuvert}
      className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-information-line fr-ml-1v"
      onClick={basculer}
      type="button"
    >
      {libelle}
    </button>
  )
}

export function TexteInformation({ children }: Readonly<PropsWithChildren>): null | ReactElement {
  const { estOuvert, idTexte } = useInformationDepliable()

  if (!estOuvert) {
    return null
  }

  // Texte d'aide discret, comme l'infobulle qu'il remplace : petit corps, gris « mention » du DSFR
  return (
    <div className="fr-text--sm fr-text--regular fr-text-mention--grey fr-mb-0 fr-pt-1w" id={idTexte}>
      {children}
    </div>
  )
}

export function useInformationDepliable(): InformationDepliableEtat {
  const etat = use(InformationContext)

  if (etat === null) {
    throw new Error('Le bouton et le texte d’information doivent être placés dans un InformationDepliable')
  }

  return etat
}

// Titre suivi de son « i » : le bouton n'est plus dans le titre (nom du titre sans « Plus d'information… »,
// RGAA 9.1), mais reste sur sa dernière ligne, comme avant
export const titreSuiviDuBouton = styles['titre-suivi-du-bouton']

const InformationContext = createContext<InformationDepliableEtat | null>(null)

type InformationDepliableEtat = Readonly<{
  basculer(): void
  estOuvert: boolean
  idTexte: string
}>

type BoutonProps = Readonly<{
  // Nom accessible du bouton, ex. « Plus d'information sur l'indice de fragilité numérique »
  libelle: string
}>
