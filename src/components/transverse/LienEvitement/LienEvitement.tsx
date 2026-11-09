import { ReactElement } from 'react'

// Le 2ᵉ lien vise le menu propre à chaque site : le menu utilisateur de l'application connectée par défaut,
// le menu principal pour la vitrine, qui n'a pas de menu utilisateur (RGAA 12.7 : la cible doit exister).
export default function LienEvitement({ menu = menuUtilisateur }: Props): ReactElement {
  return (
    <div className="fr-skiplinks">
      <nav aria-label="Accès rapide" className="fr-container">
        <ul className="fr-skiplinks__list">
          <li>
            <a className="fr-link" href="#content">
              Contenu
            </a>
          </li>
          <li>
            <a className="fr-link" href={`#${menu.ancre}`}>
              {menu.libelle}
            </a>
          </li>
          <li>
            <a className="fr-link" href="#footer">
              Pied de page
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export const menuPrincipalVitrine: CibleMenu = { ancre: 'navigation', libelle: 'Menu' }

const menuUtilisateur: CibleMenu = { ancre: 'menuUtilisateur', libelle: 'Menu utilisateur' }

type CibleMenu = Readonly<{
  ancre: string
  libelle: string
}>

type Props = Readonly<{
  menu?: CibleMenu
}>
