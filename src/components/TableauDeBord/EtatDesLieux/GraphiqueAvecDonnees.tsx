'use client'

import { ReactElement, ReactNode, useState } from 'react'

// Motif « graphique ou tableau » : un contrôle segmenté DSFR bascule entre le graphique et le tableau de ses données.
export default function GraphiqueAvecDonnees({
  entete,
  graphique,
  idTableau,
  nomVueGraphique,
  tableau,
  titre,
}: Props): ReactElement {
  const [vue, setVue] = useState<'graphique' | 'tableau'>('graphique')

  return (
    <>
      <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {entete}
        <fieldset className="fr-segmented fr-segmented--sm fr-segmented--no-legend fr-mx-2w">
          <legend className="fr-segmented__legend">Affichage de {titre}</legend>
          <div className="fr-segmented__elements">
            {(
              [
                ['graphique', nomVueGraphique],
                ['tableau', 'Tableau'],
              ] as const
            ).map(([valeur, libelle]) => (
              <div className="fr-segmented__element" key={valeur}>
                <input
                  checked={vue === valeur}
                  id={`${idTableau}-vue-${valeur}`}
                  name={`${idTableau}-vue`}
                  onChange={() => {
                    setVue(valeur)
                  }}
                  type="radio"
                  value={valeur}
                />
                <label className="fr-label" htmlFor={`${idTableau}-vue-${valeur}`}>
                  {libelle}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      {/* La carte reste montée (masquée) pour ne pas réinitialiser MapLibre à chaque bascule */}
      <div
        hidden={vue !== 'graphique'}
        style={{ display: vue === 'graphique' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}
      >
        {graphique}
      </div>
      {vue === 'tableau' ? (
        <div className="fr-px-md-2w fr-pb-2w" id={idTableau}>
          {tableau}
        </div>
      ) : null}
    </>
  )
}

type Props = Readonly<{
  entete: ReactNode
  graphique: ReactNode
  idTableau: string
  nomVueGraphique: string
  tableau: ReactNode
  titre: string
}>
