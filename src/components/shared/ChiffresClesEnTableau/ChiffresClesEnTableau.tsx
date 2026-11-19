import { ReactElement, ReactNode } from 'react'

// Alternative textuelle des graphiques d'un bloc (RGAA 1.6, 3.1) : un accordéon DSFR fermé, placé sous les
// graphiques, qui donne leurs données en tableau. Avec plusieurs graphiques, un onglet DSFR par graphique.
// L'ouverture et le changement d'onglet sont gérés par le JS du DSFR, comme pour tout accordéon ou onglet canonique.
export default function ChiffresClesEnTableau({ id, onglets }: Props): ReactElement {
  const idContenu = `${id}-contenu`

  return (
    <section className="fr-accordion">
      <h3 className="fr-accordion__title">
        <button aria-controls={idContenu} aria-expanded="false" className="fr-accordion__btn" type="button">
          Chiffres clés en tableau
        </button>
      </h3>
      <div className="fr-collapse" id={idContenu}>
        {onglets.length === 1 ? (
          onglets[0].contenu
        ) : (
          <div className="fr-tabs">
            <ul aria-label="Chiffres clés en tableau" className="fr-tabs__list" role="tablist">
              {onglets.map((onglet, index) => (
                <li key={onglet.titre} role="presentation">
                  <button
                    aria-controls={`${id}-panneau-${index}`}
                    aria-selected={index === 0}
                    className="fr-tabs__tab"
                    id={`${id}-onglet-${index}`}
                    role="tab"
                    tabIndex={index === 0 ? 0 : -1}
                    type="button"
                  >
                    {onglet.titre}
                  </button>
                </li>
              ))}
            </ul>
            {onglets.map((onglet, index) => (
              <div
                aria-labelledby={`${id}-onglet-${index}`}
                className={`fr-tabs__panel${index === 0 ? ' fr-tabs__panel--selected' : ''}`}
                id={`${id}-panneau-${index}`}
                key={onglet.titre}
                role="tabpanel"
                tabIndex={0}
              >
                {onglet.contenu}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export type OngletChiffresCles = Readonly<{
  contenu: ReactNode
  titre: string
}>

type Props = Readonly<{
  id: string
  onglets: ReadonlyArray<OngletChiffresCles>
}>
