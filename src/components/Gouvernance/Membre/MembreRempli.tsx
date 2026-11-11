'use client'

import Link from 'next/link'
import { Fragment, ReactElement, useEffect, useRef } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Icon from '@/components/shared/Icon/Icon'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

// Tableau DSFR multiligne à toutes les largeurs (#2246, RGAA 10.4, 10.11, 10.12) : les noms passent à la ligne,
// le type et le rôle restent visibles en mobile. Quand la place manque, le tableau défile dans son propre cadre
// (exception « tableau de données » du critère 10.11). Largeurs minimales des colonnes : fr-col--md / fr-col--sm.
export default function MembreRempli({ coporteurs }: Props): ReactElement {
  const cadre = useRef<HTMLDivElement>(null)

  // Le cadre n'est atteignable au clavier (flèches pour le faire défiler) que lorsqu'il défile réellement,
  // pour ne pas ajouter d'arrêt de tabulation inutile en bureau
  useEffect(() => {
    const element = cadre.current
    if (element === null) {
      return undefined
    }
    rendreFocalisableSiDefilant(element)
    const observateur = new ResizeObserver(() => {
      rendreFocalisableSiDefilant(element)
    })
    observateur.observe(element)
    return () => {
      observateur.disconnect()
    }
  }, [])

  return (
    <div className="fr-table fr-table--multiline fr-table--no-caption fr-mb-0">
      <div className="fr-table__wrapper">
        <div aria-label="Membres de la gouvernance" className="fr-table__container" ref={cadre} role="region">
          <div className="fr-table__content">
            <table>
              <caption>Membres de la gouvernance</caption>
              <thead>
                <tr>
                  <th className="fr-col--md" scope="col">
                    Nom
                  </th>
                  <th className="fr-col--md" scope="col">
                    Type
                  </th>
                  <th className="fr-col--sm" scope="col">
                    Rôle
                  </th>
                </tr>
              </thead>
              <tbody>
                {coporteurs.map((membre) => {
                  const rolesAffiches = membre.roles.filter((role) => role.nom !== 'Observateur')
                  return (
                    <tr key={`${membre.nom}_${membre.type}`}>
                      <td>
                        <Icon classname="color-blue-france fr-mr-1w" icon={membre.logo} />
                        {membre.plusDetailsHref === undefined ? (
                          <span className="primary font-weight-700">{membre.nom}</span>
                        ) : (
                          <Link className="primary font-weight-700 fr-px-0 no-hover" href={membre.plusDetailsHref}>
                            {membre.nom}
                          </Link>
                        )}
                      </td>
                      <td className="color-grey">{membre.type}</td>
                      <td>
                        {rolesAffiches.map((role) => (
                          <Fragment key={role.nom}>
                            <Badge color={role.color}>{role.nom}</Badge>{' '}
                          </Fragment>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function rendreFocalisableSiDefilant(element: HTMLDivElement): void {
  if (element.scrollWidth > element.clientWidth) {
    element.setAttribute('tabindex', '0')
  } else {
    element.removeAttribute('tabindex')
  }
}

type Props = Readonly<{
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
}>
